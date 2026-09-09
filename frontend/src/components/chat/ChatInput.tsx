import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AttachmentMenu } from './AttachmentMenu';
import { AttachmentPreview } from './AttachmentPreview';
import { SendButton } from './SendButton';
import { StopButton } from './StopButton';
import { AttachmentItem } from '../../types';

interface ChatInputProps {
  isGenerating: boolean;
  onSendMessage: (text: string, attachments: AttachmentItem[]) => void;
  onStopGeneration: () => void;
  onUploadFiles: (files: FileList, typeHint: string) => Promise<AttachmentItem[]>;
  isCentered?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isGenerating,
  onSendMessage,
  onStopGeneration,
  onUploadFiles,
  isCentered = false
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) return;
    if (!text.trim() && attachments.length === 0) return;
    
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFilesSelected = async (files: FileList, typeHint: string) => {
    setIsUploading(true);
    try {
      const uploaded = await onUploadFiles(files, typeHint);
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !isUploading;

  return (
    <div className={`chat-input-wrapper ${isCentered ? 'centered' : ''}`}>
      <div className="chat-input-box">
        {/* Attachment chips tray */}
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />

        {/* Uploading indicator */}
        {isUploading && (
          <div
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div className="spinner" style={{ width: '12px', height: '12px' }} />
            <span>Validating & uploading satellite file...</span>
          </div>
        )}

        {/* Input Controls Row */}
        <div className="chat-input-row">
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-attachment"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Add attachment"
              title="Add Image, PDF, or ZIP"
            >
              <Plus size={18} />
            </button>

            <AttachmentMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSelectFiles={handleFilesSelected}
            />
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? "SatQuery AI is analyzing imagery..."
                : attachments.length > 0
                ? "Ask anything about this satellite data (e.g. Has built-up area increased?)..."
                : "Ask SatQuery AI about your satellite imagery or upload a scene..."
            }
            className="chat-textarea"
            disabled={isGenerating}
          />

          {isGenerating ? (
            <StopButton onClick={onStopGeneration} />
          ) : (
            <SendButton disabled={!canSend} onClick={handleSubmit} />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <span>Press <b>Enter</b> to send, <b>Shift+Enter</b> for newline</span>
        <span>•</span>
        <span>GeoTIFF, Multispectral, SAR, PDF & ZIP supported</span>
      </div>
    </div>
  );
};
