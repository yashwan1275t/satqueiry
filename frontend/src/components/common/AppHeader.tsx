import React from 'react';
import { Menu, Moon, Sun, Monitor, Maximize2, Minimize2, Radio } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Brand } from './Brand';

interface AppHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeChatTitle?: string;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  activeChatTitle
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Menu size={17} />
        </button>

        {!sidebarOpen && <Brand size="sm" />}

        {activeChatTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {activeChatTitle}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Aerospace Sensor Telemetry Tag (Utility) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(12, 13, 19, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em'
          }}
        >
          <Radio size={12} color="var(--accent-red)" />
          <span>S2-MSI L2A</span>
        </div>

        {/* Fullscreen Toggle Button (Utility) */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme.toUpperCase()}`}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)'
          }}
        >
          {theme === 'system' ? (
            <Monitor size={15} />
          ) : resolvedTheme === 'dark' ? (
            <Moon size={15} />
          ) : (
            <Sun size={15} />
          )}
        </button>
      </div>
    </header>
  );
};
