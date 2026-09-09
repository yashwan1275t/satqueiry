import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animate = false }) => {
  const pixelMap = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };
  const px = pixelMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center relative ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'animate-spin-slow' : ''}
      >
        <defs>
          <linearGradient id="satquery-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="satquery-ring-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Path */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="var(--border-medium)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Elliptical Satellite Orbit Ring */}
        <ellipse
          cx="24"
          cy="24"
          rx="21"
          ry="9"
          transform="rotate(-28 24 24)"
          stroke="url(#satquery-ring-grad)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Central Planetary Earth Core */}
        <circle
          cx="24"
          cy="24"
          r="10"
          fill="url(#satquery-cyan-grad)"
        />

        {/* Planetary Latitude/Longitude Grid Lines */}
        <ellipse
          cx="24"
          cy="24"
          rx="5"
          ry="10"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1"
          fill="none"
        />
        <line
          x1="14"
          y1="24"
          x2="34"
          y2="24"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1"
        />

        {/* Satellite Node on Orbit */}
        <circle
          cx="39"
          cy="16"
          r="3"
          fill="#10b981"
          filter="url(#glow)"
        />

        {/* Satellite Solar Panels */}
        <rect
          x="35"
          y="15"
          width="8"
          height="2"
          rx="0.5"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
