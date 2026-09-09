import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Calculator, CheckCircle, Grid2X2, Lock, Map, Rocket, Square, Target } from 'lucide-react';
import { GameMode, ModeDifficulty, PlayerState, SudokuSize } from '../types';
import { GAME_MODE_DEFINITIONS, MODE_DIFFICULTY_LABELS, PRIMARY_GAME_MODES } from '../services/modeService';

type PrimaryMode = Exclude<GameMode, 'survival'>;

interface MapScreenProps {
  player: PlayerState;
  onStartMode: (mode: PrimaryMode, difficulty: ModeDifficulty, sudokuSize: SudokuSize, survival: boolean) => void;
  onClose: () => void;
}

const MODE_ICONS: Record<PrimaryMode, React.ComponentType<{ className?: string }>> = {
  'quick-calc': Calculator,
  'square-sprint': Square,
  'log-lab': BarChart3,
  'mini-sudoku': Grid2X2,
  'target-puzzle': Target
};

const MODE_ACCENTS: Record<PrimaryMode, { active: string; icon: string }> = {
  'quick-calc': { active: 'border-cyan-200 bg-cyan-400/20 text-cyan-50', icon: 'text-cyan-200' },
  'square-sprint': { active: 'border-violet-200 bg-violet-400/20 text-violet-50', icon: 'text-violet-200' },
  'log-lab': { active: 'border-emerald-200 bg-emerald-400/20 text-emerald-50', icon: 'text-emerald-200' },
  'mini-sudoku': { active: 'border-orange-200 bg-orange-400/20 text-orange-50', icon: 'text-orange-200' },
  'target-puzzle': { active: 'border-rose-200 bg-rose-400/20 text-rose-50', icon: 'text-rose-200' }
};

const LEVEL_HEIGHT = 100;
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

