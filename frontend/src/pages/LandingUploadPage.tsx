import React, { useRef, useState, useEffect } from 'react';
import { ImagePlus, Sparkles, Eye } from 'lucide-react';

interface LandingUploadPageProps {
  onFileSelect: (file: File) => void;
  onQuickSample: (sampleName: string) => void;
}

export const LandingUploadPage: React.FC<LandingUploadPageProps> = ({
  onFileSelect,
  onQuickSample
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          onFileSelect(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelect]);

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
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="page-workspace" style={{ flexDirection: 'column' }}>
      {/* 
        FUNCTIONAL Left Ambient Observation Card (Circled in WHITE by User) 
        Clicking loads this high-resolution Sentinel-2 Alpine Ridge Sample into analysis
      */}
      <div
        className="ambient-card-left"
        onClick={() => onQuickSample('Alpine Mountain Ridge Survey')}
        onMouseEnter={() => setIsLeftHovered(true)}
        onMouseLeave={() => setIsLeftHovered(false)}
        title="Click to analyze preloaded Alpine Ridge satellite observation"
        role="button"
        tabIndex={0}
        aria-label="Analyze Alpine Satellite Sample"
        style={{
          cursor: 'pointer',
          transform: isLeftHovered ? 'translateY(-6px) scale(1.05)' : 'none',
          boxShadow: isLeftHovered
            ? '0 24px 50px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
            : undefined
        }}
      >
        <img
          src="/satellite_terrain.jpg"
          alt="Alpine Satellite Sample"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLeftHovered ? 1 : 0.9,
            transition: 'opacity 0.2s ease'
          }}
        />

        {/* Hover / Glass Overlay Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '8px',
            right: '8px',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {isLeftHovered ? (
            <>
              <Eye size={12} color="#60a5fa" />
              <span>Analyze Sample</span>
            </>
          ) : (
            <>
              <Sparkles size={11} color="#60a5fa" />
              <span>Alpine Sample</span>
            </>
          )}
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg,.webp,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* 
        FUNCTIONAL Center Upload Hero Card (Circled in WHITE by User)
        Apple iOS Frosted Glass Sheet Aesthetic with Drag & Drop and Click-to-Upload
      */}
      <div
        className="upload-hero-card"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload Satellite Image"
        style={{
          borderColor: isDragOver ? 'rgba(96, 165, 250, 0.9)' : undefined,
          boxShadow: isDragOver
            ? '0 24px 60px rgba(59, 130, 246, 0.35), inset 0 0 20px rgba(96, 165, 250, 0.2)'
            : undefined,
          transform: isDragOver ? 'scale(1.02)' : undefined
        }}
      >
        <div className="upload-dropzone-inner">
          {/* Picture + Plus Icon */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <ImagePlus size={26} color="#334155" strokeWidth={1.8} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}
          >
            {isDragOver ? 'Drop satellite imagery here' : 'Drag & drop an image'}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            or click to upload
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              opacity: 0.75
            }}
          >
            Supports GeoTIFF • Sentinel-2 • PNG • JPG • WebP
          </div>
        </div>
      </div>

      {/* Pagination / Carousel Dots (Matching Panel 01 of User Mockup) */}
      <div className="carousel-dots-row">
        <div className="dot-bar" />
        <div className="dot-circle" />
        <div className="dot-circle" />
      </div>
    </div>
  );
};
