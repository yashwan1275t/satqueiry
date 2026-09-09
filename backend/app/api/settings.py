from fastapi import APIRouter
from app.schemas.schemas import SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

# In-memory settings state (can be extended to DB or redis)
current_settings = {
    "theme": "dark",
    "default_model": "GeoChat",
    "auto_detect_modality": True,
    "confidence_threshold": 0.5,
    "custom_agent_url": "http://localhost:8001/ai/v1/analyze",
    "use_custom_agent": False
}

@router.get("", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(**current_settings)

@router.patch("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate):
    if payload.theme is not None:
        current_settings["theme"] = payload.theme
    if payload.default_model is not None:
        current_settings["default_model"] = payload.default_model
    if payload.auto_detect_modality is not None:
        current_settings["auto_detect_modality"] = payload.auto_detect_modality
    if payload.confidence_threshold is not None:
        current_settings["confidence_threshold"] = payload.confidence_threshold
    if payload.custom_agent_url is not None:
        current_settings["custom_agent_url"] = payload.custom_agent_url
    if payload.use_custom_agent is not None:
        current_settings["use_custom_agent"] = payload.use_custom_agent
    return SettingsResponse(**current_settings)
