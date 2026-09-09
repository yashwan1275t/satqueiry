import React from 'react';
import { Logo } from '../common/Logo';
import { GlassUploadBox } from './GlassUploadBox';
import { ChatInput } from './ChatInput';
import { AttachmentItem } from '../../types';

interface ChatEmptyStateProps {
  isGenerating: boolean;
  onSendMessage: (text: string, attachments: AttachmentItem[]) => void;
  onStopGeneration: () => void;
  onUploadFiles: (files: FileList, typeHint: string) => Promise<AttachmentItem[]>;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  isGenerating,
  onSendMessage,
  onStopGeneration,
  onUploadFiles
}) => {
  const quickSectorPills = [
    { label: "🏔️ Mountains Part (Terrain & Slope Analysis)", query: "Analyze the mountains part of this satellite image for slope, terrain elevation, and geomorphology." },
    { label: "🏙️ Urban & Built-up Sector", query: "Examine the urban and built-up structures in this satellite imagery." },
    { label: "🌊 Water Basin & Inundation", query: "Detect surface hydrology, water retention, and flood boundaries." }
  ];

  const handleGlassBoxFiles = async (files: FileList) => {
    try {
      const uploaded = await onUploadFiles(files, 'optical');
      if (uploaded.length > 0) {
        onSendMessage("Analyze the mountains part of this satellite image for slope, terrain elevation, and geomorphology.", uploaded);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message || err}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        textAlign: 'center',
        maxWidth: '740px',
        width: '100%',
        padding: '24px 16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Minimalist Gemini Aura Logo */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(59, 130, 246, 0.2) 60%, transparent 80%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}
      >
        <Logo size="lg" animate />
      </div>

      <h1
        style={{
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-red) 85%, var(--accent-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '6px'
        }}
      >
        SatQuery AI
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', marginBottom: '8px' }}>
        Satellite Vision & Remote Sensing Intelligence
      </p>

      {/* Step 1: Big Transparent Red-Border Glass Upload Box */}
      <GlassUploadBox onFilesSelected={handleGlassBoxFiles} isUploading={isGenerating} />

      {/* Minimal Chat Input */}
      <ChatInput
        isGenerating={isGenerating}
        onSendMessage={onSendMessage}
        onStopGeneration={onStopGeneration}
        onUploadFiles={onUploadFiles}
        isCentered
      />

      {/* Minimalist Quick Sector Pills */}
      <div className="sector-pills-row">
        {quickSectorPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            className="sector-pill"
            onClick={() => onSendMessage(pill.query, [])}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
};
