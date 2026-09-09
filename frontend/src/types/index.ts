export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export interface AttachmentItem {
  id: string;
  chat_id?: string;
  filename: string;
  file_type: 'optical' | 'sar' | 'temporal_pre' | 'temporal_post' | 'pdf' | 'zip' | string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  url: string;
  metadata?: Record<string, any>;
  created_at?: string;
  previewUrl?: string;
}

export interface ExecutionTraceItem {
  step: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  duration_ms?: number;
  detail?: string;
}

export interface EvidenceItem {
  id: string;
  type: 'bbox' | 'segmentation_mask' | 'change_mask' | 'highlight' | 'point' | string;
  label: string;
  confidence: number;
  coordinates?: any;
  color?: string;
  properties?: Record<string, any>;
}

export interface AnalysisResult {
  task: string;
  answer: string;
  confidence: number;
  models: string[];
  tools?: string[];
  evidence: EvidenceItem[];
  execution_trace: ExecutionTraceItem[];
  warnings?: string[];
  metadata?: Record<string, any>;
  status?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: AttachmentItem[];
  created_at: string;
  job_id?: string;
  result?: AnalysisResult;
}

export interface JobEventData {
  job_id: string;
  status: 'QUEUED' | 'VALIDATING' | 'PREPROCESSING' | 'PLANNING' | 'RUNNING_MODEL' | 'GENERATING_EVIDENCE' | 'CALCULATING_CONFIDENCE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  progress: number;
  current_step: string;
  error_message?: string;
  result?: AnalysisResult;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  default_model: string;
  auto_detect_modality: boolean;
  confidence_threshold: number;
}
