import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        width: '100%',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        fontSize: '13.5px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <Settings size={17} />
      <span>Settings</span>
    </button>
  );
};
