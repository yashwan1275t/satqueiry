import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Float,
    Integer,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class ChatSession(Base):
    __tablename__ = "chats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, default="New Satellite Query")
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan", order_by="ChatMessage.created_at")
    attachments = relationship("Attachment", back_populates="chat", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False, default="")
    attachments = Column(JSON, default=list)  # list of attachment metadata or IDs
    created_at = Column(DateTime, default=utcnow, nullable=False)

    chat = relationship("ChatSession", back_populates="messages")
    jobs = relationship("AnalysisJob", back_populates="message", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # "optical", "sar", "temporal_pre", "temporal_post", "pdf", "zip", etc.
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    chat = relationship("ChatSession", back_populates="attachments")


class AnalysisJob(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    message_id = Column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    status = Column(String(30), nullable=False, default="QUEUED")
    # States: QUEUED, VALIDATING, PREPROCESSING, PLANNING, RUNNING_MODEL, GENERATING_EVIDENCE, CALCULATING_CONFIDENCE, COMPLETED, CANCELLED, FAILED
    progress = Column(Float, default=0.0)
    current_step = Column(String(100), default="Queued for analysis")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    message = relationship("ChatMessage", back_populates="jobs")
    result = relationship("AnalysisResult", back_populates="job", uselist=False, cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, unique=True)
    task = Column(String(100), nullable=False, default="VQA")
    answer = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85)
    models = Column(JSON, default=list)  # e.g. ["GeoChat", "ChangeChat"]
    tools = Column(JSON, default=list)
    evidence = Column(JSON, default=list)  # bounding boxes, masks, coordinates, GeoJSON
    execution_trace = Column(JSON, default=list)  # auditable execution trace
    warnings = Column(JSON, default=list)  # sensor caveats, cloud cover etc.
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    job = relationship("AnalysisJob", back_populates="result")


class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    chat_id = Column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
