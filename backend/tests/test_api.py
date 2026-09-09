import io
import zipfile
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import init_db
from app.services.report_service import ReportService

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SatQuery AI" in data["service"]

def test_models_catalog():
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    model_ids = [m["id"] for m in data["models"]]
    assert "GeoChat" in model_ids
    assert "ChangeChat" in model_ids

def test_settings_lifecycle():
    resp1 = client.get("/api/v1/settings")
    assert resp1.status_code == 200
    
    resp2 = client.patch("/api/v1/settings", json={"theme": "dark", "confidence_threshold": 0.65})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["theme"] == "dark"
    assert data2["confidence_threshold"] == 0.65

def test_chat_lifecycle():
    resp = client.post("/api/v1/chat", json={"title": "Test Satellite Analysis"})
    assert resp.status_code == 200
    chat_data = resp.json()
    chat_id = chat_data["id"]
    assert chat_data["title"] == "Test Satellite Analysis"

    list_resp = client.get("/api/v1/chat")
    assert list_resp.status_code == 200
    chats = list_resp.json()
    assert any(c["id"] == chat_id for c in chats)

    patch_resp = client.patch(f"/api/v1/chat/{chat_id}", json={"title": "Renamed Survey"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "Renamed Survey"

    get_resp = client.get(f"/api/v1/chat/{chat_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == chat_id

    del_resp = client.delete(f"/api/v1/chat/{chat_id}")
    assert del_resp.status_code == 200

def test_upload_image_validation():
    img = Image.new("RGB", (64, 64), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/v1/upload",
        files={"file": ("test_satellite.png", buf, "image/png")},
        data={"modality_hint": "optical"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_satellite.png"
    assert data["file_type"] == "optical"
    assert "metadata" in data
    assert data["metadata"]["width"] == 64

def test_upload_unsupported_file_rejected():
    buf = io.BytesIO(b"malicious script content")
    response = client.post(
        "/api/v1/upload",
        files={"file": ("malicious.exe", buf, "application/x-msdownload")}
    )
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()

def test_upload_zip_security():
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w") as zf:
        zf.writestr("scene_metadata.json", '{"satellite": "Sentinel-2"}')
    zip_buf.seek(0)

    response = client.post(
        "/api/v1/upload",
        files={"file": ("mission_archive.zip", zip_buf, "application/zip")},
        data={"modality_hint": "zip"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["file_type"] == "zip"
    assert data["metadata"]["total_files"] == 1

def test_chat_message_and_job_execution():
    chat_resp = client.post("/api/v1/chat", json={"title": "Change Detection Query"})
    chat_id = chat_resp.json()["id"]

    msg_resp = client.post(
        "/api/v1/chat/message",
        json={
            "chat_id": chat_id,
            "message": "Has the built-up area increased over the past year?",
            "attachments": []
        }
    )
    assert msg_resp.status_code == 200
    msg_data = msg_resp.json()
    assert "job_id" in msg_data
    job_id = msg_data["job_id"]

    status_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert status_resp.status_code == 200
    assert status_resp.json()["job_id"] == job_id

    cancel_resp = client.post(f"/api/v1/jobs/{job_id}/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"

def test_pdf_report_generation():
    pdf_path = ReportService.generate_pdf_report(
        job_id="test_job_12345",
        chat_title="Land Cover Analysis Test",
        query="Identify primary land classes",
        result_data={
            "task": "Land Cover VQA",
            "answer": "The scene contains 45% vegetation and 35% built-up surface.",
            "confidence": 0.93,
            "models": ["GeoChat"],
            "evidence": [{"label": "Built-up area", "type": "bbox", "confidence": 0.94, "coordinates": [0.1, 0.1, 0.4, 0.4]}],
            "execution_trace": [{"step": "Validation", "status": "completed", "duration_ms": 20, "detail": "OK"}],
            "warnings": []
        }
    )
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 1000

def test_custom_model_adapter_normalization():
    from app.services.custom_model_adapter import CustomModelAdapter
    from app.schemas.schemas import AIAnalyzeRequest, AIInputItem

    req = AIAnalyzeRequest(
        chat_id="test_chat",
        query="Analyze alpine snow cover",
        inputs=[AIInputItem(id="att1", type="optical", location="http://127.0.0.1:8000/storage/alpine.png")]
    )

    # Case 1: Plain string output from model
    str_resp = CustomModelAdapter.normalize_response("Snowpack coverage is estimated at 64.2%.", req)
    assert str_resp.answer == "Snowpack coverage is estimated at 64.2%."
    assert str_resp.confidence >= 0.9

    # Case 2: OpenAI / vLLM formatted response
    vllm_raw = {
        "choices": [{
            "message": {
                "role": "assistant",
                "content": "Comprehensive analysis of alpine snowpack: Glacier retreat observed at 3.2%."
            }
        }]
    }
    vllm_resp = CustomModelAdapter.normalize_response(vllm_raw, req)
    assert "Glacier retreat observed" in vllm_resp.answer

    # Case 3: Custom dictionary format with report key
    dict_raw = {
        "task": "Glacier Monitoring",
        "report": "All sensory channels confirmed stable snowpack.",
        "confidence": 0.98,
        "models": ["Custom-FineTuned-Qwen2-VL"]
    }
    dict_resp = CustomModelAdapter.normalize_response(dict_raw, req)
    assert dict_resp.task == "Glacier Monitoring"
    assert dict_resp.answer == "All sensory channels confirmed stable snowpack."
    assert "Custom-FineTuned-Qwen2-VL" in dict_resp.models

def test_custom_agent_settings_lifecycle():
    # Verify custom agent URL and enable toggle can be configured
    patch_resp = client.patch(
        "/api/v1/settings",
        json={"use_custom_agent": True, "custom_agent_url": "http://127.0.0.1:8001/ai/analyze"}
    )
    assert patch_resp.status_code == 200
    data = patch_resp.json()
    assert data["use_custom_agent"] is True
    assert data["custom_agent_url"] == "http://127.0.0.1:8001/ai/analyze"

def test_start_analysis_endpoint():
    # Test POST /api/v1/analyze
    payload = {
        "chat_id": "test_analysis_chat_1",
        "query": "Assess forest perimeter",
        "inputs": [],
        "options": {}
    }
    resp = client.post("/api/v1/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "job_id" in data
    assert data["status"] == "QUEUED"
    assert data["chat_id"] == "test_analysis_chat_1"


