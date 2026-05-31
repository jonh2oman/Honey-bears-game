import React, { useEffect, useRef, useMemo } from 'react';

const MAP_HEIGHT = 6000;
const MAP_WIDTH = 600;
const SPACES_COUNT = 100;

export default function GameBoard({ players, activePlayerIndex, spaces, onSpaceClick }) {
  const containerRef = useRef(null);
  const activeBearRef = useRef(null);

  // Generate winding path coordinates (bottom to top)
  const boardCoordinates = useMemo(() => {
    const coords = [];
    const padding = 120;
    const step = (MAP_HEIGHT - padding * 2) / (SPACES_COUNT - 1);
    
    for (let i = 0; i < SPACES_COUNT; i++) {
      const y = (MAP_HEIGHT - padding) - (i * step);
      // Winding snaking effect
      const x = (MAP_WIDTH / 2) + Math.sin(i * 0.4) * 140;
      coords.push({ x, y });
    }
    return coords;
  }, []);

  // Winding path SVG path data
  const pathD = useMemo(() => {
    let d = `M ${boardCoordinates[0].x} ${boardCoordinates[0].y}`;
    for (let i = 1; i < boardCoordinates.length; i++) {
      // Use cubic curves for extra smooth winding road
      const prev = boardCoordinates[i - 1];
      const curr = boardCoordinates[i];
      const cpY1 = prev.y - 20;
      const cpY2 = curr.y + 20;
      d += ` C ${prev.x} ${cpY1}, ${curr.x} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [boardCoordinates]);

  // Player stagger offsets to place them side by side
  const getPlayerOffset = (playerId) => {
    const angle = (playerId * 2 * Math.PI) / 4;
    const r = 24; // offset radius
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    };
  };

  // Center viewport on active player
  useEffect(() => {
    if (activeBearRef.current) {
      activeBearRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activePlayerIndex, players[activePlayerIndex]?.position]);

  // Initial scroll to bottom (start of the board)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = MAP_HEIGHT;
    }
  }, []);

  const getSpaceColorClass = (type) => {
    switch (type) {
      case 'START': return 'space-start';
      case 'END': return 'space-end';
      case 'HONEY_1': return 'space-honey-1';
      case 'HONEY_2': return 'space-honey-2';
      case 'HONEY_3': return 'space-honey-3';
      case 'HAZARD_BEE': return 'space-hazard-bee';
      case 'HAZARD_SKUNK': return 'space-hazard-skunk';
      case 'HAZARD_HUNTER': return 'space-hazard-hunter';
      case 'HAZARD_MUD': return 'space-hazard-mud';
      case 'QUEST': return 'space-quest';
      default: return '';
    }
  };

  const getSpaceEmoji = (space, i) => {
    if (i === 0) return 'START';
    if (i === 99) return 'WIN';
    switch (space?.type) {
      case 'HONEY_1': return '🍯1';
      case 'HONEY_2': return '🍯2';
      case 'HONEY_3': return '🍯3';
      case 'HAZARD_BEE': return '🐝';
      case 'HAZARD_SKUNK': return '🦨';
      case 'HAZARD_HUNTER': return '🤠';
      case 'HAZARD_MUD': return '💩';
      case 'QUEST': return '❓';
      default: return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className="board-scroll-container"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '75vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        padding: '10px 0'
      }}
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        width="100%"
        height={MAP_HEIGHT}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="stump-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Winding woods road background */}
        <path d={pathD} fill="none" stroke="#5c3d2e" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathD} fill="none" stroke="#8b5a2b" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14 10" />

        {/* Tree Stumps spaces */}
        {spaces.map((space, i) => {
          const coord = boardCoordinates[i];
          const radius = i === 0 || i === 99 ? 36 : 28;
          return (
            <g
              key={i}
              className={`board-space ${getSpaceColorClass(space?.type)}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSpaceClick?.(i)}
            >
              {/* Bark */}
              <circle cx={coord.x} cy={coord.y} r={radius} className="stump-bark" filter="url(#stump-shadow)" />
              {/* Wood Face */}
              <circle cx={coord.x} cy={coord.y} r={radius - 4} className="stump-wood" />
              {/* Rings */}
              <circle cx={coord.x} cy={coord.y} r={(radius - 4) * 0.7} className="stump-ring" />
              <circle cx={coord.x} cy={coord.y} r={(radius - 4) * 0.35} className="stump-ring" />
              {/* Label */}
              <text
                x={coord.x}
                y={coord.y + 4}
                textAnchor="middle"
                fontFamily="Fredoka"
                fontWeight="bold"
                fontSize={i === 0 || i === 99 ? '11px' : '9px'}
                fill="#5c3a21"
              >
                {getSpaceEmoji(space, i)}
              </text>
            </g>
          );
        })}

        {/* Player Bears */}
        {players.map((p, idx) => {
          const coord = boardCoordinates[p.position];
          const offset = getPlayerOffset(p.id);
          const isCurrent = activePlayerIndex === idx;

          return (
            <g
              key={p.id}
              ref={isCurrent ? activeBearRef : null}
              transform={`translate(${coord.x + offset.x}, ${coord.y + offset.y})`}
              style={{
                transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                zIndex: isCurrent ? 10 : 1
              }}
            >
              {/* Token background badge */}
              <circle
                r="24"
                fill={p.color}
                stroke={isCurrent ? '#f59e0b' : '#ffffff'}
                strokeWidth={isCurrent ? '4' : '3'}
                filter="url(#stump-shadow)"
                style={{
                  transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
              />
              <text
                y="8"
                textAnchor="middle"
                fontSize="24px"
                style={{ pointerEvents: 'none' }}
              >
                🐻
              </text>
              {isCurrent && (
                <text
                  y="-28"
                  textAnchor="middle"
                  fontFamily="Fredoka"
                  fontWeight="bold"
                  fontSize="12px"
                  fill="#f59e0b"
                  style={{
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.6))',
                    animation: 'bounce 0.8s infinite ease-in-out'
                  }}
                >
                  ⭐
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
