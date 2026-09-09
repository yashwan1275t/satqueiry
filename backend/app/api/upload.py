from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.config import settings
from app.database.session import get_db
from app.database.models import Attachment
from app.schemas.schemas import AttachmentResponse
from app.storage.storage_provider import storage
from app.geospatial.validator import GeospatialValidator, FileValidationError

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("", response_model=AttachmentResponse)
async def upload_file(
    file: UploadFile = File(...),
    chat_id: Optional[str] = Form(None),
    modality_hint: Optional[str] = Form(None),  # "optical", "sar", "temporal_pre", "temporal_post", "pdf", "zip"
    db: Session = Depends(get_db)
):
    original_filename = file.filename or "uploaded_file"
    ext = Path(original_filename).suffix.lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
        )

    # Save to storage temporarily to validate
    subfolder = chat_id or "general"
    storage_id, rel_path, file_size = storage.save_file(file.file, original_filename, subfolder=subfolder)

    if file_size > settings.UPLOAD_MAX_BYTES:
        storage.delete(rel_path)
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.UPLOAD_MAX_BYTES // (1024 * 1024)}MB"
        )

    abs_path = storage.get_absolute_path(rel_path)

    # Perform security and geospatial validation
    try:
        metadata = GeospatialValidator.validate_file(abs_path, original_filename)
    except FileValidationError as e:
        storage.delete(rel_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        storage.delete(rel_path)
        raise HTTPException(status_code=500, detail=f"Error inspecting uploaded file: {str(e)}")

    # Classify file_type
    detected_fmt = metadata.get("format", "unknown")
    if modality_hint:
        file_type = modality_hint
    elif detected_fmt in ["tiff", "png", "jpeg"]:
        file_type = "optical"
    elif detected_fmt == "pdf":
        file_type = "pdf"
    elif detected_fmt == "zip":
        file_type = "zip"
    else:
        file_type = "imagery"

    # Save attachment record
    attachment = Attachment(
        id=storage_id,
        chat_id=chat_id,
        filename=original_filename,
        file_type=file_type,
        mime_type=file.content_type or f"image/{ext.lstrip('.')}",
        file_size=file_size,
        storage_path=rel_path,
        metadata_json=metadata
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return AttachmentResponse(
        id=attachment.id,
        chat_id=attachment.chat_id,
        filename=attachment.filename,
        file_type=attachment.file_type,
        mime_type=attachment.mime_type,
        file_size=attachment.file_size,
        storage_path=attachment.storage_path,
        url=f"/storage/{attachment.storage_path}",
        metadata=attachment.metadata_json or {},
        created_at=attachment.created_at
    )
