import React, { useState } from 'react';
import { Search, LayoutGrid, List, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  imageUrl: string;
  sector: string;
  confidence: number;
  tags: string[];
}

interface HistoryPageProps {
  serverChats?: ChatSession[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

const DEFAULT_HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 'hist-1',
    title: 'Alps Alpine Snow Ridge',
    timestamp: 'Today, 14:22',
    imageUrl: '/satellite_terrain.jpg',
    sector: 'Central Alps 46°N',
    confidence: 0.98,
    tags: ['Sentinel-2', 'Elevation', 'Glacier']
  },
  {
    id: 'hist-2',
    title: 'Ethereal Mist Valley Peak',
    timestamp: 'Today, 11:05',
    imageUrl: '/alpine_day.jpg',
    sector: 'Bavarian Ridge 47°N',
    confidence: 0.94,
    tags: ['Thermal', 'Mist', 'Valley']
  },
  {
    id: 'hist-3',
    title: 'Atlantic Coastal Cliffs',
    timestamp: 'Yesterday',
    imageUrl: '/card_coastal_shore.jpg',
    sector: 'Celtic Coast 50°N',
    confidence: 0.96,
    tags: ['Shoreline', 'Bathymetry', 'Waves']
  },
  {
    id: 'hist-4',
    title: 'Metropolitan Heat Island',
    timestamp: 'Yesterday',
    imageUrl: '/card_city_sunset.jpg',
    sector: 'Manhattan 40°N',
    confidence: 0.95,
    tags: ['Urban', 'Thermal', 'Infra']
  },
  {
    id: 'hist-5',
    title: 'Evergreen River Basin',
    timestamp: 'Sep 06',
    imageUrl: '/card_pine_river.jpg',
    sector: 'Cascades 48°N',
    confidence: 0.97,
    tags: ['Hydrology', 'Canopy', 'NDVI']
  },
  {
    id: 'hist-6',
    title: 'Sahara Sand Dune Crests',
    timestamp: 'Sep 05',
    imageUrl: '/card_desert_dune.jpg',
    sector: 'Erg Chebbi 31°N',
    confidence: 0.99,
    tags: ['Arid', 'Geomorphology', 'SAR']
  },
  {
    id: 'hist-7',
    title: 'Canopy Chlorophyll Index',
    timestamp: 'Sep 03',
    imageUrl: '/card_green_leaf.jpg',
    sector: 'Rainforest 03°S',
    confidence: 0.93,
    tags: ['Vegetation', 'Moisture', 'Bio']
  },
  {
    id: 'hist-8',
    title: 'Orbital Nighttime Light',
    timestamp: 'Sep 01',
    imageUrl: '/card_milky_way.jpg',
    sector: 'High Sierra 37°N',
    confidence: 0.97,
    tags: ['Night', 'Emissions', 'Astro']
  }
];

export const HistoryPage: React.FC<HistoryPageProps> = ({
  serverChats = [],
  onSelectItem,
  onDeleteItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<HistoryItem[]>(() => {
    // Put 8 canonical reference cards first so the 4x2 grid matches Panel 04
    const customItems: HistoryItem[] = serverChats.map((c, i) => ({
      id: c.id,
      title: c.title,
      timestamp: new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      imageUrl: i % 2 === 0 ? '/satellite_terrain.jpg' : '/alpine_day.jpg',
      sector: 'EO Earth Observation',
      confidence: 0.95,
      tags: ['Multi-Spectral', 'AI Vision']
    }));
    return [...DEFAULT_HISTORY_ITEMS, ...customItems];
  });

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (onDeleteItem) onDeleteItem(id);
  };

  return (
    <div className="page-workspace" style={{ flexDirection: 'column', padding: '10px 24px 20px' }}>
      <div className="history-container" style={{ maxWidth: '980px' }}>
        {/* Top Frosted Search Bar (Matching Panel 04 of Mockup) */}
        <div className="history-search-bar" style={{ padding: '8px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search previous observations, sectors, or classifications..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* View Switcher (Grid vs List) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`nav-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'var(--glass-surface-active)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={15} />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`nav-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'list' ? 'var(--glass-surface-active)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              title="List View"
              aria-label="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Observation Cards 4x2 Grid (Panel 04) */}
        {viewMode === 'grid' ? (
          <div className="history-grid-4x2" style={{ gap: '14px' }}>
            {filteredItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="history-card-item"
                onClick={() => onSelectItem(item)}
                style={{ position: 'relative' }}
              >
                {/* Card Image Thumbnail */}
                <div style={{ width: '100%', height: '88px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      padding: '2px 5px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(15, 23, 42, 0.65)',
                      backdropFilter: 'blur(8px)',
                      color: '#f8fafc',
                      fontSize: '9px',
                      fontWeight: 600
                    }}
                  >
                    {Math.round(item.confidence * 100)}%
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '8px 12px 10px' }}>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10.5px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span>{item.sector}</span>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Delete Entry"
                      aria-label="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List Mode Alternative */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '10px 16px',
                  background: 'var(--glass-surface)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.sector} • {item.timestamp}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.4)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
