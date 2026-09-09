import React from 'react';
import { User, Image as ImageIcon, FileText, Archive, AlertCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import { Logo } from '../common/Logo';
import { AiResultCard } from '../results/AiResultCard';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  currentStep?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  currentStep
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message-row ${isUser ? 'user' : 'ai'}`}>
      {/* Avatar */}
      <div className={`chat-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <User size={18} /> : <Logo size="sm" />}
      </div>

      {/* Message Content Bubble */}
      <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
        {/* User Content */}
        {isUser ? (
          <div>
            <div style={{ fontSize: '14.5px', whiteSpace: 'pre-wrap' }}>
              {message.content}
            </div>

            {/* Render User Attached File Chips */}
            {message.attachments && message.attachments.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                {message.attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '11.5px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {att.file_type === 'pdf' ? (
                      <FileText size={13} color="var(--accent-amber)" />
                    ) : att.file_type === 'zip' ? (
                      <Archive size={13} color="var(--accent-indigo)" />
                    ) : (
                      <ImageIcon size={13} color="var(--accent-cyan)" />
                    )}
                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Assistant Content */
          <div>
            {/* Live Generation Status Box */}
            {isStreaming && (
              <div className="ai-status-box">
                <div className="spinner" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    SatQuery Remote-Sensing Engine Active
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {currentStep || 'Synthesizing visual-spatial evidence...'}
                  </span>
                </div>
              </div>
            )}

            {/* Cancelled State */}
            {message.result?.status === 'CANCELLED' && !message.result?.answer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-rose)',
                  fontSize: '13px',
                  padding: '8px 0'
                }}
              >
                <AlertCircle size={15} />
                <span>Analysis was stopped by user. Partial process halted.</span>
              </div>
            )}

            {/* Completed AI Result Card */}
            {message.result && message.result.answer ? (
              <AiResultCard result={message.result} jobId={message.job_id} />
            ) : message.content ? (
              <div style={{ fontSize: '14.5px', whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
            ) : !isStreaming ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No response data recorded.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
