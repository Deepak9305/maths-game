import React, { useState } from 'react';
import { Award, Home, Map, PawPrint, Settings, ShoppingBag } from 'lucide-react';
import { GameMode, ModeDifficulty, PlayerState, SudokuSize } from '../types';
import { GAME_MODE_DEFINITIONS, MODE_DIFFICULTY_LABELS } from '../services/modeService';

interface DashboardProps {
  player: PlayerState;
  dailyStreak: number;
  friendCode: string;
  onStartGame: (mode: GameMode, difficulty: ModeDifficulty, sudokuSize: SudokuSize, survival: boolean) => void;
  onNavigate: (screen: 'shop' | 'achievements' | 'privacy' | 'map' | 'pet') => void;
  onShare: () => void;
  onJoinChallenge: (code: string) => void;
  onClaimChallenge: (id: string) => void;
}

type PrimaryMode = Exclude<GameMode, 'survival'>;

const MODE_HOTSPOTS: Record<PrimaryMode, string> = {
  'square-sprint': 'left-[35%] top-[25%] h-[15%] w-[30%]',
  'quick-calc': 'left-[3%] top-[33%] h-[16%] w-[37%]',
  'log-lab': 'right-[3%] top-[33%] h-[16%] w-[37%]',
  'mini-sudoku': 'left-[4%] top-[48%] h-[16%] w-[38%]',
  'target-puzzle': 'right-[4%] top-[48%] h-[16%] w-[38%]'
};

const MODE_NAMES: Record<PrimaryMode, string> = {
  'quick-calc': 'Quick Math',
  'square-sprint': 'Squares & Roots',
  'log-lab': 'Powers & Logs',
  'mini-sudoku': 'Sudoku',
  'target-puzzle': 'Equation Match'
};

const MODE_CARD_DESCRIPTIONS: Record<PrimaryMode, string> = {
  'quick-calc': 'Race the clock and build your streak.',
  'square-sprint': 'Solve squares and roots at top speed.',
  'log-lab': 'Crack powers, logs, and patterns.',
  'mini-sudoku': 'Fill the grid and clear the sector.',
  'target-puzzle': 'Match the equation to the target.'
};

const MODE_ART_CLIPS: Record<PrimaryMode, string> = {
  'square-sprint': 'circle(10% at 50% 32%)',
  'quick-calc': 'circle(14% at 20% 41%)',
  'log-lab': 'circle(10% at 79% 41%)',
  'mini-sudoku': 'circle(11% at 22% 56%)',
  'target-puzzle': 'circle(11% at 78% 56%)'
};

