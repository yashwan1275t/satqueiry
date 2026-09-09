import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Cpu, Sliders, Shield, Satellite } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('GeoChat');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.getModels().then(setModels).catch(console.error);
      api.getSettings().then((s) => {
        setSelectedModel(s.default_model || 'GeoChat');
        setConfidenceThreshold(s.confidence_threshold ?? 0.5);
        setAutoDetect(s.auto_detect_modality ?? true);
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleSave = async () => {
    await api.updateSettings({
      theme,
      default_model: selectedModel,
      confidence_threshold: confidenceThreshold,
      auto_detect_modality: autoDetect
    }).catch(console.error);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Platform Settings & Preferences">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Section 1: Appearance */}
        <div>
          <label
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            Appearance & Interface Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: theme === 'light' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                border: `1.5px solid ${theme === 'light' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md)',
                color: theme === 'light' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px'
              }}
            >
              <Sun size={20} />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: theme === 'dark' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                border: `1.5px solid ${theme === 'dark' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md)',
                color: theme === 'dark' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px'
              }}
            >
              <Moon size={20} />
              <span>Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: theme === 'system' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                border: `1.5px solid ${theme === 'system' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md)',
                color: theme === 'system' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px'
              }}
            >
              <Monitor size={20} />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Section 2: Default Remote-Sensing Specialist Model */}
        <div>
          <label
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px'
            }}
          >
            <Cpu size={15} color="var(--accent-cyan)" />
            <span>Default Remote Sensing Model Backbone</span>
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none'
            }}
          >
            <option value="GeoChat">GeoChat-7B (High-Res Grounded VQA)</option>
            <option value="ChangeChat">ChangeChat / LEVIR-CC (Bi-Temporal Change Detection)</option>
            <option value="Qwen2.5-VL">Qwen2.5-VL Remote Sensing (Optical-SAR Fusion)</option>
            <option value="InternVL3">InternVL3-Geospatial (Sub-meter Aerial & Telemetry)</option>
          </select>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Models will be dynamically routed by the query planner if multi-modal or temporal data is detected.
          </span>
        </div>

        {/* Section 3: Modality Auto-Detection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Auto-detect Sensor Modality
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Automatically parse bands to distinguish Optical, SAR, and Thermal imagery.
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Section 4: Confidence Threshold */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Evidence Confidence Filter
            </span>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--accent-cyan)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 2px 8px var(--accent-cyan-glow)'
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
};