const MapScreen: React.FC<MapScreenProps> = ({ player, onStartMode, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMode, setSelectedMode] = useState<PrimaryMode>('quick-calc');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ModeDifficulty>('standard');
  const [sudokuSize, setSudokuSize] = useState<SudokuSize>(4);
  const [survivalMode, setSurvivalMode] = useState(false);
  const [launchLevel, setLaunchLevel] = useState<number | null>(null);
  const PADDING_TOP = 250; // Space above the highest level (leaves room for the header)
  const PADDING_BOTTOM = 150; // Space below level 1 (leaves room for home indicator)
  const containerHeight = (TOTAL_LEVELS - 1) * LEVEL_HEIGHT + PADDING_TOP + PADDING_BOTTOM;

  // Generate path points
  const points = React.useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    // Tighter zig-zag pattern
    const xOffset = Math.sin(i * 1.2) * 25; // -25 to 25
    const x = 50 + xOffset;
    // Bottom to top: level 1 is at the bottom
    const y = containerHeight - PADDING_BOTTOM - (i * LEVEL_HEIGHT);
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

  // Generate background decorations (Nebulas) - Reduced for mobile performance
  const decorations = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 10) * 100,
    y: pseudoRandom(i * 10 + 1) * containerHeight,
    size: pseudoRandom(i * 10 + 2) * 400 + 200,
    color: ['bg-purple-900/40', 'bg-blue-900/40', 'bg-fuchsia-900/30', 'bg-indigo-900/40'][Math.floor(pseudoRandom(i * 10 + 3) * 4)],
    opacity: pseudoRandom(i * 10 + 4) * 0.4 + 0.2,
  }));

  // Generate Stars - Reduced for performance
  const stars = Array.from({ length: 150 }).map((_, i) => {
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
  const bgPlanets = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 30) * 100,
    y: pseudoRandom(i * 30 + 1) * containerHeight,
    size: pseudoRandom(i * 30 + 2) * 120 + 40,
    color: ['from-emerald-500/60 to-teal-900/60', 'from-red-500/60 to-rose-900/60', 'from-indigo-500/60 to-purple-900/60', 'from-amber-500/60 to-orange-900/60', 'from-cyan-400/60 to-blue-800/60', 'from-fuchsia-500/60 to-pink-900/60'][Math.floor(pseudoRandom(i * 30 + 3) * 6)],
    opacity: pseudoRandom(i * 30 + 4) * 0.5 + 0.2,
  }));

  // Generate Asteroids
  const asteroids = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 40) * 100,
    y: pseudoRandom(i * 40 + 1) * containerHeight,
    size: pseudoRandom(i * 40 + 2) * 20 + 8,
    rotation: pseudoRandom(i * 40 + 3) * 360,
    color: ['bg-stone-600', 'bg-slate-600', 'bg-zinc-600', 'bg-neutral-600', 'bg-amber-900/80', 'bg-purple-900/80'][Math.floor(pseudoRandom(i * 40 + 5) * 6)],
    opacity: pseudoRandom(i * 40 + 4) * 0.6 + 0.2,
  }));

  // Generate Comets
  const comets = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    x: pseudoRandom(i * 50) * 100,
    y: pseudoRandom(i * 50 + 1) * containerHeight,
    length: pseudoRandom(i * 50 + 2) * 150 + 50,
    angle: pseudoRandom(i * 50 + 3) * 360, // 0 to 360 degrees
    color: ['rgba(56,189,248,', 'rgba(167,139,250,', 'rgba(52,211,153,', 'rgba(251,146,60,', 'rgba(255,255,255,'][Math.floor(pseudoRandom(i * 50 + 5) * 5)],
    opacity: pseudoRandom(i * 50 + 4) * 0.7 + 0.3,
  }));

  // Auto-scroll to current level
  useEffect(() => {
    const scrollToCurrentLevel = () => {
      const currentLevelElement = document.getElementById(`level-${player.level}`);
      if (currentLevelElement) {
        currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  const selectedDefinition = GAME_MODE_DEFINITIONS[selectedMode];
  const SelectedModeIcon = MODE_ICONS[selectedMode];

  return (
    <div className="h-[100dvh] bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black flex flex-col relative overflow-hidden">
      {/* Header - Fixed at top with safe area support */}
      <div
        className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col bg-black/80 p-3 md:p-4 rounded-2xl backdrop-blur-xl border border-white/10 pointer-events-auto shadow-2xl gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="p-1.5 md:p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 flex-shrink-0">
                <Map className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wide md:tracking-widest uppercase">
                  Galaxy Map
                </h2>
                <p className="text-[10px] md:text-xs text-blue-200/60 font-medium truncate mt-0.5">
                  Sector {Math.floor((player.level - 1) / 10) + 1} • Level {player.level}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Return to homepage"
              className="flex-shrink-0 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-3 md:px-4 py-2 rounded-xl text-white text-sm font-bold border border-white/20 hover:scale-105"
            >
              Exit
            </button>
          </div>

          <div className="border-t border-white/10 pt-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200/70">Choose a game</p>
              <p className="text-[10px] font-bold text-white/40">Shared progress</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {PRIMARY_GAME_MODES.map(mode => {
                const Icon = MODE_ICONS[mode];
                const isSelected = selectedMode === mode;
                const accent = MODE_ACCENTS[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-label={`Choose ${GAME_MODE_DEFINITIONS[mode].name}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedMode(mode)}
                    className={`flex min-w-[8.5rem] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition active:scale-95 ${isSelected ? accent.active : 'border-white/10 bg-white/5 text-white/65 hover:border-white/25 hover:bg-white/10'}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? accent.icon : 'text-white/45'}`} />
                    <span className="truncate text-xs font-black">{GAME_MODE_DEFINITIONS[mode].name}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
              className={`absolute rounded-full blur-[64px] ${d.color} pointer-events-none`}
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
              <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2={containerHeight} gradientUnits="userSpaceOnUse">
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
                onClick={() => setLaunchLevel(p.level)}
                aria-label={`${isCompleted ? 'Replay' : 'Start'} level ${p.level} with ${selectedDefinition.name}`}
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
                  <div className="absolute bottom-full mb-2 animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50">
                    <span className="text-3xl">{player.equippedRocket || '🚀'}</span>
                  </div>
                )}

                <span className={`relative z-10 drop-shadow-md ${!isUnlocked ? 'opacity-0' : ''}`}>{p.level}</span>

                {/* Milestone Label */}
                {isMilestone && (isCurrent || isCompleted) && (
                  <div className="absolute top-full mt-2 whitespace-nowrap text-xs font-black tracking-widest text-white/80 uppercase bg-black/50 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm shadow-lg">
                    Sector {p.level / 10} Boss
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {launchLevel !== null && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/75 p-4 pt-24 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-launch-title"
            className="mx-auto w-full max-w-xl rounded-[1.5rem] border-2 border-cyan-200/40 bg-[#071a48]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,.28)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-400/10">
                  <SelectedModeIcon className="h-6 w-6 text-cyan-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Level {launchLevel} selected</p>
                  <h2 id="map-launch-title" className="mt-1 truncate font-['Press_Start_2P'] text-sm leading-6 text-white">{selectedDefinition.name}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLaunchLevel(null)}
                className="rounded-lg px-2 py-1 text-sm font-black text-cyan-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-blue-100/80">{selectedDefinition.description}</p>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">Run type</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={!survivalMode}
                onClick={() => setSurvivalMode(false)}
                className={`rounded-xl border px-3 py-2 text-xs font-black transition ${!survivalMode ? 'border-cyan-200 bg-cyan-300 text-slate-950' : 'border-cyan-200/25 bg-white/5 text-cyan-50 hover:bg-white/10'}`}
              >
                Mission
              </button>
              <button
                type="button"
                aria-pressed={survivalMode}
                onClick={() => setSurvivalMode(true)}
                className={`rounded-xl border px-3 py-2 text-xs font-black transition ${survivalMode ? 'border-red-200 bg-red-400 text-slate-950' : 'border-red-200/25 bg-red-400/10 text-red-100 hover:bg-red-400/20'}`}
              >
                Survival ∞
              </button>
            </div>
            {survivalMode && <p className="mt-2 text-xs leading-5 text-red-100/80">Unlimited waves. Every five correct answers raises the pressure.</p>}

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">Difficulty</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(MODE_DIFFICULTY_LABELS) as ModeDifficulty[]).map(difficulty => (
                <button
                  key={difficulty}
                  type="button"
                  aria-pressed={selectedDifficulty === difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`rounded-xl border px-2 py-2 text-xs font-black transition ${selectedDifficulty === difficulty ? 'border-yellow-200 bg-yellow-300 text-slate-950' : 'border-cyan-200/25 bg-white/5 text-cyan-50 hover:bg-white/10'}`}
                >
                  {MODE_DIFFICULTY_LABELS[difficulty]}
                </button>
              ))}
            </div>

            {selectedMode === 'mini-sudoku' && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-200/20 bg-black/20 p-2">
                <span className="text-xs font-bold text-cyan-50">Grid size</span>
                <div className="flex gap-2">
                  {([4, 9] as SudokuSize[]).map(size => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={sudokuSize === size}
                      onClick={() => setSudokuSize(size)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-black ${sudokuSize === size ? 'bg-orange-300 text-slate-950' : 'bg-white/10 text-white'}`}
                    >
                      {size} × {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onStartMode(selectedMode, selectedDifficulty, sudokuSize, survivalMode);
                setLaunchLevel(null);
              }}
              className="mt-4 w-full rounded-xl border-b-4 border-orange-700 bg-gradient-to-b from-yellow-300 to-orange-400 px-4 py-3 font-['Press_Start_2P'] text-xs text-[#071238] shadow-[0_0_24px_rgba(251,191,36,.42)] transition hover:brightness-110 active:translate-y-0.5"
            >
              Start {survivalMode ? 'survival' : 'mission'}
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default MapScreen;
