import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Calculator,
  Check,
  Coins,
  Flame,
  Grid2X2,
  Home,
  Orbit,
  Rocket,
  Settings,
  Share2,
  Sparkles,
  Square,
  Target,
  Trophy,
  X
} from 'lucide-react';
import { GameMode, ModeDifficulty, PlayerState, SudokuSize } from '../types';
import {
  GAME_MODE_DEFINITIONS,
  MODE_DIFFICULTY_LABELS,
  PRIMARY_GAME_MODES
} from '../services/modeService';

interface DashboardProps {
  player: PlayerState;
  dailyStreak: number;
  friendCode: string;
  onStartGame: (mode: GameMode, difficulty: ModeDifficulty, sudokuSize: SudokuSize) => void;
  onNavigate: (screen: 'shop' | 'achievements' | 'privacy' | 'map' | 'pet') => void;
  onShare: () => void;
  onJoinChallenge: (code: string) => void;
  onClaimChallenge: (id: string) => void;
}

const MODE_ICONS: Record<GameMode, React.ComponentType<{ className?: string }>> = {
  'quick-calc': Calculator,
  'square-sprint': Square,
  'log-lab': BarChart3,
  'mini-sudoku': Grid2X2,
  'target-puzzle': Target,
  survival: Orbit
};

const MODE_STYLES: Record<GameMode, { orb: string; ring: string; text: string }> = {
  'quick-calc': {
    orb: 'bg-cyan-500/90',
    ring: 'border-cyan-300 shadow-cyan-400/60',
    text: 'text-cyan-100'
  },
  'square-sprint': {
    orb: 'bg-violet-500/90',
    ring: 'border-violet-300 shadow-violet-400/60',
    text: 'text-violet-100'
  },
  'log-lab': {
    orb: 'bg-emerald-500/90',
    ring: 'border-emerald-300 shadow-emerald-400/60',
    text: 'text-emerald-100'
  },
  'mini-sudoku': {
    orb: 'bg-orange-500/90',
    ring: 'border-orange-300 shadow-orange-400/60',
    text: 'text-orange-100'
  },
  'target-puzzle': {
    orb: 'bg-rose-500/90',
    ring: 'border-rose-300 shadow-rose-400/60',
    text: 'text-rose-100'
  },
  survival: {
    orb: 'bg-red-500/90',
    ring: 'border-red-300 shadow-red-400/60',
    text: 'text-red-100'
  }
};

const ORBIT_POSITIONS: Record<Exclude<GameMode, 'survival'>, string> = {
  'quick-calc': 'left-[15%] top-[38%] sm:left-[18%]',
  'square-sprint': 'left-1/2 top-[8%]',
  'log-lab': 'right-[15%] top-[39%] sm:right-[18%]',
  'mini-sudoku': 'left-[25%] top-[70%] sm:left-[28%]',
  'target-puzzle': 'right-[25%] top-[70%] sm:right-[28%]'
};

const ModeIcon: React.FC<{ mode: GameMode; className?: string }> = ({ mode, className }) => {
  const Icon = MODE_ICONS[mode];
  return <Icon className={className} />;
};

const formatBest = (mode: GameMode, bestScore: number | undefined) => {
  if (!bestScore) return 'New mission';
  return mode === 'survival' ? `Wave ${bestScore}` : `${bestScore} pts`;
};

