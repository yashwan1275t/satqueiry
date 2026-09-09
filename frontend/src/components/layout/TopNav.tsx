import React, { useState } from 'react';
import { User, Menu, Sparkles, Database, Sliders, ShieldCheck } from 'lucide-react';

interface TopNavProps {
  onGoHome: () => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onGoHome,
  onOpenMenu,
  onOpenProfile
}) => {
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  const handleRingClick = () => {
    onGoHome();
    setShowStatusSheet((prev) => !prev);
  };

  return (
    <header className="top-nav" style={{ position: 'relative' }}>
      {/* 
        FUNCTIONAL Minimalist Brand Ring Logo (Circled in WHITE by User) 
        Clicking resets/navigates Home and toggles the Apple-style Dynamic Status Island
      */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleRingClick}
          className="brand-ring-logo"
          aria-label="SatQuery AI Home & Status"
          title="SatQuery AI • Click to Return Home / Status"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer'
          }}
        >
          {/* Inner Active Status Glow Ring */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: '0 0 10px #38bdf8',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        </button>

        {/* Apple iOS Glass Status Popover Sheet */}
        {showStatusSheet && (
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: '0',
              width: '280px',
              background: 'rgba(15, 23, 42, 0.78)',
              backdropFilter: 'blur(32px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              padding: '16px',
              zIndex: 100,
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>SatQuery AI Online</span>
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>v2.4.0</span>
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
              Intelligent Remote Sensing & Earth Observation Platform ready for GeoTIFF and high-res imagery analysis.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <button
                onClick={() => {
                  onGoHome();
                  setShowStatusSheet(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={13} color="#38bdf8" />
                <span>New Observation Upload</span>
              </button>

              <button
                onClick={() => {
                  onOpenMenu();
                  setShowStatusSheet(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Database size={13} color="#a855f7" />
                <span>Browse Archive History</span>
              </button>

              <button
                onClick={() => {
                  onOpenProfile();
                  setShowStatusSheet(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Sliders size={13} color="#f59e0b" />
                <span>Engine Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right User & Menu Icons */}
      <div className="top-nav-actions">
        <button
          onClick={onOpenProfile}
          className="nav-icon-btn"
          aria-label="User Profile"
          title="Account / Engine Preferences"
        >
          <User size={18} />
        </button>

        <button
          onClick={onOpenMenu}
          className="nav-icon-btn"
          aria-label="Navigation Menu"
          title="Archive History"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
};
