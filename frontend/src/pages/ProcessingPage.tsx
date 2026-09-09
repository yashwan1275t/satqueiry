import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface ProcessingPageProps {
  currentStep?: string;
  progress?: number;
  onCancel: () => void;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  currentStep = 'Synthesizing satellite telemetry...',
  progress = 0.65,
  onCancel
}) => {
  // Calculate SVG stroke offset for 120px ring (radius 52, perimeter = 2 * PI * 52 ≈ 326.7)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - progress * circumference;

  return (
    <div className="page-workspace" style={{ flexDirection: 'column' }}>
      {/* Center Frosted Glass Processing Card (Panel 02) */}
      <div className="processing-card">
        {/* Glowing Circular Progress Ring */}
        <div className="circular-progress-wrapper">
          <svg className="progress-ring-svg" viewBox="0 0 120 120">
            {/* Background Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Animated Glowing Progress Ring */}
            <circle
              className="progress-ring-circle"
              cx="60"
              cy="60"
              r={radius}
              strokeWidth="4"
              fill="transparent"
              style={{ strokeDashoffset: strokeOffset }}
            />
          </svg>

          {/* Central Image Icon */}
          <div
            style={{
              position: 'absolute',
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <ImageIcon size={26} color="#94a3b8" strokeWidth={1.6} />
          </div>
        </div>

        {/* Processing Text */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 500,
            color: '#f8fafc',
            marginBottom: '6px'
          }}
        >
          Processing...
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '300px',
            marginBottom: '20px'
          }}
        >
          {currentStep}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <X size={13} />
          <span>Cancel Analysis</span>
        </button>
      </div>

      {/* Pagination / Carousel Dots (Matching Panel 02) */}
      <div className="carousel-dots-row">
        <div className="dot-circle" style={{ background: '#f8fafc' }} />
        <div className="dot-bar" style={{ background: '#f8fafc' }} />
        <div className="dot-circle" style={{ background: '#f8fafc' }} />
      </div>
    </div>
  );
};
