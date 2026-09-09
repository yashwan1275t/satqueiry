import React from 'react';
import { Logo } from './Logo';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Brand: React.FC<BrandProps> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} />
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: size === 'lg' ? '22px' : size === 'sm' ? '15px' : '17px',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-red) 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}
        >
          SatQuery AI
        </span>
        {size === 'lg' && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Satellite Vision & Remote Sensing Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
