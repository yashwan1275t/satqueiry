import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Activity } from 'lucide-react';
import { ExecutionTraceItem } from '../../types';

interface ExecutionTraceProps {
  trace: ExecutionTraceItem[];
  defaultExpanded?: boolean;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({
  trace,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!trace || trace.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '14px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden'
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={14} color="var(--accent-cyan)" />
          <span>Execution Trace & Auditable Pipeline ({trace.length} stages)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>
            ✓ Verified
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '10px 14px 14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          {trace.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px'
              }}
            >
              <CheckCircle2
                size={14}
                color="var(--accent-emerald)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.step}
                  </span>
                  {item.duration_ms && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10.5px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <Clock size={10} />
                      {item.duration_ms}ms
                    </span>
                  )}
                </div>
                {item.detail && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {item.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
