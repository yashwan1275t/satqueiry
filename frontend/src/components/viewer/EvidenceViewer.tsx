import React, { useState } from 'react';
import { Eye, EyeOff, Sliders, Layers, Maximize2 } from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidenceViewerProps {
  imageUrl?: string;
  evidence: EvidenceItem[];
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  imageUrl,
  evidence
}) => {
  const [showEvidence, setShowEvidence] = useState(true);
  const [opacity, setOpacity] = useState(0.75);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

  // Authentic high-res satellite remote sensing texture
  const displayUrl = imageUrl || '/satellite_terrain.jpg';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        marginTop: '12px'
      }}
    >
      {/* Controls Bar */}
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
          <Layers size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Spatial Evidence Inspector ({evidence.length} features detected)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Toggle Evidence */}
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: showEvidence ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
              border: `1px solid ${showEvidence ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              color: showEvidence ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {showEvidence ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>Overlay: {showEvidence ? 'Active' : 'Hidden'}</span>
          </button>

          {/* Opacity Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={13} color="var(--text-muted)" />
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ width: '70px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              title={`Overlay Opacity: ${(opacity * 100).toFixed(0)}%`}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px' }}>
              {(opacity * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Imagery & Evidence Canvas Overlay Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          backgroundColor: '#000000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <img
          src={displayUrl}
          alt="Satellite Scene"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Spatial Evidence Layer (Bounding Boxes & Masks) */}
        {showEvidence && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none'
            }}
          >
            {evidence.map((item) => {
              if (item.type === 'bbox' && Array.isArray(item.coordinates) && item.coordinates.length === 4) {
                const [minX, minY, maxX, maxY] = item.coordinates;
                const left = `${minX * 100}%`;
                const top = `${minY * 100}%`;
                const width = `${(maxX - minX) * 100}%`;
                const height = `${(maxY - minY) * 100}%`;
                const color = item.color || '#06b6d4';
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    style={{
                      position: 'absolute',
                      left,
                      top,
                      width,
                      height,
                      border: `2px solid ${color}`,
                      backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                      borderRadius: '3px',
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 0 14px ${color}` : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-19px',
                        left: '-2px',
                        background: color,
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {item.label} ({(item.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Selected Feature Details Inspector */}
      {selectedItem && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Feature: {selectedItem.label}
            </span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Confidence: {(selectedItem.confidence * 100).toFixed(1)}%
            </span>
          </div>
          {selectedItem.properties && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', color: 'var(--text-secondary)' }}>
              {Object.entries(selectedItem.properties).map(([k, v]) => (
                <span key={k}>
                  <b>{k}:</b> {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
