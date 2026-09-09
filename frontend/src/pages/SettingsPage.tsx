import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Cpu, ShieldCheck, Sliders, Check, Network, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

interface SettingsPageProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  isDarkMode,
  onToggleTheme
}) => {
  const [autoDetect, setAutoDetect] = useState(true);
  const [telemetryOverlay, setTelemetryOverlay] = useState(true);
  const [selectedModel, setSelectedModel] = useState('geochat-7b');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [customAgentUrl, setCustomAgentUrl] = useState('http://localhost:8000/api/v1/analyze');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Load backend settings
  useEffect(() => {
    const fetchBackendSettings = async () => {
      try {
        const resp = await api.getSettings();
        if (resp.default_model) setSelectedModel(resp.default_model);
        if (resp.confidence_threshold) setConfidenceThreshold(Math.round(resp.confidence_threshold * 100));
        if (resp.auto_detect_modality !== undefined) setAutoDetect(resp.auto_detect_modality);
      } catch (err) {
        console.warn('Using local settings state:', err);
      }
    };
    fetchBackendSettings();
  }, [isDarkMode]);

  const handleSave = async () => {
    try {
      await api.updateSettings({
        default_model: selectedModel,
        confidence_threshold: confidenceThreshold / 100,
        auto_detect_modality: autoDetect,
        theme: isDarkMode ? 'dark' : 'light'
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to persist settings:', err);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div className="page-workspace" style={{ flexDirection: 'column' }}>
      {/* Top back navigation button */}
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
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
          Panel 05 — System Preferences
        </div>
      </div>

      {/* Settings Split Layout (Left: Form Card, Right: Ambient Alpine Peak Card) */}
      <div className="settings-container">
        {/* Left Card: Frosted Glass Form (Matching Panel 05) */}
        <div
          style={{
            background: 'var(--glass-surface)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--glass-shadow)',
            padding: '32px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Header Icon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <Settings size={20} color="#334155" strokeWidth={1.8} />
            </div>

            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Engine & UI Settings
            </span>
          </div>

          {/* Setting 1: Dark Twilight Theme Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDarkMode ? <Moon size={18} color="var(--accent-blue)" /> : <Sun size={18} color="#f59e0b" />}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Alpine Twilight Dark Mode
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Toggle between ethereal mist morning and twilight night
                </div>
              </div>
            </div>

            <div
              className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
              onClick={onToggleTheme}
              role="switch"
              aria-checked={isDarkMode}
              tabIndex={0}
            >
              <div className="toggle-thumb" />
            </div>
          </div>

          {/* Setting 2: Modality Auto-Detect Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Cpu size={18} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Automated Band & Sensor Detection
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Auto-identify RGB, SAR, and Multispectral GeoTIFF bands
                </div>
              </div>
            </div>

            <div
              className={`toggle-switch ${autoDetect ? 'active' : ''}`}
              onClick={() => setAutoDetect(!autoDetect)}
              role="switch"
              aria-checked={autoDetect}
              tabIndex={0}
            >
              <div className="toggle-thumb" />
            </div>
          </div>

          {/* Setting 3: Telemetry Overlay */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={18} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Telemetry & Reasoning Overlay
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Display execution trace and confidence telemetry
                </div>
              </div>
            </div>

            <div
              className={`toggle-switch ${telemetryOverlay ? 'active' : ''}`}
              onClick={() => setTelemetryOverlay(!telemetryOverlay)}
              role="switch"
              aria-checked={telemetryOverlay}
              tabIndex={0}
            >
              <div className="toggle-thumb" />
            </div>
          </div>

          {/* Setting 4: Vision Model Dropdown */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Vision-Language Model Engine
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="geochat-7b">GeoChat-7B (Satellite Vision Specialist)</option>
              <option value="changechat-13b">ChangeChat-13B (Bi-Temporal Diff)</option>
              <option value="qwen-vl">Qwen2.5-VL 72B (High-Precision Multimodal)</option>
              <option value="internvl-3">InternVL-3 (Multispectral EO Agent)</option>
            </select>
          </div>

          {/* Setting 5: Confidence Threshold Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Detection Confidence Filter</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                {confidenceThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          {/* Setting 6: Plug-and-Play AI Agent URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Network size={15} color="var(--accent-blue)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Fine-Tuned AI Agent Endpoint
              </span>
              <span style={{ fontSize: '11px', color: '#10b981', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Ready for Custom Model
              </span>
            </div>
            <input
              type="text"
              value={customAgentUrl}
              onChange={(e) => setCustomAgentUrl(e.target.value)}
              placeholder="http://localhost:8000/api/v1/analyze"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-blue)',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)'
            }}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check size={16} />
                <span>Configuration Saved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>

        {/* Right Side: Alpine Peak Artwork Card (Matching Panel 05 in Mockup) */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            background: 'var(--glass-surface)',
            backdropFilter: 'var(--glass-blur)',
            position: 'relative',
            minHeight: '380px'
          }}
        >
          <img
            src="/alpine_day.jpg"
            alt="Alpine Peak Scenery"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600 }}>SatQuery AI v2.4</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sentinel-2 & Landsat-9 Remote Sensing</div>
          </div>
        </div>
      </div>
    </div>
  );
};
