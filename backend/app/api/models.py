from fastapi import APIRouter

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("")
def list_available_models():
    """Returns the specialist model catalog supported by SatQuery AI."""
    return {
        "models": [
            {
                "id": "GeoChat",
                "name": "GeoChat-7B",
                "type": "Visual Question Answering & Grounded Reasoning",
                "description": "Fine-tuned remote-sensing multimodal LLM for high-resolution satellite imagery interpretation.",
                "supported_modalities": ["optical", "multispectral"],
                "status": "ready"
            },
            {
                "id": "ChangeChat",
                "name": "ChangeChat / LEVIR-CC",
                "type": "Bi-Temporal Change Detection",
                "description": "Specialized dual-acquisition cross-attention network for urban expansion, deforestation, and disaster damage.",
                "supported_modalities": ["temporal_pre", "temporal_post"],
                "status": "ready"
            },
            {
                "id": "Qwen2.5-VL",
                "name": "Qwen2.5-VL Remote Sensing",
                "type": "Multimodal Vision-Language Agent",
                "description": "Generalist reasoning agent for optical-radar fusion and complex geospatial instructions.",
                "supported_modalities": ["optical", "sar", "multispectral"],
                "status": "ready"
            },
            {
                "id": "InternVL3",
                "name": "InternVL3-Geospatial",
                "type": "Ultra-High-Resolution Feature Extraction",
                "description": "Document, flight telemetry, and sub-meter aerial survey analyzer.",
                "supported_modalities": ["pdf", "optical"],
                "status": "ready"
            }
        ]
    }
