import { ChatSession, ChatMessage, AttachmentItem, JobEventData, AppSettings } from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Chat
  async listChats(): Promise<ChatSession[]> {
    const res = await fetch(`${API_BASE}/chat`);
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
  },

  async createChat(title?: string): Promise<ChatSession> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || 'New Satellite Query' })
    });
    if (!res.ok) throw new Error('Failed to create new chat');
    return res.json();
  },

  async getChat(chatId: string): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/chat/${chatId}`);
    if (!res.ok) throw new Error('Failed to load chat');
    return res.json();
  },

  async renameChat(chatId: string, title: string): Promise<ChatSession> {
    const res = await fetch(`${API_BASE}/chat/${chatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Failed to rename chat');
    return res.json();
  },

  async deleteChat(chatId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/chat/${chatId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete chat');
  },

  // Messaging & Analysis Trigger
  async sendMessage(
    chatId: string,
    message: string,
    attachmentIds: string[] = []
  ): Promise<{ job_id: string; chat_id: string; user_message_id: string; assistant_message_id: string }> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message,
        attachments: attachmentIds
      })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Upload
  async uploadFile(
    file: File,
    chatId?: string,
    modalityHint?: string
  ): Promise<AttachmentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) formData.append('chat_id', chatId);
    if (modalityHint) formData.append('modality_hint', modalityHint);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'File upload failed');
    }
    return res.json();
  },

  // Job Polling & Cancellation
  async getJobStatus(jobId: string): Promise<JobEventData> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to get job status');
    return res.json();
  },

  async cancelJob(jobId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/cancel`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to cancel job');
    return res.json();
  },

  // SSE Stream Subscription
  subscribeJobStream(
    jobId: string,
    onEvent: (data: JobEventData) => void,
    onError?: (err: any) => void
  ): () => void {
    const eventSource = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
        if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(data.status)) {
          eventSource.close();
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    eventSource.onerror = (e) => {
      if (onError) onError(e);
      eventSource.close();
    };

    return () => eventSource.close();
  },

  // Reports
  getReportDownloadUrl(jobId: string): string {
    return `${API_BASE}/reports/${jobId}/download`;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Models
  async getModels(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.models || [];
  }
};
