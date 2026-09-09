import React from 'react';
import { X, Image as ImageIcon, FileText, Archive } from 'lucide-react';
import { AttachmentItem } from '../../types';

interface AttachmentPreviewProps {
  attachments: AttachmentItem[];
  onRemove: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove
}) => {
  if (attachments.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="attachment-tray">
      {attachments.map((att) => {
        const isImage = ['optical', 'sar', 'temporal_pre', 'temporal_post', 'image'].includes(att.file_type) ||
          att.filename.match(/\.(png|jpe?g|tif|tiff)$/i);
        const isPdf = att.file_type === 'pdf' || att.filename.endsWith('.pdf');
        const isZip = att.file_type === 'zip' || att.filename.endsWith('.zip');

        return (
          <div key={att.id} className="attachment-chip" title={att.filename}>
            {att.previewUrl && isImage ? (
              <img src={att.previewUrl} alt={att.filename} className="thumb" />
            ) : isImage ? (
              <ImageIcon size={15} color="var(--accent-cyan)" />
            ) : isPdf ? (
              <FileText size={15} color="var(--accent-amber)" />
            ) : isZip ? (
              <Archive size={15} color="var(--accent-indigo)" />
            ) : (
              <ImageIcon size={15} />
            )}

            <span
              style={{
                maxWidth: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {att.filename}
            </span>

            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              ({formatSize(att.file_size)})
            </span>

            <button
              type="button"
              className="btn-remove"
              onClick={() => onRemove(att.id)}
              aria-label="Remove attachment"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
