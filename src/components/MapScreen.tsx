import React, { useEffect, useRef } from 'react';
import { PlayerState } from '../types';
import { Map, Star, Lock, CheckCircle, Rocket } from 'lucide-react';

interface MapScreenProps {
  player: PlayerState;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

const LEVEL_HEIGHT = 60;
const TOTAL_LEVELS = 50;

// Pseudo-random number generator for consistent background
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const getPlanetColors = (level: number) => {
  const types = [
    { bg: 'from-blue-400 to-emerald-600', shadow: 'rgba(59, 130, 246, 0.6)' }, // Earth-like
    { bg: 'from-red-500 to-orange-800', shadow: 'rgba(239, 68, 68, 0.6)' }, // Mars-like
    { bg: 'from-purple-400 to-indigo-800', shadow: 'rgba(168, 85, 247, 0.6)' }, // Gas Giant
    { bg: 'from-cyan-200 to-blue-600', shadow: 'rgba(6, 182, 212, 0.6)' }, // Ice
    { bg: 'from-amber-400 to-red-700', shadow: 'rgba(245, 158, 11, 0.6)' }, // Lava
    { bg: 'from-fuchsia-500 to-pink-800', shadow: 'rgba(217, 70, 239, 0.6)' }, // Alien
  ];
  return types[level % types.length];
};

const MapScreen: React.FC<MapScreenProps> = ({ player, onSelectLevel, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerHeight = TOTAL_LEVELS * LEVEL_HEIGHT + 300; // Extra padding for top header + bottom safe area

  // Generate path points
  const points = React.useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    // Tighter zig-zag pattern
    const xOffset = Math.sin(i * 1.2) * 25; // -25 to 25
    const x = 50 + xOffset;
    // Bottom to top: level 1 is at the bottom
    const y = containerHeight - (i * LEVEL_HEIGHT + 80);
    return { level, x, y };
  }), [containerHeight]);

  const createSmoothPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x;
      const cp1y = p0.y - (p0.y - p1.y) / 2;
      const cp2x = p1.x;
      const cp2y = p0.y - (p0.y - p1.y) / 2;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Generate background decorations (Nebulas)
  const decorations = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 10) * 100,
    y: pseudoRandom(i * 10 + 1) * containerHeight,
    size: pseudoRandom(i * 10 + 2) * 500 + 300,
    color: ['bg-purple-900/40', 'bg-blue-900/40', 'bg-fuchsia-900/30', 'bg-indigo-900/40'][Math.floor(pseudoRandom(i * 10 + 3) * 4)],
    opacity: pseudoRandom(i * 10 + 4) * 0.5 + 0.3,
  }));

  // Generate Stars
  const stars = Array.from({ length: 400 }).map((_, i) => {
    const size = pseudoRandom(i * 20 + 2) * 2.5 + 0.5;
    const colors = ['bg-white', 'bg-blue-100', 'bg-purple-100', 'bg-yellow-50'];
    return {
      id: i,
      x: pseudoRandom(i * 20) * 100,
      y: pseudoRandom(i * 20 + 1) * containerHeight,
      size,
      color: colors[Math.floor(pseudoRandom(i * 20 + 5) * colors.length)],
      opacity: pseudoRandom(i * 20 + 3) * 0.7 + 0.1,
      twinkle: pseudoRandom(i * 20 + 4) > 0.7, // 30% of stars twinkle
    };
  });

  // Generate Background Planets
  const bgPlanets = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 30) * 100,
    y: pseudoRandom(i * 30 + 1) * containerHeight,
    size: pseudoRandom(i * 30 + 2) * 120 + 40,
    color: ['from-emerald-500/60 to-teal-900/60', 'from-red-500/60 to-rose-900/60', 'from-indigo-500/60 to-purple-900/60', 'from-amber-500/60 to-orange-900/60', 'from-cyan-400/60 to-blue-800/60', 'from-fuchsia-500/60 to-pink-900/60'][Math.floor(pseudoRandom(i * 30 + 3) * 6)],
    opacity: pseudoRandom(i * 30 + 4) * 0.6 + 0.3,
  }));

  // Generate Asteroids
  const asteroids = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 40) * 100,
    y: pseudoRandom(i * 40 + 1) * containerHeight,
    size: pseudoRandom(i * 40 + 2) * 20 + 8,
    rotation: pseudoRandom(i * 40 + 3) * 360,
    color: ['bg-stone-600', 'bg-slate-600', 'bg-zinc-600', 'bg-neutral-600', 'bg-amber-900/80', 'bg-purple-900/80'][Math.floor(pseudoRandom(i * 40 + 5) * 6)],
    opacity: pseudoRandom(i * 40 + 4) * 0.7 + 0.3,
  }));

  // Generate Comets
  const comets = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 50) * 100,
    y: pseudoRandom(i * 50 + 1) * containerHeight,
    length: pseudoRandom(i * 50 + 2) * 150 + 50,
    angle: pseudoRandom(i * 50 + 3) * 360, // 0 to 360 degrees
    color: ['rgba(56,189,248,', 'rgba(167,139,250,', 'rgba(52,211,153,', 'rgba(251,146,60,', 'rgba(255,255,255,'][Math.floor(pseudoRandom(i * 50 + 5) * 5)],
    opacity: pseudoRandom(i * 50 + 4) * 0.8 + 0.4,
  }));

  // Auto-scroll to current level
  useEffect(() => {
    const scrollToCurrentLevel = () => {
      const currentLevelElement = document.getElementById(`level-${player.level}`);
      if (currentLevelElement) {
        currentLevelElement.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    };

    // Run after layout is complete
    const timeoutId1 = setTimeout(scrollToCurrentLevel, 50);
    const timeoutId2 = setTimeout(scrollToCurrentLevel, 200);
    const timeoutId3 = setTimeout(scrollToCurrentLevel, 500);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [player.level]);

  // Path data for SVG
  const pathD = createSmoothPath(points);
  const completedPoints = points.filter(p => p.level <= player.level);
  const completedPathD = completedPoints.length > 0 ? createSmoothPath(completedPoints) : '';

  return (
    <div className="h-[100dvh] bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black flex flex-col relative overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-black/60 p-4 rounded-2xl backdrop-blur-xl border border-white/10 pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Map className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-widest uppercase">Galaxy Map</h2>
              <p className="text-xs text-blue-200/60 font-medium">Sector {Math.floor((player.level - 1) / 10) + 1} • Level {player.level}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 transition-all px-6 py-2.5 rounded-xl text-white font-bold border border-white/20 hover:scale-105 active:scale-95"
          >
            Back to Base
          </button>
        </div>
      </div>

      {/* Scrollable Map Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for cleaner look
      >
        {/* Full-width background container */}
        <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden" style={{ height: `${containerHeight}px` }}>
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Deep Space Background Elements */}
          {decorations.map(d => (
            <div
              key={`dec-${d.id}`}
              className={`absolute rounded-full blur-[100px] ${d.color} pointer-events-none mix-blend-screen`}
              style={{
                left: `${d.x}%`,
                top: `${d.y}px`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                opacity: d.opacity,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          {/* Background Planets */}
          {bgPlanets.map(p => (
            <div
              key={`bgp-${p.id}`}
              className={`absolute rounded-full bg-gradient-to-br ${p.color} pointer-events-none`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                transform: 'translate(-50%, -50%)',
                boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.8)'
              }}
            />
          ))}

          {/* Asteroids */}
          {asteroids.map(a => (
            <div
              key={`ast-${a.id}`}
              className={`absolute ${a.color} pointer-events-none`}
              style={{
                left: `${a.x}%`,
                top: `${a.y}px`,
                width: `${a.size}px`,
                height: `${a.size * 0.8}px`,
                opacity: a.opacity,
                transform: `translate(-50%, -50%) rotate(${a.rotation}deg)`,
                borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.8), inset 2px 2px 4px rgba(255,255,255,0.2)'
              }}
            />
          ))}

          {/* Comets */}
          {comets.map(c => (
            <div
              key={`comet-${c.id}`}
              className="absolute pointer-events-none"
              style={{
                left: `${c.x}%`,
                top: `${c.y}px`,
                width: `${c.length}px`,
                height: '3px',
                opacity: c.opacity,
                transform: `translate(-50%, -50%) rotate(-${c.angle}deg)`,
                background: `linear-gradient(to right, ${c.color}0) 0%, ${c.color}0.8) 80%, ${c.color}1) 100%)`,
                boxShadow: `0 0 12px ${c.color}0.6)`,
                borderRadius: '100%'
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.9)]" />
            </div>
          ))}

          {/* Stars */}
          {stars.map(s => (
            <div
              key={`star-${s.id}`}
              className={`absolute rounded-full pointer-events-none ${s.color} ${s.twinkle ? 'animate-pulse' : ''}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}px`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                boxShadow: s.size > 1.5 ? `0 0 ${s.size * 2}px rgba(255,255,255,0.4)` : 'none'
              }}
            />
          ))}
        </div>

        {/* Path and Nodes Container */}
        <div 
          className="relative w-full max-w-2xl mx-auto"
          style={{ height: `${containerHeight}px` }}
        >
          {/* Connecting Lines (SVG) */}
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            viewBox={`0 0 100 ${containerHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            
            {/* Uncompleted Path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="8, 12"
              strokeLinecap="round"
            />
            {/* Completed Path */}
            {completedPathD && (
              <path
                d={completedPathD}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]"
              />
            )}
          </svg>

          {/* Level Nodes */}
          {points.map((p) => {
            const isUnlocked = player.level >= p.level;
            const isCurrent = player.level === p.level;
            const isCompleted = player.level > p.level;
            const isMilestone = p.level % 10 === 0;
            const hasRing = p.level % 7 === 0 || isMilestone;
            const { bg, shadow } = getPlanetColors(p.level);
            
            const sizeClass = isMilestone ? 'w-14 h-14 text-xl' : 'w-12 h-12 text-base';
            const ringSize = isMilestone ? 'scale-[1.4]' : 'scale-[1.2]';

            return (
              <button
                key={p.level}
                id={`level-${p.level}`}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(p.level)}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  ${sizeClass} rounded-full flex items-center justify-center font-bold transition-all duration-500
                  ${!isUnlocked && !isCurrent && !isCompleted ? 'bg-slate-800 text-slate-500 border-2 border-slate-700 cursor-not-allowed opacity-60 z-10' : ''}
                  ${isCompleted ? `bg-gradient-to-br ${bg} text-white border-2 border-white/30 z-20 hover:scale-110` : ''}
                  ${isCurrent ? `bg-gradient-to-br ${bg} text-white scale-125 z-30 border-4 border-white animate-pulse` : ''}
                `}
                style={{ 
                  left: `${p.x}%`, 
                  top: `${p.y}px`,
                  boxShadow: isCurrent || isCompleted ? `0 0 ${isCurrent ? '40px' : '20px'} ${shadow}, inset -10px -10px 20px rgba(0,0,0,0.5)` : 'none'
                }}
              >
                {/* Planet Surface Details (Craters/Stripes) */}
                {(isCurrent || isCompleted) && (
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-black/30 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]" />
                    <div className="absolute bottom-[20%] right-[30%] w-[20%] h-[20%] bg-black/30 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]" />
                    <div className="absolute top-[60%] left-[10%] w-[15%] h-[15%] bg-black/30 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]" />
                  </div>
                )}

                {/* 3D Sphere Overlay */}
                {(isCurrent || isCompleted) && (
                  <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.6),inset_5px_5px_10px_rgba(255,255,255,0.4)]" />
                )}

                {/* Planetary Ring */}
                {hasRing && (isCurrent || isCompleted) && (
                  <div className={`absolute inset-0 rounded-full border-[6px] border-white/20 transform rotate-[60deg] ${ringSize} pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                )}
                
                {/* Inner content */}
                {isCompleted && !isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(16,185,129,0.8)] border-2 border-[#050510]">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {!isUnlocked && <Lock className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30" />}
                
                {/* The Rocket for current level */}
                {isCurrent && (
                  <div className="absolute -top-8 animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50">
                    <span className="text-2xl">{player.equippedRocket || '🚀'}</span>
                  </div>
                )}
                
                <span className={`relative z-10 drop-shadow-md ${!isUnlocked ? 'opacity-0' : ''}`}>{p.level}</span>
                
                {/* Milestone Label */}
                {isMilestone && (isCurrent || isCompleted) && (
                  <div className="absolute -bottom-6 whitespace-nowrap text-xs font-black tracking-widest text-white/80 uppercase bg-black/50 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                    Sector {p.level / 10} Boss
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
