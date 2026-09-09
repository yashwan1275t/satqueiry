import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import AnalysisJob
from app.schemas.schemas import JobStatusResponse, JobCancelResponse
from app.services.job_service import job_manager

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")

    result_dict = None
    if job.result:
        result_dict = {
            "task": job.result.task,
            "answer": job.result.answer,
            "confidence": job.result.confidence,
            "models": job.result.models,
            "tools": job.result.tools,
            "evidence": job.result.evidence,
            "execution_trace": job.result.execution_trace,
            "warnings": job.result.warnings,
            "metadata": job.result.metadata_json
        }

    return JobStatusResponse(
        job_id=job.id,
        chat_id=job.chat_id,
        status=job.status,
        progress=job.progress,
        current_step=job.current_step,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
        result=result_dict
    )

@router.post("/{job_id}/cancel", response_model=JobCancelResponse)
def cancel_job(job_id: str, db: Session = Depends(get_db)):
    cancelled = job_manager.cancel_job(db, job_id)
    if not cancelled:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.status in ["COMPLETED", "CANCELLED", "FAILED"]:
            return JobCancelResponse(
                job_id=job.id,
                status=job.status,
                message=f"Job is already in {job.status} state"
            )

    return JobCancelResponse(
        job_id=job_id,
        status="CANCELLED",
        message="Analysis job cancellation requested and recorded"
    )

@router.get("/{job_id}/stream")
async def stream_job_events(job_id: str, request: Request, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    queue = job_manager.subscribe(job_id)

    async def event_generator():
        try:
            # Send initial current status
            initial_data = {
                "job_id": job.id,
                "status": job.status,
                "current_step": job.current_step,
                "progress": job.progress
            }
            if job.result:
                initial_data["result"] = {
                    "task": job.result.task,
                    "answer": job.result.answer,
                    "confidence": job.result.confidence,
                    "models": job.result.models,
                    "evidence": job.result.evidence,
                    "execution_trace": job.result.execution_trace,
                    "warnings": job.result.warnings
                }
            yield f"data: {json.dumps(initial_data)}\n\n"

            if job.status in ["COMPLETED", "CANCELLED", "FAILED"]:
                return

            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait for next event with 15s heartbeat
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(data)}\n\n"
                    if data.get("status") in ["COMPLETED", "CANCELLED", "FAILED"]:
                        break
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat comment
                    yield ": ping\n\n"
        finally:
            job_manager.unsubscribe(job_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
