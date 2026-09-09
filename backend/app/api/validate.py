from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Attachment
from app.storage.storage_provider import storage
from app.geospatial.validator import GeospatialValidator

router = APIRouter(prefix="/validate", tags=["Validate"])

@router.post("/{attachment_id}")
def validate_attachment(attachment_id: str, db: Session = Depends(get_db)):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    abs_path = storage.get_absolute_path(attachment.storage_path)
    if not abs_path.exists():
        raise HTTPException(status_code=404, detail="File missing from storage")

    try:
        metadata = GeospatialValidator.validate_file(abs_path, attachment.filename)
        attachment.metadata_json = metadata
        db.commit()
        return {
            "valid": True,
            "attachment_id": attachment.id,
            "filename": attachment.filename,
            "metadata": metadata
        }
    except Exception as e:
        return {
            "valid": False,
            "attachment_id": attachment.id,
            "error": str(e)
        }
