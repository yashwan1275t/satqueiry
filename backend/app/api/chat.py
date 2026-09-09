import asyncio
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db, SessionLocal
from app.database.models import ChatSession, ChatMessage, Attachment, AnalysisJob, AnalysisResult
from app.schemas.schemas import (
    ChatCreateRequest,
    ChatRenameRequest,
    ChatMessageCreate,
    ChatSessionResponse,
    ChatDetailResponse,
    ChatMessageResponse
)
from app.services.job_service import job_manager

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatSessionResponse)
def create_chat(payload: ChatCreateRequest, db: Session = Depends(get_db)):
    session = ChatSession(title=payload.title or "New Satellite Query")
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages_count=0
    )

@router.get("", response_model=list[ChatSessionResponse])
def list_chats(db: Session = Depends(get_db)):
    chats = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
    results = []
    for c in chats:
        count = len(c.messages)
        results.append(ChatSessionResponse(
            id=c.id,
            title=c.title,
            created_at=c.created_at,
            updated_at=c.updated_at,
            messages_count=count
        ))
    return results

@router.get("/{chat_id}", response_model=ChatDetailResponse)
def get_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages_data = []
    for m in chat.messages:
        # Check if message has associated job/result
        job = db.query(AnalysisJob).filter(AnalysisJob.message_id == m.id).first()
        job_id = job.id if job else None
        result_dict = None
        if job and job.result:
            result_dict = {
                "task": job.result.task,
                "answer": job.result.answer,
                "confidence": job.result.confidence,
                "models": job.result.models,
                "tools": job.result.tools,
                "evidence": job.result.evidence,
                "execution_trace": job.result.execution_trace,
                "warnings": job.result.warnings,
                "metadata": job.result.metadata_json,
                "status": job.status
            }
        elif job:
            result_dict = {
                "status": job.status,
                "current_step": job.current_step,
                "progress": job.progress
            }

        messages_data.append(ChatMessageResponse(
            id=m.id,
            chat_id=m.chat_id,
            role=m.role,
            content=m.content,
            attachments=m.attachments or [],
            created_at=m.created_at,
            job_id=job_id,
            result=result_dict
        ))

    return ChatDetailResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=messages_data
    )

@router.patch("/{chat_id}", response_model=ChatSessionResponse)
def rename_chat(chat_id: str, payload: ChatRenameRequest, db: Session = Depends(get_db)):
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = payload.title
    chat.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(chat)
    return ChatSessionResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages_count=len(chat.messages)
    )

@router.delete("/{chat_id}")
def delete_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully", "id": chat_id}

@router.post("/message")
async def send_message(payload: ChatMessageCreate, db: Session = Depends(get_db)):
    chat = db.query(ChatSession).filter(ChatSession.id == payload.chat_id).first()
    if not chat:
        # Auto-create chat if not exists
        chat = ChatSession(id=payload.chat_id, title="New Satellite Query")
        db.add(chat)
        db.commit()
        db.refresh(chat)

    # Automatically derive title if this is the first query or title is default
    if chat.title == "New Satellite Query" or not chat.messages:
        clean_title = payload.message.strip()
        if len(clean_title) > 35:
            clean_title = clean_title[:32] + "..."
        chat.title = clean_title or "Satellite Analysis"

    # Fetch attachments info
    attachments_info = []
    if payload.attachments:
        atts = db.query(Attachment).filter(Attachment.id.in_(payload.attachments)).all()
        for a in atts:
            attachments_info.append({
                "id": a.id,
                "filename": a.filename,
                "file_type": a.file_type,
                "file_size": a.file_size,
                "storage_path": a.storage_path,
                "metadata": a.metadata_json or {}
            })

    # 1. Create User Message
    user_msg_id = str(uuid.uuid4())
    user_msg = ChatMessage(
        id=user_msg_id,
        chat_id=chat.id,
        role="user",
        content=payload.message,
        attachments=attachments_info
    )
    db.add(user_msg)
    
    # 2. Create Assistant Placeholder Message
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg = ChatMessage(
        id=assistant_msg_id,
        chat_id=chat.id,
        role="assistant",
        content="",  # Will be populated as job streams/completes
        attachments=[]
    )
    db.add(assistant_msg)
    
    # 3. Create Analysis Job
    job = AnalysisJob(
        id=str(uuid.uuid4()),
        chat_id=chat.id,
        message_id=assistant_msg_id,
        status="QUEUED",
        progress=0.0,
        current_step="Initializing remote-sensing reasoning pipeline"
    )
    db.add(job)
    
    chat.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(job)

    # Spawn async job pipeline in background
    task = asyncio.create_task(
        job_manager.run_analysis_pipeline(
            db_factory=SessionLocal,
            job_id=job.id,
            chat_id=chat.id,
            message_id=assistant_msg.id,
            query=payload.message,
            attachments_info=attachments_info
        )
    )
    job_manager.active_tasks[job.id] = task

    return {
        "job_id": job.id,
        "chat_id": chat.id,
        "user_message_id": user_msg.id,
        "assistant_message_id": assistant_msg.id,
        "status": "QUEUED"
    }
