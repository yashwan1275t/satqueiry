from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import AnalysisResult, AnalysisJob

router = APIRouter(prefix="/results", tags=["Results"])

@router.get("/{job_id}")
def get_analysis_result(job_id: str, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.job_id == job_id).first()
    if not result:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return {
            "status": job.status,
            "current_step": job.current_step,
            "progress": job.progress,
            "result": None
        }

    return {
        "job_id": result.job_id,
        "task": result.task,
        "answer": result.answer,
        "confidence": result.confidence,
        "models": result.models,
        "tools": result.tools,
        "evidence": result.evidence,
        "execution_trace": result.execution_trace,
        "warnings": result.warnings,
        "metadata": result.metadata_json,
        "created_at": result.created_at
    }
