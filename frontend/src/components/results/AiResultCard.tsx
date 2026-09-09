import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Download,
  Layers,
  MapPin,
  SplitSquareVertical,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Sparkles
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { EvidenceViewer } from '../viewer/EvidenceViewer';
import { TemporalImageViewer } from '../viewer/TemporalImageViewer';
import { OpticalSarViewer } from '../viewer/OpticalSarViewer';
import { GeoMapView } from '../viewer/GeoMapView';
import { InteractiveSatelliteScanner } from '../viewer/InteractiveSatelliteScanner';
import { ExecutionTrace } from '../trace/ExecutionTrace';
import { api } from '../../services/api';

interface AiResultCardProps {
  result: AnalysisResult;
  jobId?: string;
}

export const AiResultCard: React.FC<AiResultCardProps> = ({ result, jobId }) => {
  const isMountainQuery = result.task?.toLowerCase().includes('mountain') || result.answer?.toLowerCase().includes('mountain');
  const [activeViewerTab, setActiveViewerTab] = useState<'scanner' | 'evidence' | 'map' | 'temporal' | 'multimodal'>('scanner');
  const [isDownloading, setIsDownloading] = useState(false);

  const confidencePct = Math.round((result.confidence || 0.85) * 100);

  const handleDownloadReport = () => {
    if (!jobId) {
      alert('Report requires an active job identifier');
      return;
    }
    setIsDownloading(true);
    const downloadUrl = api.getReportDownloadUrl(jobId);
    window.open(downloadUrl, '_blank');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const isTemporalTask =
    result.task?.toLowerCase().includes('temporal') ||
    result.task?.toLowerCase().includes('change') ||
    result.models?.includes('ChangeChat');

  const isSarTask =
    result.task?.toLowerCase().includes('sar') ||
    result.task?.toLowerCase().includes('radar') ||
    result.task?.toLowerCase().includes('fusion');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%'
      }}
    >
      {/* Top Meta Bar: Task & Confidence & Models */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Confidence Badge */}
          <div className="meta-pill confidence" title="Composite Research Confidence">
            <CheckCircle2 size={13} />
            <span>Confidence: {confidencePct}%</span>
          </div>

          {/* Models Used */}
          {result.models && result.models.map((model, idx) => (
            <div key={idx} className="meta-pill model">
              <Cpu size={12} />
              <span>{model}</span>
            </div>
          ))}

          {/* Task Badge */}
          <div className="meta-pill" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={12} color="var(--accent-cyan)" />
            <span>{result.task}</span>
          </div>
        </div>

        {/* Download PDF Report Button */}
        {jobId && (
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isDownloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Download authoritative PDF analysis report"
          >
            <Download size={13} color="var(--accent-cyan)" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>
        )}
      </div>

      {/* Answer / Markdown Findings */}
      <div
        style={{
          color: 'var(--text-primary)',
          fontSize: '14.5px',
          lineHeight: '1.65'
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h3 style={{ fontSize: '17px', margin: '12px 0 6px' }}>{children}</h3>,
            h2: ({ children }) => <h4 style={{ fontSize: '15px', margin: '10px 0 5px', color: 'var(--accent-cyan)' }}>{children}</h4>,
            h3: ({ children }) => <h4 style={{ fontSize: '14.5px', margin: '8px 0 4px', color: 'var(--accent-cyan)' }}>{children}</h4>,
            p: ({ children }) => <p style={{ marginBottom: '8px' }}>{children}</p>,
            ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
            strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>
          }}
        >
          {result.answer}
        </ReactMarkdown>
      </div>

      {/* Multimodal Viewer Navigation Tabs */}
      <div style={{ marginTop: '6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveViewerTab('scanner')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeViewerTab === 'scanner' ? 'var(--accent-red)' : 'var(--bg-tertiary)',
              color: activeViewerTab === 'scanner' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: activeViewerTab === 'scanner' ? '0 0 14px var(--accent-red-glow)' : 'none'
            }}
          >
            <Sparkles size={13} />
            <span>Targeted Sector Scanner</span>
          </button>

          <button
            onClick={() => setActiveViewerTab('evidence')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeViewerTab === 'evidence' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: activeViewerTab === 'evidence' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Layers size={13} />
            <span>Spatial Evidence ({result.evidence?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveViewerTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeViewerTab === 'map' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: activeViewerTab === 'map' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <MapPin size={13} />
            <span>Geographic Map</span>
          </button>

          {isTemporalTask && (
            <button
              onClick={() => setActiveViewerTab('temporal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeViewerTab === 'temporal' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeViewerTab === 'temporal' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <SplitSquareVertical size={13} />
              <span>Temporal Swipe</span>
            </button>
          )}

          {isSarTask && (
            <button
              onClick={() => setActiveViewerTab('multimodal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeViewerTab === 'multimodal' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeViewerTab === 'multimodal' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Radio size={13} />
              <span>Optical + SAR</span>
            </button>
          )}
        </div>

        {/* Dynamic Viewer Render */}
        {activeViewerTab === 'scanner' && (
          <InteractiveSatelliteScanner activeSectorId={isMountainQuery ? 'mountains' : 'urban'} />
        )}
        {activeViewerTab === 'evidence' && (
          <EvidenceViewer evidence={result.evidence || []} />
        )}
        {activeViewerTab === 'map' && (
          <GeoMapView evidence={result.evidence || []} />
        )}
        {activeViewerTab === 'temporal' && (
          <TemporalImageViewer />
        )}
        {activeViewerTab === 'multimodal' && (
          <OpticalSarViewer />
        )}
      </div>

      {/* Auditable Execution Trace */}
      <ExecutionTrace trace={result.execution_trace || []} />

      {/* Warnings & Caveats Box */}
      {result.warnings && result.warnings.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '12px',
            color: 'var(--text-primary)'
          }}
        >
          <AlertTriangle size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '2px' }}>
              Sensor Quality Limitations & Caveats
            </div>
            {result.warnings.map((w, idx) => (
              <div key={idx} style={{ color: 'var(--text-secondary)' }}>
                • {w}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