const MODE_ART_ORIGINS: Record<PrimaryMode, string> = {
  'square-sprint': '50% 32%',
  'quick-calc': '20% 41%',
  'log-lab': '79% 41%',
  'mini-sudoku': '22% 56%',
  'target-puzzle': '78% 56%'
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
  const [selectedMode, setSelectedMode] = useState<PrimaryMode>('quick-calc');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ModeDifficulty>('standard');
  const [sudokuSize, setSudokuSize] = useState<SudokuSize>(4);
  const [survivalMode, setSurvivalMode] = useState(false);
  const [missionSetupOpen, setMissionSetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');

  const selectedDefinition = GAME_MODE_DEFINITIONS[selectedMode];
  const nextChallenge = player.dailyChallenges?.find(challenge => !challenge.claimed);
  const showAnimations = player.showAnimations ?? true;
  const modeLabelMotion = showAnimations ? 'mq-mode-label' : '';
  const displayName = player.name.trim() || 'Pilot';
  const nextLevelXp = Math.max(100, player.level * 100);
  const xpPercent = Math.min(100, Math.round((player.xp / nextLevelXp) * 100));

  const startSelectedMission = () => {
    setMissionSetupOpen(false);
    onStartGame(selectedMode, selectedDifficulty, sudokuSize, survivalMode);
  };

  const chooseMode = (mode: PrimaryMode) => {
    setSelectedMode(mode);
    setMissionSetupOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-black font-['Lexend'] text-white">
      <main
        className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-[#040d2d]"
        aria-label="Math Quest mission hub"
      >
        <style>{`
          @keyframes mq-float-gentle {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -6px, 0); }
          }
          @keyframes mq-float-reverse {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, 4px, 0); }
          }
          @keyframes mq-logo-float {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(0, -4px, 0) scale(1.018); }
          }
          @keyframes mq-hud-breathe {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 0 rgba(125, 211, 252, 0)); }
            50% { filter: brightness(1.08) drop-shadow(0 0 11px rgba(125, 211, 252, .46)); }
          }
          @keyframes mq-console-charge {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 0 rgba(34, 211, 238, 0)); transform: scale(1); }
            50% { filter: brightness(1.18) drop-shadow(0 0 17px rgba(34, 211, 238, .8)); transform: scale(1.028); }
          }
          @keyframes mq-selected-pulse {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 0 rgba(251, 191, 36, 0)); transform: scale(1); }
            50% { filter: brightness(1.14) drop-shadow(0 0 17px rgba(251, 191, 36, .82)); transform: scale(1.03); }
          }
          @keyframes mq-launch-breathe {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 0 rgba(251, 146, 60, 0)); }
            50% { filter: brightness(1.18) drop-shadow(0 0 19px rgba(251, 146, 60, .9)); }
          }
          @keyframes mq-label-drift {
            0%, 100% { transform: translate3d(0, 0, 0); opacity: .78; }
            50% { transform: translate3d(0, -2px, 0); opacity: 1; }
          }
          @keyframes mq-star-twinkle {
            0%, 100% { opacity: .18; transform: scale(.65); }
            50% { opacity: .95; transform: scale(1.25); }
          }
          @keyframes mq-energy-sweep {
            0% { transform: translate3d(-160%, 0, 0) rotate(18deg); opacity: 0; }
            18% { opacity: .35; }
            55% { opacity: .12; }
            100% { transform: translate3d(220%, 0, 0) rotate(18deg); opacity: 0; }
          }
          @keyframes mq-shortcut-dock {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -2px, 0); }
          }
          @keyframes mq-console-ping {
            0%, 100% { opacity: .12; transform: scale(.88); }
            50% { opacity: .7; transform: scale(1.12); }
          }
          .mq-float-gentle { animation: mq-float-gentle 3.8s ease-in-out infinite; }
          .mq-float-reverse { animation: mq-float-reverse 4.6s ease-in-out infinite; }
          .mq-logo-float { animation: mq-logo-float 4.8s ease-in-out infinite; transform-origin: 50% 17%; }
          .mq-hud-breathe { animation: mq-hud-breathe 3.6s ease-in-out infinite; }
          .mq-console-charge { animation: mq-console-charge 2.8s ease-in-out infinite; transform-origin: 50% 48%; }
          .mq-selected-pulse { animation: mq-selected-pulse 2.2s ease-in-out infinite; }
          .mq-launch-breathe { animation: mq-launch-breathe 2.4s ease-in-out infinite; }
          .mq-mode-label { animation: mq-label-drift 3.2s ease-in-out infinite; }
          .mq-star-twinkle { animation: mq-star-twinkle 2.8s ease-in-out infinite; }
          .mq-energy-sweep { animation: mq-energy-sweep 6.5s ease-in-out infinite; }
          .mq-shortcut-dock { animation: mq-shortcut-dock 4.2s ease-in-out infinite; }
          .mq-console-ping { animation: mq-console-ping 2.8s ease-in-out infinite; transform-origin: center; }
          @media (prefers-reduced-motion: reduce) {
            .mq-float-gentle, .mq-float-reverse, .mq-logo-float, .mq-hud-breathe, .mq-console-charge, .mq-selected-pulse, .mq-launch-breathe, .mq-mode-label, .mq-star-twinkle, .mq-energy-sweep, .mq-shortcut-dock, .mq-console-ping { animation: none !important; }
          }
        `}</style>
        <img
          src="/assets/orbit-selector-labeled.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />

        {showAnimations && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-hud-breathe absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'inset(0 0 86% 0)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-logo-float absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'circle(13% at 50% 17%)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-float-gentle absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'circle(9% at 50% 32%)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-selected-pulse absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: MODE_ART_CLIPS[selectedMode], transformOrigin: MODE_ART_ORIGINS[selectedMode] }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-float-reverse absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'circle(10% at 79% 41%)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-float-gentle absolute inset-0 h-full w-full select-none object-fill"
            style={{ animationDelay: '-1.3s', clipPath: 'circle(11% at 22% 56%)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-float-reverse absolute inset-0 h-full w-full select-none object-fill"
            style={{ animationDelay: '-2.1s', clipPath: 'circle(11% at 78% 56%)' }}
          />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-console-charge absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'circle(15% at 50% 48%)' }}
          />
          <div className="mq-console-ping absolute left-[38%] top-[40%] aspect-square w-[24%] rounded-full border border-cyan-200/55 shadow-[0_0_18px_rgba(103,232,249,.35)]" />
          <div className="mq-console-ping absolute left-[35%] top-[37%] aspect-square w-[30%] rounded-full border border-cyan-200/20" style={{ animationDelay: '-1.4s' }} />
          <img
            src="/assets/orbit-selector-labeled.png"
            alt=""
            draggable={false}
            className="mq-launch-breathe absolute inset-0 h-full w-full select-none object-fill"
            style={{ clipPath: 'inset(77% 13% 12% 13% round 5%)' }}
          />
          <div className="mq-energy-sweep absolute left-[18%] top-[27%] h-[38%] w-[64%] bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent blur-sm" />
          <span className="mq-star-twinkle absolute left-[14%] top-[28%] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_8px_2px_rgba(103,232,249,.7)]" style={{ animationDelay: '-.8s' }} />
          <span className="mq-star-twinkle absolute right-[16%] top-[23%] h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_8px_2px_rgba(196,181,253,.65)]" style={{ animationDelay: '-1.7s' }} />
          <span className="mq-star-twinkle absolute left-[31%] top-[54%] h-1 w-1 rounded-full bg-yellow-200 shadow-[0_0_8px_2px_rgba(253,224,71,.65)]" style={{ animationDelay: '-2.2s' }} />
          <span className="mq-star-twinkle absolute right-[31%] top-[57%] h-1 w-1 rounded-full bg-cyan-100 shadow-[0_0_8px_2px_rgba(165,243,252,.65)]" style={{ animationDelay: '-1.1s' }} />
        </div>}

        <div
          aria-label={`Pilot ${displayName}, level ${player.level}, ${player.xp} of ${nextLevelXp} XP`}
          className="pointer-events-none absolute left-[17%] top-[1.7%] z-[6] h-[6.2%] w-[31%] overflow-hidden rounded-md border border-cyan-100/15 bg-[#061638] px-[2%] py-[1%] text-left font-['Lexend'] text-[8px] font-black leading-none tracking-tight text-white shadow-[0_2px_8px_rgba(0,0,0,.45)]"
        >
          <p className="flex min-w-0 items-baseline gap-[4%] leading-[1.15]">
            <span className="shrink-0 font-['Lexend'] text-[clamp(4px,1.1vw,6px)] font-black tracking-[0.08em] text-cyan-200/70">PILOT</span>
            <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap font-['Press_Start_2P'] text-[clamp(5px,1.45vw,7px)] text-cyan-50" title={displayName}>{displayName}</span>
          </p>
          <div className="mt-[3%] flex items-center justify-between gap-1 font-['Press_Start_2P'] text-[clamp(5px,1.55vw,8px)] leading-none text-blue-100/85">
            <span className="shrink-0">LV {player.level}</span>
            <span className="min-w-0 truncate text-right">{player.xp}/{nextLevelXp} XP</span>
          </div>
          <div className="mt-[3%] h-[10%] min-h-[2px] overflow-hidden rounded-full bg-[#0b1436] ring-1 ring-cyan-200/20">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] font-['Lexend'] text-[8px] font-black leading-none tracking-tight text-white drop-shadow-[0_1px_0_#071238]">
          <span className={`${modeLabelMotion} absolute left-[37%] top-[34.8%] flex h-[2.8%] w-[26%] items-center justify-center whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#061638]/75 px-1 text-center shadow-[0_2px_8px_rgba(0,0,0,.38)] backdrop-blur-[1px]`} style={{ animationDelay: '-.4s' }}>Squares &amp; Roots</span>
          <span className={`${modeLabelMotion} absolute left-[5%] top-[45.5%] flex h-[2.7%] w-[30%] items-center justify-center whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#061638]/75 px-1 text-center shadow-[0_2px_8px_rgba(0,0,0,.38)] backdrop-blur-[1px]`} style={{ animationDelay: '-1.1s' }}>Quick Math</span>
          <span className={`${modeLabelMotion} absolute right-[5%] top-[45.5%] flex h-[2.7%] w-[30%] items-center justify-center whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#061638]/75 px-1 text-center shadow-[0_2px_8px_rgba(0,0,0,.38)] backdrop-blur-[1px]`} style={{ animationDelay: '-1.8s' }}>Powers &amp; Logs</span>
          <span className={`${modeLabelMotion} absolute left-[7%] top-[60.7%] flex h-[2.8%] w-[26%] items-center justify-center whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#061638]/75 px-1 text-center shadow-[0_2px_8px_rgba(0,0,0,.38)] backdrop-blur-[1px]`} style={{ animationDelay: '-2.4s' }}>Sudoku</span>
          <span className={`${modeLabelMotion} absolute right-[7%] top-[60.7%] flex h-[2.8%] w-[30%] items-center justify-center whitespace-nowrap rounded-md border border-cyan-100/20 bg-[#061638]/75 px-1 text-center shadow-[0_2px_8px_rgba(0,0,0,.38)] backdrop-blur-[1px]`} style={{ animationDelay: '-3s' }}>Equation Match</span>
        </div>

        <div
          data-testid="mission-preview"
          aria-label={`${selectedDefinition.name}: ${MODE_CARD_DESCRIPTIONS[selectedMode]} Speed, accuracy, high score`}
          className="pointer-events-none absolute left-[28.5%] right-[7.5%] top-[65.2%] z-[6] h-[11.7%] overflow-hidden rounded-[10px] bg-[#071b4a] px-[3.5%] py-[3%] shadow-[0_0_18px_rgba(8,47,107,.35)]"
        >
          <div className="flex h-full min-h-0 items-stretch gap-[4%]">
            <div className="min-w-0 flex-1">
              <h2 className="font-['Press_Start_2P'] text-[clamp(12px,3.1vw,16px)] font-black leading-[1.25] text-white">
                {selectedDefinition.name}
              </h2>
              <p className="mt-[4%] max-w-[27ch] text-[clamp(10px,2.4vw,13px)] font-bold leading-[1.2] text-blue-100/90">
                {MODE_CARD_DESCRIPTIONS[selectedMode]}
              </p>
            </div>
            <div className="flex w-[25%] shrink-0 flex-col justify-center gap-[9%] border-l border-cyan-200/30 pl-[4%] text-[clamp(8px,1.9vw,10px)] font-black leading-[1.15] tracking-[0.08em] text-cyan-100/85">
              <span>SPEED</span>
              <span>ACCURACY</span>
              <span>HIGH SCORE</span>
            </div>
          </div>
        </div>

        <section aria-label="Choose a mission" className="absolute inset-0">
          {(Object.keys(MODE_HOTSPOTS) as PrimaryMode[]).map(mode => (
            <button
              key={mode}
              type="button"
              aria-label={`Select ${MODE_NAMES[mode]}`}
              aria-pressed={selectedMode === mode}
              onClick={() => chooseMode(mode)}
              className={`absolute z-10 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/90 ${MODE_HOTSPOTS[mode]}`}
            />
          ))}

          <button
            type="button"
            aria-label="Open badges from the trophy console"
            onClick={() => onNavigate('achievements')}
            className="absolute left-[33%] top-[42%] z-10 h-[16%] w-[34%] rounded-full outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/90"
          />

          <button
            type="button"
            aria-label={`Start ${selectedDefinition.name}`}
            onClick={startSelectedMission}
            className="absolute left-[16%] top-[77%] z-10 h-[9%] w-[68%] rounded-[18px] outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/90"
          />
        </section>

        <div
          aria-label="Quick access"
          className={`absolute left-[4%] right-[4%] top-[86.3%] z-30 grid grid-cols-3 gap-1.5 ${showAnimations ? 'mq-shortcut-dock' : ''}`}
        >
          <button
            type="button"
            aria-label="Open badges"
            onClick={() => onNavigate('achievements')}
            className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-violet-200/35 bg-[#0b1b48]/95 px-1.5 py-2 text-[9px] font-black text-violet-100 shadow-[0_0_14px_rgba(167,139,250,.2)] backdrop-blur-sm transition hover:border-violet-100 hover:bg-violet-400/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-200"
          >
            <Award className="h-3.5 w-3.5 shrink-0 text-violet-200" />
            <span className="truncate">Badges</span>
          </button>
          <button
            type="button"
            aria-label="Open pet lab"
            onClick={() => onNavigate('pet')}
            className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-emerald-200/35 bg-[#0b1b48]/95 px-1.5 py-2 text-[9px] font-black text-emerald-100 shadow-[0_0_14px_rgba(52,211,153,.18)] backdrop-blur-sm transition hover:border-emerald-100 hover:bg-emerald-400/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            <PawPrint className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
            <span className="truncate">Pet Lab</span>
          </button>
          <button
            type="button"
            aria-label={`Open shop with ${player.coins} coins`}
            onClick={() => onNavigate('shop')}
            className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-yellow-200/40 bg-[#0b1b48]/95 px-1.5 py-2 text-[9px] font-black text-yellow-100 shadow-[0_0_14px_rgba(250,204,21,.18)] backdrop-blur-sm transition hover:border-yellow-100 hover:bg-yellow-400/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-yellow-200"
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-yellow-200" />
            <span className="truncate">Shop · {player.coins}</span>
          </button>
        </div>

        <nav aria-label="Primary navigation" className="absolute inset-x-0 bottom-0 z-20 grid h-[12%] grid-cols-4 border-t border-cyan-200/15 bg-[#061638] px-1">
          <button
            type="button"
            aria-label="Math Quest home"
            aria-current="page"
            className="flex h-full flex-col items-center justify-end gap-1 rounded-t-xl pb-3 text-cyan-300 outline-none transition hover:bg-cyan-300/10 focus-visible:ring-4 focus-visible:ring-cyan-300/90"
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Math Quest</span>
          </button>
          <button
            type="button"
            aria-label="Open missions"
            onClick={() => onNavigate('map')}
            className="flex h-full flex-col items-center justify-end gap-1 rounded-t-xl pb-3 text-white/55 outline-none transition hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:ring-4 focus-visible:ring-cyan-300/90"
          >
            <Map className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Missions</span>
          </button>
          <button
            type="button"
            aria-label="Open pets"
            onClick={() => onNavigate('pet')}
            className="flex h-full flex-col items-center justify-end gap-1 rounded-t-xl pb-3 text-white/55 outline-none transition hover:bg-emerald-300/10 hover:text-emerald-100 focus-visible:ring-4 focus-visible:ring-emerald-300/90"
          >
            <PawPrint className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Pets</span>
          </button>
          <button
            type="button"
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
            className="flex h-full flex-col items-center justify-end gap-1 rounded-t-xl pb-3 text-white/55 outline-none transition hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:ring-4 focus-visible:ring-cyan-300/90"
          >
            <Settings className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Settings</span>
          </button>
        </nav>

        <button
          type="button"
          aria-label="Open settings"
          onClick={() => setSettingsOpen(true)}
          className="absolute right-[3%] top-[1%] z-20 h-[12%] w-[18%] rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/90"
        />

        {missionSetupOpen && (
          <div className="absolute inset-0 z-30 flex items-end bg-[#02081d]/70 p-4 pt-16 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="mission-setup-title"
              className="w-full rounded-[1.5rem] border-2 border-cyan-200/45 bg-[#071a48]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.3)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Mission selected</p>
                  <h2 id="mission-setup-title" className="mt-1 font-['Press_Start_2P'] text-sm leading-6 text-white">
                    {selectedDefinition.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMissionSetupOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm font-black text-cyan-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  Close
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-blue-100/85">{selectedDefinition.description}</p>
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
              {survivalMode && <p className="mt-2 text-xs leading-5 text-red-100/80">Unlimited waves. Every five answers raises the pressure, with faster timers and harder problems.</p>}
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
                onClick={startSelectedMission}
                className="mt-4 w-full rounded-xl border-b-4 border-orange-700 bg-gradient-to-b from-yellow-300 to-orange-400 px-4 py-3 font-['Press_Start_2P'] text-xs text-[#071238] shadow-[0_0_24px_rgba(251,191,36,0.42)] transition hover:brightness-110 active:translate-y-0.5"
              >
                Start mission
              </button>
            </section>
          </div>
        )}

        {settingsOpen && (
          <div className="absolute inset-0 z-40 flex items-end bg-[#02081d]/70 p-4 pt-16 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              className="w-full rounded-[1.5rem] border-2 border-cyan-200/45 bg-[#071a48]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.3)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Pilot {player.name || 'Explorer'}</p>
                  <h2 id="settings-title" className="mt-1 font-['Press_Start_2P'] text-sm leading-6 text-white">Command deck</h2>
                </div>
                <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg px-2 py-1 text-sm font-black text-cyan-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-200">Close</button>
              </div>

              <p className="mt-3 text-sm text-blue-100/85">Level {player.level} · {player.xp} XP · {dailyStreak}-day streak</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setSettingsOpen(false); onNavigate('map'); }} className="rounded-xl border border-cyan-200/25 bg-cyan-300/10 p-3 text-left text-sm font-black text-cyan-50">Missions</button>
                <button type="button" onClick={() => { setSettingsOpen(false); onNavigate('achievements'); }} className="rounded-xl border border-violet-200/25 bg-violet-300/10 p-3 text-left text-sm font-black text-violet-50">Badges</button>
                <button type="button" onClick={() => { setSettingsOpen(false); onNavigate('pet'); }} className="rounded-xl border border-emerald-200/25 bg-emerald-300/10 p-3 text-left text-sm font-black text-emerald-50">Pet lab</button>
                <button type="button" onClick={() => { setSettingsOpen(false); onNavigate('shop'); }} className="rounded-xl border border-yellow-200/25 bg-yellow-300/10 p-3 text-left text-sm font-black text-yellow-50">Shop · {player.coins}</button>
              </div>

              {nextChallenge && (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black text-white">Daily: {nextChallenge.description}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-cyan-100">
                    <span>{Math.min(nextChallenge.current, nextChallenge.target)}/{nextChallenge.target}</span>
                    <button
                      type="button"
                      disabled={!nextChallenge.completed}
                      onClick={() => onClaimChallenge(nextChallenge.id)}
                      className="rounded-lg bg-yellow-300 px-2 py-1 font-black text-slate-950 disabled:opacity-40"
                    >
                      Claim +{nextChallenge.reward}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  value={challengeInput}
                  onChange={event => setChallengeInput(event.target.value.toUpperCase())}
                  placeholder="FRIEND CODE"
                  maxLength={16}
                  className="min-w-0 flex-1 rounded-lg border border-cyan-200/20 bg-black/25 px-3 py-2 text-xs font-bold tracking-widest text-white outline-none placeholder:text-white/40 focus:border-cyan-200"
                />
                <button
                  type="button"
                  disabled={!challengeInput.trim()}
                  onClick={() => { onJoinChallenge(challengeInput.trim()); setChallengeInput(''); }}
                  className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-40"
                >
                  Join
                </button>
              </div>
              <button type="button" onClick={onShare} className="mt-3 text-xs font-bold text-cyan-100 underline underline-offset-2">Share code: {friendCode}</button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
