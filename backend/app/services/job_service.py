import asyncio
import datetime
from typing import Any, Optional
from sqlalchemy.orm import Session
from app.database.models import AnalysisJob, AnalysisResult, ChatMessage
from app.schemas.schemas import AIAnalyzeRequest, AIInputItem
from app.services.ai_service import AIService

class JobManager:
    def __init__(self):
        # Maps job_id -> asyncio.Task
        self.active_tasks: dict[str, asyncio.Task] = {}
        # Maps job_id -> list of asyncio.Queue for SSE listeners
        self.subscribers: dict[str, list[asyncio.Queue]] = {}
        # Cancellation flags
        self.cancellation_flags: dict[str, bool] = {}

    def subscribe(self, job_id: str) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        if job_id not in self.subscribers:
            self.subscribers[job_id] = []
        self.subscribers[job_id].append(q)
        return q

    def unsubscribe(self, job_id: str, q: asyncio.Queue):
        if job_id in self.subscribers:
            if q in self.subscribers[job_id]:
                self.subscribers[job_id].remove(q)
            if not self.subscribers[job_id]:
                del self.subscribers[job_id]

    async def broadcast(self, job_id: str, data: dict[str, Any]):
        if job_id in self.subscribers:
            for q in list(self.subscribers[job_id]):
                await q.put(data)

    def cancel_job(self, db: Session, job_id: str) -> bool:
        self.cancellation_flags[job_id] = True
        
        # If an active asyncio task is running, cancel it
        task = self.active_tasks.get(job_id)
        if task and not task.done():
            task.cancel()

        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = "CANCELLED"
            job.current_step = "Analysis halted by user"
            job.updated_at = datetime.datetime.now(datetime.timezone.utc)
            job.completed_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()

            # Broadcast cancellation
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self.broadcast(job_id, {
                    "job_id": job_id,
                    "status": "CANCELLED",
                    "current_step": "Analysis halted by user",
                    "progress": job.progress
                }))
            except RuntimeError:
                pass
            return True
        return False

    async def run_analysis_pipeline(
        self,
        db_factory,
        job_id: str,
        chat_id: str,
        message_id: str,
        query: str,
        attachments_info: list[dict[str, Any]]
    ):
        steps = [
            ("VALIDATING", "Validating imagery & format integrity", 0.15, 0.4),
            ("PREPROCESSING", "Radiometric calibration & CRS alignment", 0.30, 0.5),
            ("PLANNING", "Query classification & model routing", 0.45, 0.4),
            ("RUNNING_MODEL", "Running specialist remote-sensing vision backbone", 0.70, 0.7),
            ("GENERATING_EVIDENCE", "Generating spatial masks & bounding coordinates", 0.85, 0.5),
            ("CALCULATING_CONFIDENCE", "Calculating composite confidence & rigorous checks", 0.95, 0.4)
        ]

        self.cancellation_flags[job_id] = False

        try:
            for status, step_label, progress_val, sleep_dur in steps:
                # Check cancellation token
                if self.cancellation_flags.get(job_id, False):
                    raise asyncio.CancelledError()

                # Update DB
                with db_factory() as db:
                    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                    if job:
                        job.status = status
                        job.current_step = step_label
                        job.progress = progress_val
                        job.updated_at = datetime.datetime.now(datetime.timezone.utc)
                        db.commit()

                # Broadcast to SSE
                await self.broadcast(job_id, {
                    "job_id": job_id,
                    "status": status,
                    "current_step": step_label,
                    "progress": progress_val
                })

                await asyncio.sleep(sleep_dur)

            # Build standard AI contract request
            ai_inputs = [
                AIInputItem(
                    id=att.get("id", ""),
                    type=att.get("file_type", "optical"),
                    location=att.get("storage_path", ""),
                    metadata=att.get("metadata", {})
                )
                for att in attachments_info
            ]
            ai_req = AIAnalyzeRequest(
                chat_id=chat_id,
                query=query,
                inputs=ai_inputs
            )

            # Invoke AI Service
            ai_resp = await AIService.analyze(ai_req)

            # Save completed result to DB
            with db_factory() as db:
                job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if job:
                    job.status = "COMPLETED"
                    job.current_step = "Analysis successfully generated"
                    job.progress = 1.0
                    job.updated_at = datetime.datetime.now(datetime.timezone.utc)
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)

                    result_record = AnalysisResult(
                        job_id=job.id,
                        task=ai_resp.task,
                        answer=ai_resp.answer,
                        confidence=ai_resp.confidence,
                        models=ai_resp.models,
                        tools=ai_resp.tools,
                        evidence=[e.model_dump() for e in ai_resp.evidence],
                        execution_trace=[t.model_dump() for t in ai_resp.execution_trace],
                        warnings=ai_resp.warnings,
                        metadata_json=ai_resp.metadata
                    )
                    db.add(result_record)

                    # Update Assistant message content if empty
                    assistant_msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
                    if assistant_msg:
                        assistant_msg.content = ai_resp.answer

                    db.commit()

            # Broadcast final completion
            await self.broadcast(job_id, {
                "job_id": job_id,
                "status": "COMPLETED",
                "current_step": "Analysis complete",
                "progress": 1.0,
                "result": ai_resp.model_dump()
            })

        except asyncio.CancelledError:
            with db_factory() as db:
                job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if job and job.status != "CANCELLED":
                    job.status = "CANCELLED"
                    job.current_step = "Analysis cancelled by user"
                    job.updated_at = datetime.datetime.now(datetime.timezone.utc)
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()

            await self.broadcast(job_id, {
                "job_id": job_id,
                "status": "CANCELLED",
                "current_step": "Analysis cancelled by user",
                "progress": 0.0
            })

        except Exception as e:
            with db_factory() as db:
                job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if job:
                    job.status = "FAILED"
                    job.current_step = "Analysis failed"
                    job.error_message = str(e)
                    job.updated_at = datetime.datetime.now(datetime.timezone.utc)
                    job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()

            await self.broadcast(job_id, {
                "job_id": job_id,
                "status": "FAILED",
                "current_step": "Analysis failed",
                "error": str(e)
            })

        finally:
            if job_id in self.active_tasks:
                del self.active_tasks[job_id]
            if job_id in self.cancellation_flags:
                del self.cancellation_flags[job_id]

job_manager = JobManager()
