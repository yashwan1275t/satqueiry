import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Layers, Compass } from 'lucide-react';
import { EvidenceItem } from '../../types';

interface GeoMapViewProps {
  evidence: EvidenceItem[];
  center?: [number, number];
  zoom?: number;
}

export const GeoMapView: React.FC<GeoMapViewProps> = ({
  evidence,
  center = [12.9716, 77.5946], // Default Bengaluru Remote Sensing Hub / Earth Observation Corridor
  zoom = 13
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Base Tile Layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      // Esri World Imagery (Standard Satellite Basemap)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18
        }
      ).addTo(map);
    } else {
      // CartoDB Dark Matter / Positron
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19
        }
      ).addTo(map);
    }

    // Render Evidence Polygons on Map
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();

      // Footprint polygon
      const boundsPoly = L.polygon([
        [center[0] - 0.03, center[1] - 0.04],
        [center[0] + 0.03, center[1] - 0.04],
        [center[0] + 0.03, center[1] + 0.04],
        [center[0] - 0.03, center[1] + 0.04]
      ], {
        color: '#06b6d4',
        weight: 1.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.05,
        dashArray: '4 4'
      }).bindPopup('<b>Satellite Scene Footprint</b><br/>Sensor: Sentinel-2 Multispectral');
      layerGroupRef.current.addLayer(boundsPoly);

      // Add evidence bounding boxes mapped to coordinates
      evidence.forEach((ev, idx) => {
        if (ev.type === 'bbox' && Array.isArray(ev.coordinates) && ev.coordinates.length === 4) {
          const [minX, minY, maxX, maxY] = ev.coordinates;
          const latSpan = 0.05;
          const lonSpan = 0.06;

          const poly = L.polygon([
            [center[0] + 0.02 - (maxY * latSpan), center[1] - 0.03 + (minX * lonSpan)],
            [center[0] + 0.02 - (minY * latSpan), center[1] - 0.03 + (minX * lonSpan)],
            [center[0] + 0.02 - (minY * latSpan), center[1] - 0.03 + (maxX * lonSpan)],
            [center[0] + 0.02 - (maxY * latSpan), center[1] - 0.03 + (maxX * lonSpan)]
          ], {
            color: ev.color || '#06b6d4',
            weight: 2,
            fillColor: ev.color || '#06b6d4',
            fillOpacity: 0.25
          }).bindPopup(`<b>${ev.label}</b><br/>Confidence: ${(ev.confidence * 100).toFixed(1)}%`);

          layerGroupRef.current?.addLayer(poly);
        }
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [evidence, center, zoom, mapType]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        marginTop: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Geographic Map & Spatial Footprint (Leaflet)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setMapType('satellite')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${mapType === 'satellite' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: mapType === 'satellite' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
              color: mapType === 'satellite' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Satellite Basemap
          </button>
          <button
            onClick={() => setMapType('streets')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${mapType === 'streets' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: mapType === 'streets' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
              color: mapType === 'streets' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Carto Vector
          </button>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '300px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          zIndex: 10
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Center: {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E (WGS 84 / EPSG:4326)</span>
        <span>Click features for detection details</span>
      </div>
    </div>
  );
};
