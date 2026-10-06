"use client";

const paletteDefs = [
  { category: 'FeedTank', label: 'Feed Tank', height: 100, width: 80, fillLevel: 0.6 },
  { category: 'Shredder', label: 'Shredder' },
  { category: 'MixingTank', label: 'Mixing Tank', height: 100, width: 80, fillLevel: 0.5 },
  { category: 'Pump', label: 'Pump' },
  { category: 'HeatExchanger', label: 'Heat Exchanger' },
  { category: 'Digester', label: 'Digester', height: 110, width: 55, fillLevel: 0.7 },
  { category: 'GasHolder', label: 'Gas Holder', height: 100, width: 80, fillLevel: 0.4 },
  { category: 'DigestateTank', label: 'Digestate Tank', height: 100, width: 80, fillLevel: 0.3 },
  { category: 'Separator', label: 'Separator' },
  { category: 'Valve', label: 'Valve' },
];

function paletteIcon(category) {
  const stroke = '#8b9a93', fill = '#eef2f4', wet = '#194a7a';
  const icons = {
    FeedTank: `<svg width="22" height="20" viewBox="0 0 30 26"><rect x="1" y="4" width="28" height="18" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M1 15 a9 9 0 0 0 9 7 h10 a9 9 0 0 0 9 -7 z" fill="${wet}" opacity="0.55"/></svg>`,
    MixingTank: `<svg width="22" height="20" viewBox="0 0 30 26"><rect x="1" y="4" width="28" height="18" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M1 14 a9 9 0 0 0 9 8 h10 a9 9 0 0 0 9 -8 z" fill="${wet}" opacity="0.55"/><path d="M15 4 V15 M11 12 L19 12" stroke="${stroke}" stroke-width="1.6"/></svg>`,
    GasHolder: `<svg width="22" height="20" viewBox="0 0 30 26"><rect x="1" y="4" width="28" height="18" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M1 18 a9 9 0 0 0 9 4 h10 a9 9 0 0 0 9 -4 z" fill="${wet}" opacity="0.4"/></svg>`,
    DigestateTank: `<svg width="22" height="20" viewBox="0 0 30 26"><rect x="1" y="4" width="28" height="18" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M1 16 a9 9 0 0 0 9 6 h10 a9 9 0 0 0 9 -6 z" fill="${wet}" opacity="0.5"/></svg>`,
    Digester: `<svg width="16" height="22" viewBox="0 0 20 30"><rect x="1" y="1" width="18" height="28" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M1 13 a9 9 0 0 0 0 12 a9 9 0 0 0 18 0 a9 9 0 0 0 0 -12 z" fill="${wet}" opacity="0.55"/></svg>`,
    Shredder: `<svg width="22" height="20" viewBox="0 0 30 26"><path d="M4 4 H26 L20 18 H10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><line x1="10" y1="8" x2="16" y2="14" stroke="#374840" stroke-width="1.6"/><line x1="16" y1="8" x2="10" y2="14" stroke="#374840" stroke-width="1.6"/></svg>`,
    Pump: `<svg width="22" height="20" viewBox="0 0 30 26"><circle cx="15" cy="10" r="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><rect x="8" y="19" width="14" height="5" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/></svg>`,
    HeatExchanger: `<svg width="22" height="20" viewBox="0 0 30 26"><circle cx="15" cy="13" r="11" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M9 7 L21 19 M21 7 L9 19" stroke="#c2410c" stroke-width="1.8"/></svg>`,
    Separator: `<svg width="16" height="22" viewBox="0 0 20 30"><rect x="1" y="1" width="18" height="28" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><path d="M2 20 H18" stroke="${stroke}" stroke-width="1.3" stroke-dasharray="2,2"/></svg>`,
    Valve: `<svg width="22" height="20" viewBox="0 0 30 26"><path d="M3 5 L15 13 3 21 Z M27 5 L15 13 27 21 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/></svg>`,
  };
  return icons[category] || '';
}

export default function NodePalette() {
  return (
    <div className="ew-palette">
      <div className="ew-palette-title">Components</div>
      <div className="ew-palette-sub">Drag onto canvas</div>
      <div className="ew-palette-list">
        {paletteDefs.map((def) => (
          <div
            key={def.category}
            className="ew-pal-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('application/json', JSON.stringify(def));
            }}
          >
            <span className="ew-pal-icon" dangerouslySetInnerHTML={{ __html: paletteIcon(def.category) }} />
            <span className="ew-pal-label">{def.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}