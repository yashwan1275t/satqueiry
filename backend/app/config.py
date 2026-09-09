import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "SatQuery AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Storage
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_MAX_BYTES: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS: set[str] = {
        ".tif", ".tiff", ".png", ".jpg", ".jpeg", ".pdf", ".zip"
    }
    
    # Database (Default to SQLite for local development; can use PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'satquery.db'}"
    )
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # AI Engine
    USE_MOCK_AI: bool = True
    REAL_AI_SERVICE_URL: str = os.getenv("REAL_AI_SERVICE_URL", "http://localhost:8001/ai/v1/analyze")

    model_config = SettingsConfigDict(case_sensitive=True, extra="allow")

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
