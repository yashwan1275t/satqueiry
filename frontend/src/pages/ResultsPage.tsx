import React, { useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Image as ImageIcon, 
  Mountain, 
  MapPin, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Send, 
  ArrowLeft 
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsPageProps {
  imageUrl?: string;
  title?: string;
  result?: AnalysisResult | null;
  onDownloadReport: () => void;
  onDelete: () => void;
  onFollowUpQuery?: (query: string) => void;
  onBack: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  imageUrl = '/satellite_terrain.jpg',
  title = 'Alpine Terrain & Ridgeline Intelligence',
  result,
  onDownloadReport,
  onDelete,
  onFollowUpQuery,
  onBack
}) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followUpText, setFollowUpText] = useState('');

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.7));
  const handleResetZoom = () => setZoom(1);

  const handleCopy = () => {
    const textToCopy = result?.answer || 
      `${title}\n\nKey Insights:\n- Elevation: 3,840m MSL peak elevation\n- Sector: 46°18'24"N 10°03'12"E\n- Classification: Alpine Bedrock & Glacial Basin\n- Topographic Slope: 42° acute gradient\n- Vegetation Index (NDVI): 0.14 Sparse Alpine Flora`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim()) return;
    if (onFollowUpQuery) {
      onFollowUpQuery(followUpText.trim());
    }
    setFollowUpText('');
  };

  const summaryText = result?.answer || 
    'High-resolution multi-spectral satellite synthesis of the alpine ridgeline demonstrates sharp glacial cirques with exposed crystalline bedrock. Topographic elevation profiles indicate acute relief gradients exceeding 42° across north-facing talus scree slopes, with high-confidence permafrost stability.';

  return (
    <div className="page-workspace" style={{ flexDirection: 'column' }}>
      {/* Top back navigation button */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '1020px', 
          marginBottom: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          zIndex: 25
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--glass-surface)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Upload</span>
        </button>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Panel 03 — Research Results View
        </div>
      </div>

      {/* Split Container (Left: Satellite Image, Right: Analysis Card) */}
      <div className="results-split-container">
        {/* Left Side: Satellite Image Display Card with Scanning Overlay */}
        <div 
          className="results-image-card"
          style={{
            position: isFullscreen ? 'fixed' : 'relative',
            inset: isFullscreen ? '20px' : 'auto',
            zIndex: isFullscreen ? 100 : 20,
            height: isFullscreen ? 'calc(100vh - 40px)' : '460px',
            width: isFullscreen ? 'calc(100vw - 40px)' : '100%',
            overflow: 'hidden'
          }}
        >
          {/* Top-Right Fullscreen Expand Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              transition: 'all var(--transition-fast)'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Minimalist & Clean Scanning Light Bar */}
          <div className="clean-scan-bar" />

          {/* Interactive Zoomable Satellite Image */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: zoom > 1 ? 'grab' : 'default'
            }}
          >
            <img
              src={imageUrl}
              alt="Satellite Terrain Observation"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoom})`,
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                userSelect: 'none'
              }}
            />
          </div>

          {/* Bottom-Left Zoom Controls Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 8px',
              zIndex: 10
            }}
          >
            <button
              onClick={handleZoomIn}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            {zoom !== 1 && (
              <button
                onClick={handleResetZoom}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Reset Zoom"
                aria-label="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <span style={{ color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)', paddingRight: '4px' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Right Side: Structured Analysis Card */}
        <div className="results-details-card" style={{ minHeight: '460px' }}>
          <div>
            {/* Top Image Badge */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <ImageIcon size={20} color="#334155" strokeWidth={1.8} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                lineHeight: 1.3
              }}
            >
              {title}
            </h2>

            {/* Summary Text */}
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '20px'
              }}
            >
              {summaryText}
            </p>

            {/* Structured Metadata Rows with Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {/* Row 1: Elevation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Mountain size={16} />
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Elevation Relief:</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>3,840m MSL (42° Acute Gradient)</strong>
                </div>
              </div>

              {/* Row 2: Coordinates */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <MapPin size={16} />
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Sector Coordinates:</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>46°18'24"N 10°03'12"E (Sector 4)</strong>
                </div>
              </div>

              {/* Row 3: Classification */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <FileText size={16} />
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Lithology / Terrain:</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Crystalline Talus & Permafrost Cirque</strong>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Follow-up Question Input */}
            <form 
              onSubmit={handleFollowUpSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 6px 4px 14px',
                marginBottom: '16px'
              }}
            >
              <input
                type="text"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Ask about this sector (e.g. check glacial runoff)..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)'
                }}
                aria-label="Send Query"
              >
                <Send size={14} />
              </button>
            </form>

            {/* Action Buttons Row (Download, Copy, Delete) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--glass-border-subtle)'
              }}
            >
              <button
                onClick={onDownloadReport}
                className="nav-icon-btn"
                style={{ borderRadius: 'var(--radius-sm)', width: '38px', height: '38px' }}
                title="Download Intelligence Report (PDF)"
                aria-label="Download PDF"
              >
                <Download size={17} />
              </button>

              <button
                onClick={handleCopy}
                className="nav-icon-btn"
                style={{ borderRadius: 'var(--radius-sm)', width: '38px', height: '38px' }}
                title="Copy Analysis"
                aria-label="Copy Analysis"
              >
                {copied ? <Check size={17} color="#10b981" /> : <Copy size={17} />}
              </button>

              <button
                onClick={onDelete}
                className="nav-icon-btn"
                style={{ borderRadius: 'var(--radius-sm)', width: '38px', height: '38px' }}
                title="Delete / Reset Analysis"
                aria-label="Delete Analysis"
              >
                <Trash2 size={17} />
              </button>

              <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                Confidence: {result ? `${Math.round(result.confidence * 100)}%` : '96%'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
