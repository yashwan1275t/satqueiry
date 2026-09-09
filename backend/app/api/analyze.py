import asyncio
import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db, SessionLocal
from app.database.models import ChatSession, ChatMessage, AnalysisJob
from app.schemas.schemas import AIAnalyzeRequest
from app.services.job_service import job_manager

router = APIRouter(prefix="/analyze", tags=["Analyze"])

@router.post("")
async def start_analysis(payload: AIAnalyzeRequest, db: Session = Depends(get_db)):
    chat = None
    if payload.chat_id:
        chat = db.query(ChatSession).filter(ChatSession.id == payload.chat_id).first()

    if not chat:
        chat_id = payload.chat_id or str(uuid.uuid4())
        chat = ChatSession(id=chat_id, title="Satellite Analysis")
        db.add(chat)
        db.commit()
        db.refresh(chat)

    # User message
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        chat_id=chat.id,
        role="user",
        content=payload.query,
        attachments=[item.model_dump() for item in payload.inputs]
    )
    db.add(user_msg)

    # Assistant message
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg = ChatMessage(
        id=assistant_msg_id,
        chat_id=chat.id,
        role="assistant",
        content="",
        attachments=[]
    )
    db.add(assistant_msg)

    # Analysis job
    job = AnalysisJob(
        id=str(uuid.uuid4()),
        chat_id=chat.id,
        message_id=assistant_msg_id,
        status="QUEUED",
        progress=0.0,
        current_step="Queued for analysis"
    )
    db.add(job)
    chat.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(job)

    # Convert inputs to dict
    attachments_info = [
        {
            "id": item.id,
            "file_type": item.type,
            "storage_path": item.location,
            "metadata": item.metadata
        }
        for item in payload.inputs
    ]

    task = asyncio.create_task(
        job_manager.run_analysis_pipeline(
            db_factory=SessionLocal,
            job_id=job.id,
            chat_id=chat.id,
            message_id=assistant_msg_id,
            query=payload.query,
            attachments_info=attachments_info
        )
    )
    job_manager.active_tasks[job.id] = task

    return {
        "job_id": job.id,
        "chat_id": chat.id,
        "status": "QUEUED"
    }
