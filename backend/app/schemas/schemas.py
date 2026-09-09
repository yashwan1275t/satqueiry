import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict

# --- Chat & Message Schemas ---

class ChatCreateRequest(BaseModel):
    title: Optional[str] = "New Satellite Query"

class ChatRenameRequest(BaseModel):
    title: str

class ChatMessageCreate(BaseModel):
    chat_id: str
    message: str
    attachments: list[str] = Field(default_factory=list)  # attachment IDs

class ChatMessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime.datetime
    job_id: Optional[str] = None
    result: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    messages_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class ChatDetailResponse(BaseModel):
    id: str
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    messages: list[ChatMessageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# --- Attachment Schemas ---

class AttachmentResponse(BaseModel):
    id: str
    chat_id: Optional[str] = None
    filename: str
    file_type: str
    mime_type: str
    file_size: int
    storage_path: str
    url: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Job Schemas ---

class JobStatusResponse(BaseModel):
    job_id: str
    chat_id: str
    status: str
    progress: float
    current_step: str
    error_message: Optional[str] = None
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    result: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class JobCancelResponse(BaseModel):
    job_id: str
    status: str
    message: str

# --- AI API Contract (Section 48) ---

class AIInputItem(BaseModel):
    id: str
    type: str  # "optical" | "sar" | "temporal_pre" | "temporal_post" | "pdf" | "zip"
    location: str  # path or URL
    metadata: dict[str, Any] = Field(default_factory=dict)

class AIAnalyzeRequest(BaseModel):
    chat_id: str
    query: str
    inputs: list[AIInputItem] = Field(default_factory=list)
    options: dict[str, Any] = Field(default_factory=dict)

class ExecutionTraceItem(BaseModel):
    step: str
    status: str  # "completed" | "in_progress" | "pending" | "failed"
    duration_ms: Optional[int] = None
    detail: Optional[str] = None

class EvidenceItem(BaseModel):
    id: str
    type: str  # "bbox" | "segmentation_mask" | "change_mask" | "highlight" | "point"
    label: str
    confidence: float
    coordinates: Optional[list[Any]] = None  # [min_x, min_y, max_x, max_y] or GeoJSON
    color: Optional[str] = "#06b6d4"  # cyan/emerald
    properties: dict[str, Any] = Field(default_factory=dict)

class AIAnalyzeResponse(BaseModel):
    task: str  # e.g., "Land Cover VQA", "Bi-Temporal Change Detection", "Multimodal Flood Fusion"
    answer: str
    confidence: float
    evidence: list[EvidenceItem] = Field(default_factory=list)
    models: list[str] = Field(default_factory=list)  # e.g. ["GeoChat", "ChangeChat"]
    tools: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    execution_trace: list[ExecutionTraceItem] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

# --- Settings Schemas ---

class SettingsUpdate(BaseModel):
    theme: Optional[str] = "dark"  # "light", "dark", "system"
    default_model: Optional[str] = "GeoChat"
    auto_detect_modality: Optional[bool] = True
    confidence_threshold: Optional[float] = 0.5
    custom_agent_url: Optional[str] = None
    use_custom_agent: Optional[bool] = None

class SettingsResponse(BaseModel):
    theme: str
    default_model: str
    auto_detect_modality: bool
    confidence_threshold: float
    custom_agent_url: Optional[str] = "http://localhost:8001/ai/v1/analyze"
    use_custom_agent: bool = False
