import React from 'react';
import { Home, Image as ImageIcon, Clock, Settings } from 'lucide-react';

export type AppView = 'upload' | 'processing' | 'results' | 'history' | 'settings';

interface IconRailProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export const IconRail: React.FC<IconRailProps> = ({ activeView, onNavigate }) => {
  return (
    <nav className="icon-rail" aria-label="Quick Navigation">
      <button
        onClick={() => onNavigate('upload')}
        className={`rail-btn ${activeView === 'upload' ? 'active' : ''}`}
        title="01. Landing / Upload"
        aria-label="Upload / Home"
      >
        <Home size={19} />
      </button>

      <button
        onClick={() => onNavigate('history')}
        className={`rail-btn ${activeView === 'history' ? 'active' : ''}`}
        title="04. History & Archive"
        aria-label="History"
      >
        <ImageIcon size={19} />
      </button>

      <button
        onClick={() => onNavigate('results')}
        className={`rail-btn ${activeView === 'results' || activeView === 'processing' ? 'active' : ''}`}
        title="03. Results Analysis"
        aria-label="Results"
      >
        <Clock size={19} />
      </button>

      <button
        onClick={() => onNavigate('settings')}
        className={`rail-btn ${activeView === 'settings' ? 'active' : ''}`}
        title="05. Settings"
        aria-label="Settings"
      >
        <Settings size={19} />
      </button>
    </nav>
  );
};
