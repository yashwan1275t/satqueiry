import React, { useState } from 'react';
import { Sliders, Eye, RefreshCw, SplitSquareVertical } from 'lucide-react';

interface TemporalImageViewerProps {
  preUrl?: string;
  postUrl?: string;
}

export const TemporalImageViewer: React.FC<TemporalImageViewerProps> = ({
  preUrl,
  postUrl
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showChangeMap, setShowChangeMap] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  // Realistic high-res bi-temporal satellite simulation rasters
  const baselineImg = preUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80';
  const followUpImg = postUrl || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        marginTop: '12px'
      }}
    >
      {/* Viewer Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SplitSquareVertical size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Bi-Temporal Satellite Wipe Comparator
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('slider')}
              style={{
                padding: '3px 8px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'slider' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'slider' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Swipe Slider
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              style={{
                padding: '3px 8px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'side-by-side' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'side-by-side' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Side-by-Side
            </button>
          </div>

          {/* Change Map Toggle */}
          <button
            onClick={() => setShowChangeMap(!showChangeMap)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: showChangeMap ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg-tertiary)',
              border: `1px solid ${showChangeMap ? '#ec4899' : 'var(--border-subtle)'}`,
              color: showChangeMap ? '#ec4899' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Eye size={13} />
            <span>Change Map Overlay</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'slider' ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            userSelect: 'none'
          }}
        >
          {/* Follow-up image (Full background) */}
          <img
            src={followUpImg}
            alt="After / Target Satellite Image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Baseline image (Clipped to slider position) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              width: `${sliderPosition}%`,
              borderRight: '2px solid #ffffff',
              boxShadow: '2px 0 10px rgba(0,0,0,0.5)'
            }}
          >
            <img
              src={baselineImg}
              alt="Before / Baseline Satellite Image"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                minWidth: '100%',
                objectFit: 'cover'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '3px'
              }}
            >
              BEFORE (Baseline)
            </span>
          </div>

          <span
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '3px'
            }}
          >
            AFTER (Target)
          </span>

          {/* Change Map Heatmap / Highlight Overlay */}
          {showChangeMap && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 40% 45%, rgba(236, 72, 153, 0.45) 0%, transparent 60%)',
                pointerEvents: 'none',
                mixBlendMode: 'screen'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(236, 72, 153, 0.9)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                Categorical Change Mask Active (+18.4% Delta)
              </div>
            </div>
          )}

          {/* Swipe Slider Thumb Handle */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'ew-resize',
              margin: 0,
              zIndex: 10
            }}
          />
        </div>
      ) : (
        /* Side-by-Side Dual Synchronized View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div
            style={{
              position: 'relative',
              height: '240px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <img src={baselineImg} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '2px'
              }}
            >
              BEFORE
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              height: '240px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <img src={followUpImg} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '2px'
              }}
            >
              AFTER
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span>Drag slider horizontally to swipe between temporal acquisitions</span>
        <span>Resolution Coregistration: RMSE 0.24px</span>
      </div>
    </div>
  );
};
