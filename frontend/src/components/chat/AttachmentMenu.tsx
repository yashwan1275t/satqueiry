import React, { useRef } from 'react';
import { Image as ImageIcon, FileText, Archive } from 'lucide-react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFiles: (files: FileList, typeHint: string) => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectFiles
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 45 }}
        onClick={onClose}
      />
      <div className="attachment-menu-popup">
        {/* Hidden native file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept=".tif,.tiff,.png,.jpg,.jpeg"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onSelectFiles(e.target.files, 'optical');
            }
            onClose();
          }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onSelectFiles(e.target.files, 'pdf');
            }
            onClose();
          }}
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onSelectFiles(e.target.files, 'zip');
            }
            onClose();
          }}
        />

        <button
          type="button"
          className="attachment-menu-option"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon size={16} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontWeight: 500 }}>Upload Image</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              GeoTIFF, TIFF, PNG, JPEG
            </div>
          </div>
        </button>

        <button
          type="button"
          className="attachment-menu-option"
          onClick={() => pdfInputRef.current?.click()}
        >
          <FileText size={16} color="var(--accent-amber)" />
          <div>
            <div style={{ fontWeight: 500 }}>Upload PDF</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Telemetry, Observation Report
            </div>
          </div>
        </button>

        <button
          type="button"
          className="attachment-menu-option"
          onClick={() => zipInputRef.current?.click()}
        >
          <Archive size={16} color="var(--accent-indigo)" />
          <div>
            <div style={{ fontWeight: 500 }}>Upload ZIP Archive</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Multi-tile Scenes, Metadata
            </div>
          </div>
        </button>
      </div>
    </>
  );
};
