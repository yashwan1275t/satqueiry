from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import AnalysisJob, AnalysisResult, ChatSession, ChatMessage
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{job_id}/download")
def download_pdf_report(job_id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = db.query(AnalysisResult).filter(AnalysisResult.job_id == job_id).first()
    if not result:
        raise HTTPException(status_code=400, detail="Job has not produced analysis results yet")

    chat = db.query(ChatSession).filter(ChatSession.id == job.chat_id).first()
    chat_title = chat.title if chat else "Satellite Analysis"

    # Find the user query that triggered this job
    user_query = "Remote sensing analysis"
    if job.message and job.message.chat:
        for m in job.message.chat.messages:
            if m.role == "user" and m.created_at <= job.created_at:
                user_query = m.content

    result_data = {
        "task": result.task,
        "answer": result.answer,
        "confidence": result.confidence,
        "models": result.models,
        "tools": result.tools,
        "evidence": result.evidence,
        "execution_trace": result.execution_trace,
        "warnings": result.warnings,
        "metadata": result.metadata_json
    }

    pdf_path = ReportService.generate_pdf_report(
        job_id=job_id,
        chat_title=chat_title,
        query=user_query,
        result_data=result_data
    )

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=pdf_path.name
    )
