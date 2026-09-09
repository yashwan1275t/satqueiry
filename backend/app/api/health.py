import datetime
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "storage_dir": str(settings.STORAGE_DIR),
        "mock_ai_mode": settings.USE_MOCK_AI
    }
