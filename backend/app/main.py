from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import init_db
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router
from app.api.validate import router as validate_router
from app.api.analyze import router as analyze_router
from app.api.jobs import router as jobs_router
from app.api.results import router as results_router
from app.api.evidence import router as evidence_router
from app.api.reports import router as reports_router
from app.api.models import router as models_router
from app.api.settings import router as settings_router
from app.api.health import router as health_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Research-grade AI Web Application and API for Satellite Imagery Intelligence (SatQuery AI)",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage for serving uploaded satellite images, previews, and PDF reports
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

# Include Routers under /api/v1
api_v1_routers = [
    chat_router,
    upload_router,
    validate_router,
    analyze_router,
    jobs_router,
    results_router,
    evidence_router,
    reports_router,
    models_router,
    settings_router,
    health_router
]

for router in api_v1_routers:
    app.include_router(router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API Layer",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_PREFIX}/health"
    }