const Dashboard: React.FC<DashboardProps> = ({
  player,
  dailyStreak,
  friendCode,
  onStartGame,
  onNavigate,
  onShare,
  onJoinChallenge,
  onClaimChallenge
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('quick-calc');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ModeDifficulty>('standard');
  const [sudokuSize, setSudokuSize] = useState<SudokuSize>(4);
  const [challengeInput, setChallengeInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const selectedDefinition = GAME_MODE_DEFINITIONS[selectedMode];
  const selectedStats = player.modeStats?.[selectedMode];
  const nextChallenge = player.dailyChallenges?.find(challenge => !challenge.claimed);

  const startSelectedMode = () => {
    onStartGame(selectedMode, selectedDifficulty, sudokuSize);
  };

  return (
    <div className="min-h-screen bg-[#050d29] text-white font-['Lexend'] relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('/assets/orbit-space-bg.png')" }}
      />
      <div aria-hidden="true" className="fixed inset-0 bg-[#050d29]/55" />

      <main
        className="relative z-10 mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6"
        style={{
          paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))'
        }}
      >
        <header className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-cyan-300/20 bg-[#0b1b48]/85 px-3 py-2 shadow-lg backdrop-blur-md sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-400/15 text-cyan-200">
              <Rocket className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-cyan-200/80">Pilot</p>
              <p className="truncate text-sm font-bold text-white">{player.name || 'Explorer'}</p>
              <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-950/70">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (player.xp / (player.level * 100)) * 100))}%` }}
                />
              </div>
            </div>
            <span className="ml-auto shrink-0 text-lg font-black text-cyan-100">Lv {player.level}</span>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-yellow-300/20 bg-[#0b1b48]/85 px-4 py-3 shadow-lg backdrop-blur-md sm:flex">
            <Coins className="h-5 w-5 text-yellow-300" />
            <span className="font-black text-yellow-100">{player.coins}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-orange-300/20 bg-[#0b1b48]/85 px-3 py-2 shadow-lg backdrop-blur-md sm:px-4">
            <Flame className="h-5 w-5 text-orange-300" />
            <span className="font-black text-orange-100">{dailyStreak}</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-wide text-orange-200/70 sm:inline">day streak</span>
          </div>

          <button
            type="button"
            aria-label="Open settings"
            onClick={() => setShowSettings(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0b1b48]/85 text-cyan-100 shadow-lg backdrop-blur-md transition hover:border-cyan-200/60 hover:bg-cyan-400/20 active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        <section className="flex flex-col items-center pt-5 sm:pt-7">
          <img src="/logo.png" alt="Math Quest" className="h-32 w-32 rounded-full object-contain mix-blend-screen sm:h-40 sm:w-40" />
          <h1 className="mt-1 whitespace-nowrap font-['Press_Start_2P'] text-[13px] tracking-tight text-white drop-shadow-[0_2px_0_#0ea5e9] sm:text-2xl">
            Choose your mission
          </h1>
        </section>

        <section className="relative mx-auto mt-4 h-[280px] w-full max-w-xl sm:h-[350px]" aria-label="Mission selector">
          <div aria-hidden="true" className="absolute left-1/2 top-[44%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 border-dashed sm:h-72 sm:w-72" />
          <div aria-hidden="true" className="absolute left-1/2 top-[44%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 border-dashed sm:h-52 sm:w-52" />

          {PRIMARY_GAME_MODES.map(mode => {
            const isSelected = selectedMode === mode;
            const styles = MODE_STYLES[mode];
            return (
              <button
                type="button"
                key={mode}
                aria-pressed={isSelected}
                onClick={() => setSelectedMode(mode)}
                className={`absolute z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-all duration-300 ${ORBIT_POSITIONS[mode]} ${isSelected ? 'scale-110' : 'scale-100 opacity-85 hover:scale-105 hover:opacity-100'}`}
              >
                <span className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 ${styles.orb} ${isSelected ? `${styles.ring} shadow-[0_0_28px]` : 'border-white/20'} sm:h-[86px] sm:w-[86px]`}>
                  <ModeIcon mode={mode} className="h-9 w-9 text-white drop-shadow-md sm:h-10 sm:w-10" />
                </span>
                <span className={`whitespace-nowrap text-xs font-black tracking-wide ${isSelected ? 'text-white' : styles.text}`}>{GAME_MODE_DEFINITIONS[mode].name}</span>
              </button>
            );
          })}

          <button
            type="button"
            aria-label="Start selected mission"
            onClick={startSelectedMode}
            className="absolute left-1/2 top-[44%] z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-cyan-200/80 bg-[#0c2a67]/95 shadow-[0_0_34px_rgba(34,211,238,0.55)] transition hover:scale-105 hover:border-white active:scale-95 sm:h-32 sm:w-32"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/50 bg-cyan-300/15 sm:h-24 sm:w-24">
              <Trophy className="h-10 w-10 text-yellow-200 sm:h-12 sm:w-12" />
            </span>
          </button>
        </section>

        <section className="mx-auto max-w-xl rounded-[1.75rem] border border-cyan-300/25 bg-[#071b4b]/90 p-3 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="flex items-start gap-3">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${MODE_STYLES[selectedMode].ring} ${MODE_STYLES[selectedMode].orb}`}>
              <ModeIcon mode={selectedMode} className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-['Press_Start_2P'] text-sm text-white sm:text-base">{selectedDefinition.name}</h2>
                <span className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-cyan-200/70">
                  {formatBest(selectedMode, selectedStats?.bestScore)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/75">{selectedDefinition.description}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(Object.keys(MODE_DIFFICULTY_LABELS) as ModeDifficulty[]).map(difficulty => (
              <button
                type="button"
                key={difficulty}
                aria-pressed={selectedDifficulty === difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`rounded-xl border px-2 py-2 text-xs font-black transition ${selectedDifficulty === difficulty ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-white/5 text-blue-100/65 hover:border-white/30 hover:text-white'}`}
              >
                {MODE_DIFFICULTY_LABELS[difficulty]}
              </button>
            ))}
          </div>

          {selectedMode === 'mini-sudoku' && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/15 px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100/60">Grid size</span>
              <div className="flex gap-2">
                {([4, 9] as SudokuSize[]).map(size => (
                  <button
                    type="button"
                    key={size}
                    aria-pressed={sudokuSize === size}
                    onClick={() => setSudokuSize(size)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${sudokuSize === size ? 'bg-orange-400 text-slate-950' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  >
                    {size} × {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={startSelectedMode}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-orange-700/50 bg-orange-400 px-5 py-3.5 font-['Press_Start_2P'] text-sm text-slate-950 shadow-[0_0_24px_rgba(251,146,60,0.35)] transition hover:bg-orange-300 active:translate-y-1 active:border-b-0"
          >
            Start mission
            <Rocket className="h-5 w-5" />
          </button>
        </section>

        {nextChallenge && (
          <section className="mx-auto mt-4 max-w-xl rounded-2xl border border-yellow-300/20 bg-[#101d49]/85 p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-300/15 text-yellow-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-200/80">Daily mission</p>
                  <span className="text-xs font-bold text-white/70">{Math.min(nextChallenge.current, nextChallenge.target)}/{nextChallenge.target}</span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-white">{nextChallenge.description}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/70">
                  <div className="h-full rounded-full bg-yellow-300 transition-all" style={{ width: `${Math.min(100, (nextChallenge.current / nextChallenge.target) * 100)}%` }} />
                </div>
              </div>
              <button
                type="button"
                disabled={!nextChallenge.completed}
                onClick={() => onClaimChallenge(nextChallenge.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black transition ${nextChallenge.completed ? 'bg-yellow-300 text-slate-950 hover:bg-yellow-200' : 'bg-white/10 text-white/40'}`}
              >
                {nextChallenge.completed ? 'Claim' : `+${nextChallenge.reward}`}
              </button>
            </div>
          </section>
        )}

        <section className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => onNavigate('map')} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-[#0b1b48]/80 px-3 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95">
            <Orbit className="h-4 w-4" /> Journey
          </button>
          <button type="button" onClick={() => onNavigate('pet')} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-[#0b1b48]/80 px-3 py-3 text-xs font-black text-emerald-100 transition hover:bg-emerald-400/15 active:scale-95">
            <Sparkles className="h-4 w-4" /> Pet
          </button>
          <button type="button" onClick={() => onNavigate('achievements')} className="flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-[#0b1b48]/80 px-3 py-3 text-xs font-black text-violet-100 transition hover:bg-violet-400/15 active:scale-95">
            <Trophy className="h-4 w-4" /> Badges
          </button>
          <button type="button" onClick={() => onNavigate('shop')} className="flex items-center justify-center gap-2 rounded-xl border border-yellow-300/20 bg-[#0b1b48]/80 px-3 py-3 text-xs font-black text-yellow-100 transition hover:bg-yellow-400/15 active:scale-95">
            <Coins className="h-4 w-4" /> Shop
          </button>
        </section>

        <section className="mx-auto mt-4 max-w-xl rounded-2xl border border-red-300/20 bg-red-500/10 p-3 backdrop-blur-md">
          <button type="button" onClick={() => onStartGame('survival', 'expert', sudokuSize)} className="flex w-full items-center gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-200">
              <Flame className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-red-200/75">Endless challenge</p>
              <p className="truncate text-sm font-bold text-white">Survival mode · beat your best wave</p>
            </div>
            <span className="text-xl text-red-200">›</span>
          </button>
        </section>

        <details className="mx-auto mt-4 max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b48]/75 backdrop-blur-md">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-blue-100/80">Challenge a friend</summary>
          <div className="border-t border-white/10 p-4">
            <p className="text-sm text-blue-100/65">Share a code to play the same seeded Quick Calc run.</p>
            <div className="mt-3 flex gap-2">
              <input
                value={challengeInput}
                onChange={event => setChallengeInput(event.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={16}
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/25 px-3 py-2 font-mono text-sm font-bold tracking-wider text-white outline-none placeholder:text-white/30 focus:border-orange-300"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="button"
                disabled={!challengeInput.trim()}
                onClick={() => {
                  onJoinChallenge(challengeInput.trim());
                  setChallengeInput('');
                }}
                className="rounded-xl bg-orange-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                VS
              </button>
            </div>
            <button type="button" onClick={onShare} className="mt-3 flex items-center gap-2 text-xs font-bold text-cyan-200 hover:text-white">
              <Share2 className="h-4 w-4" /> Share your code: {friendCode}
            </button>
          </div>
        </details>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cyan-200/15 bg-[#050d29]/95 px-4 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-12px_36px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-around">
          <button type="button" className="flex min-w-24 flex-col items-center gap-1 py-2 text-cyan-200" aria-current="page">
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Math Quest</span>
          </button>
          <button type="button" onClick={() => onNavigate('map')} className="flex min-w-24 flex-col items-center gap-1 py-2 text-blue-100/60 transition hover:text-white">
            <Orbit className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Missions</span>
          </button>
          <button type="button" onClick={() => setShowSettings(true)} className="flex min-w-24 flex-col items-center gap-1 py-2 text-blue-100/60 transition hover:text-white">
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </nav>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-md rounded-3xl border border-cyan-200/20 bg-[#0b1b48] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="settings-title" className="font-['Press_Start_2P'] text-base text-white">Settings</h2>
              <button type="button" aria-label="Close settings" onClick={() => setShowSettings(false)} className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-100/65">Choose where to explore next.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setShowSettings(false); onNavigate('shop'); }} className="flex items-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-400/10 p-3 text-sm font-bold text-yellow-100"><Coins className="h-4 w-4" /> Shop</button>
              <button type="button" onClick={() => { setShowSettings(false); onNavigate('achievements'); }} className="flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/10 p-3 text-sm font-bold text-violet-100"><Award className="h-4 w-4" /> Badges</button>
              <button type="button" onClick={() => { setShowSettings(false); onNavigate('pet'); }} className="flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100"><Sparkles className="h-4 w-4" /> Pet lab</button>
              <button type="button" onClick={() => { setShowSettings(false); onShare(); }} className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm font-bold text-cyan-100"><Share2 className="h-4 w-4" /> Share</button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-white/55">
              <Check className="h-4 w-4 text-emerald-300" /> Progress is saved on this device.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
