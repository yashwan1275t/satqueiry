import React, { useRef, useState } from 'react';
import { Upload, Satellite, Sparkles } from 'lucide-react';

interface GlassUploadBoxProps {
  onFilesSelected: (files: FileList) => void;
  isUploading?: boolean;
}

export const GlassUploadBox: React.FC<GlassUploadBoxProps> = ({
  onFilesSelected,
  isUploading = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`glass-upload-box ${isDragOver ? 'dragover' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".tif,.tiff,.png,.jpg,.jpeg,.pdf,.zip"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
          }
        }}
      />

      {/* Futuristic Corner Brackets (Gemini Red Tech Style) */}
      <div className="glass-corner-tl" />
      <div className="glass-corner-tr" />
      <div className="glass-corner-bl" />
      <div className="glass-corner-br" />

      {/* Subtle Laser Scan Beam on hover or upload */}
      {isUploading && <div className="scanline-beam" />}

      {/* Minimal Icon & Visual Pulse */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          transition: 'all var(--transition-fast)'
        }}
      >
        <Upload size={22} color="var(--accent-red)" />
      </div>

      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>{isUploading ? 'Scanning Satellite Imagery...' : 'Drop satellite imagery or click to browse'}</span>
      </div>

      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '4px'
        }}
      >
        Optical, SAR, Multispectral, PDF & ZIP
      </div>
    </div>
  );
};
