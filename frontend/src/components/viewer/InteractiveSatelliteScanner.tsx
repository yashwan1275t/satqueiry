import React, { useState, useRef } from 'react';
import {
  Crosshair,
  Mountain,
  Building2,
  Waves,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
  Eye,
  SlidersHorizontal,
  Compass,
  Download
} from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  icon: React.ReactNode;
  bounds: { left: string; top: string; width: string; height: string };
  telemetry: {
    coords: string;
    elevation: string;
    slope: string;
    classification: string;
    spectral: string;
  };
}

interface InteractiveSatelliteScannerProps {
  imageUrl?: string;
  onSelectSectorReport?: (sectorName: string) => void;
  activeSectorId?: string;
}

type SpectralBandMode = 'rgb' | 'cir' | 'ndvi' | 'swir' | 'thermal';

export const InteractiveSatelliteScanner: React.FC<InteractiveSatelliteScannerProps> = ({
  imageUrl,
  onSelectSectorReport,
  activeSectorId = 'mountains'
}) => {
  const [selectedSector, setSelectedSector] = useState<string | null>(activeSectorId);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [bandMode, setBandMode] = useState<SpectralBandMode>('rgb');
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number; lat: string; lon: string } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Defined interactive satellite sectors aligned with real satellite terrain
  const sectors: Sector[] = [
    {
      id: 'mountains',
      name: 'Alpine Mountain Ridge & Peaks',
      icon: <Mountain size={14} color="var(--accent-red)" />,
      bounds: { left: '44%', top: '4%', width: '52%', height: '44%' },
      telemetry: {
        coords: '46°18\'34"N 10°03\'12"E',
        elevation: '3,840 m MSL',
        slope: '28.4° Steep Escarpment',
        classification: 'Alpine Bedrock, Glacial Talus & Firn',
        spectral: 'NDSI: 0.74 (Snow/Ice) | Albedo: 0.68'
      }
    },
    {
      id: 'urban',
      name: 'Valley Settlement & Infrastructure',
      icon: <Building2 size={14} color="var(--accent-blue)" />,
      bounds: { left: '22%', top: '48%', width: '56%', height: '24%' },
      telemetry: {
        coords: '46°16\'22"N 10°01\'48"E',
        elevation: '1,420 m MSL',
        slope: '2.4° Valley Floor',
        classification: 'Cadastral Built-up & Transport Corridors',
        spectral: 'Impervious Ratio: 68% | Thermal: 22.4°C'
      }
    },
    {
      id: 'water',
      name: 'Hydrological Glacial River Basin',
      icon: <Waves size={14} color="#06b6d4" />,
      bounds: { left: '4%', top: '50%', width: '42%', height: '36%' },
      telemetry: {
        coords: '46°15\'10"N 09°58\'30"E',
        elevation: '1,380 m MSL',
        slope: '1.2° Alluvial Floodplain',
        classification: 'Active Braided River & Riparian Corridor',
        spectral: 'MNDWI: +0.48 | Sediment Load: Moderate'
      }
    }
  ];

  // Authentic local satellite image texture
  const baseImage = imageUrl || '/satellite_terrain.jpg';

  const handleSectorClick = (sectorId: string) => {
    setSelectedSector(sectorId);
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          if (onSelectSectorReport) {
            const sec = sectors.find((s) => s.id === sectorId);
            onSelectSectorReport(sec ? sec.name : sectorId);
          }
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const pctX = (x / rect.width);
    const pctY = (y / rect.height);
    
    // Synthetic geographic mapping across 46°N 10°E quadrant
    const lat = (46.32 - pctY * 0.18).toFixed(4);
    const lon = (10.02 + pctX * 0.22).toFixed(4);
    setMouseCoords({ x, y, lat: `${lat}°N`, lon: `${lon}°E` });
  };

  const activeSecObj = sectors.find((s) => s.id === selectedSector);

  // Band mode image filters
  const getBandFilter = () => {
    switch (bandMode) {
      case 'cir':
        return 'contrast(130%) hue-rotate(-50deg) saturate(160%)';
      case 'ndvi':
        return 'contrast(160%) hue-rotate(90deg) saturate(180%)';
      case 'swir':
        return 'contrast(150%) brightness(95%) sepia(40%) hue-rotate(180deg)';
      case 'thermal':
        return 'contrast(180%) invert(20%) hue-rotate(240deg) saturate(200%)';
      default:
        return 'none';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#0a0b10',
        border: '1.5px solid rgba(239, 68, 68, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(239, 68, 68, 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Utility Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={16} color="var(--accent-red)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            TARGET SECTOR SCANNER
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '2px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            HUD ACTIVE
          </span>
        </div>

        {/* Multispectral Band Preset Switcher (Utility) */}
        <div style={{ display: 'flex', background: 'rgba(18, 20, 30, 0.8)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setBandMode('rgb')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              border: 'none',
              background: bandMode === 'rgb' ? 'var(--accent-red)' : 'transparent',
              color: bandMode === 'rgb' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Natural Color Surface Reflectance (B4, B3, B2)"
          >
            RGB
          </button>
          <button
            onClick={() => setBandMode('cir')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              border: 'none',
              background: bandMode === 'cir' ? 'var(--accent-red)' : 'transparent',
              color: bandMode === 'cir' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Color Infrared / Vegetation Vigor (B8, B4, B3)"
          >
            CIR
          </button>
          <button
            onClick={() => setBandMode('ndvi')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              border: 'none',
              background: bandMode === 'ndvi' ? 'var(--accent-red)' : 'transparent',
              color: bandMode === 'ndvi' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Normalized Difference Vegetation Index"
          >
            NDVI
          </button>
          <button
            onClick={() => setBandMode('swir')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              border: 'none',
              background: bandMode === 'swir' ? 'var(--accent-red)' : 'transparent',
              color: bandMode === 'swir' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Shortwave Infrared / Lithology & Moisture (B12, B8A, B4)"
          >
            SWIR
          </button>
          <button
            onClick={() => setBandMode('thermal')}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              border: 'none',
              background: bandMode === 'thermal' ? 'var(--accent-red)' : 'transparent',
              color: bandMode === 'thermal' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
            title="Thermal Radiation & Surface Heat"
          >
            THERMAL
          </button>
        </div>
      </div>

      {/* Main Satellite Viewport */}
      <div
        ref={imageContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouseCoords(null)}
        style={{
          position: 'relative',
          width: '100%',
          height: '360px',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'crosshair',
          userSelect: 'none'
        }}
      >
        <img
          src={baseImage}
          alt="Satellite Observation View"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: getBandFilter(),
            transition: 'filter 0.25s ease'
          }}
        />

        {/* Laser Sweep Scanline */}
        <div className="scanline-beam" />

        {/* Compass Heading Watermark (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '2px 6px',
            borderRadius: '2px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}
        >
          <Compass size={11} color="var(--accent-red)" />
          <span>NORTH 000°</span>
        </div>

        {/* Interactive Reticles Overlaid on Terrain */}
        {sectors.map((sec) => {
          const isSelected = selectedSector === sec.id;

          return (
            <div
              key={sec.id}
              onClick={() => handleSectorClick(sec.id)}
              className={`target-reticle ${isSelected ? 'active' : ''}`}
              style={{
                left: sec.bounds.left,
                top: sec.bounds.top,
                width: sec.bounds.width,
                height: sec.bounds.height
              }}
            >
              {/* Corner targeting brackets */}
              <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '10px', height: '10px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }} />
              <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '10px', height: '10px', borderTop: '2px solid #fff', borderRight: '2px solid #fff' }} />
              <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '10px', height: '10px', borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' }} />
              <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }} />

              {/* Tag Pill */}
              <span
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '0px',
                  background: isSelected ? 'var(--accent-blue)' : 'rgba(239, 68, 68, 0.9)',
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {sec.icon}
                <span>{sec.name.toUpperCase()}</span>
              </span>

              {/* Localized Pulsing Scan Rings */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '12%',
                    borderRadius: '50%',
                    border: '1px dashed #38bdf8',
                    animation: 'spin 5s linear infinite',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Live HUD Telemetry Card on Active Sector */}
        {activeSecObj && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(8, 9, 14, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 13px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
              maxWidth: '340px'
            }}
          >
            <div style={{ color: 'var(--accent-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={11} />
              <span>LOCK: {activeSecObj.name.toUpperCase()}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>COORDS: {activeSecObj.telemetry.coords}</div>
            <div style={{ color: 'var(--text-secondary)' }}>ELEV: {activeSecObj.telemetry.elevation} | SLOPE: {activeSecObj.telemetry.slope}</div>
            <div style={{ color: 'var(--accent-cyan)' }}>LITHOLOGY: {activeSecObj.telemetry.classification}</div>
            <div style={{ color: 'var(--accent-emerald)', fontSize: '10px' }}>SPECTRAL: {activeSecObj.telemetry.spectral}</div>
          </div>
        )}

        {/* Cursor Position Inspector HUD (Utility) */}
        {mouseCoords && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '3px 8px',
              borderRadius: '2px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              pointerEvents: 'none'
            }}
          >
            {mouseCoords.lat}, {mouseCoords.lon} | Px: {mouseCoords.x}, {mouseCoords.y}
          </div>
        )}

        {/* Scale Bar (Bottom Right Utility) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '3px 8px',
            borderRadius: '2px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>1 km</span>
          <div style={{ width: '48px', height: '3px', background: '#ffffff', border: '1px solid #000' }} />
        </div>

        {/* Scan Progress Line */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: `${scanProgress}%`,
              background: 'linear-gradient(90deg, var(--accent-red), var(--accent-blue))',
              boxShadow: '0 0 14px var(--accent-blue)',
              transition: 'width 0.1s ease-out'
            }}
          />
        )}
      </div>

      {/* Sector Selection Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SELECT SECTOR FOR REPORT:
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sectors.map((sec) => {
            const isSelected = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorClick(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(18, 20, 30, 0.7)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 14px rgba(59, 130, 246, 0.4)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {sec.icon}
                <span>{sec.name}</span>
                {isSelected && <ChevronRight size={13} color="var(--accent-blue)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
