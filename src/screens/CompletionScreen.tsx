import React from 'react';
import { ArrowRight, Coins, Home, Orbit, Share2, Sparkles, Trophy, Video, Zap } from 'lucide-react';
import { ModeDifficulty, ModeSessionConfig } from '../types';

interface CompletionScreenProps {
  score: number;
  modeName: string;
  modeDifficulty: ModeDifficulty;
  sessionConfig: ModeSessionConfig;
  gameCoins: number;
  gameXp: number;
  didWin: boolean;
  onPlayAgain: () => Promise<void>;
  onDashboard: () => Promise<void>;
  onShare: () => void;
  onDoubleCoins: () => Promise<boolean>;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  score,
  modeName,
  modeDifficulty,
  sessionConfig,
  gameCoins,
  gameXp,
  didWin,
  onPlayAgain,
  onDashboard,
  onShare,
  onDoubleCoins
}) => {
  const [hasDoubled, setHasDoubled] = React.useState(false);
  const [isDoubling, setIsDoubling] = React.useState(false);
  const [adUnavailable, setAdUnavailable] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);

  const handleDoubleCoins = async () => {
    if (isDoubling || hasDoubled) return;

    setIsDoubling(true);
    setAdUnavailable(false);
    let success = false;
    try {
      success = await onDoubleCoins();
    } catch {
      success = false;
    } finally {
      setIsDoubling(false);
    }
    if (success) {
      setHasDoubled(true);
    } else {
      setAdUnavailable(true);
    }
  };

  const handleLeave = async (action: () => Promise<void>) => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      await action();
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050d29] px-4 py-5 font-['Lexend'] text-white"
      style={{
        paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        backgroundImage: "linear-gradient(rgba(5, 13, 41, .75), rgba(5, 13, 41, .92)), url('/assets/orbit-space-bg.png')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-cyan-200/25 bg-[#0b1b48]/98 p-5 text-center shadow-2xl sm:p-7">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/40 bg-yellow-300/10 text-yellow-200 shadow-[0_0_32px_rgba(250,204,21,.2)]">
            <Trophy className="h-11 w-11" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-cyan-200/65">{didWin ? 'Mission complete' : 'Mission ended'}</p>
          <h1 className="mt-2 font-['Press_Start_2P'] text-xl leading-relaxed text-white sm:text-2xl">{didWin ? 'Sector cleared' : 'Run complete'}</h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-100">
            <Orbit className="h-4 w-4" /> {modeName} · {modeDifficulty}
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-200/15 bg-slate-950/25 px-4 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Final score</p>
            <p className="mt-2 font-['Press_Start_2P'] text-4xl text-orange-200 sm:text-5xl">{score}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-yellow-300/15 bg-yellow-400/10 px-3 py-3">
                <Coins className="mx-auto h-5 w-5 text-yellow-200" />
                <p className="mt-1 text-lg font-black text-yellow-100">+{gameCoins}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-100/55">Coins</p>
              </div>
              <div className="rounded-2xl border border-violet-300/15 bg-violet-400/10 px-3 py-3">
                <Sparkles className="mx-auto h-5 w-5 text-violet-200" />
                <p className="mt-1 text-lg font-black text-violet-100">+{gameXp}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-100/55">XP earned</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-blue-100/55">{sessionConfig.description}</p>

          <div className="mt-5 space-y-2.5">
            {didWin && !hasDoubled && gameCoins > 0 && (
              <button
                type="button"
                onClick={handleDoubleCoins}
                disabled={isDoubling}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-200/40 bg-yellow-300 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-50"
              >
                <Video className="h-5 w-5" /> {isDoubling ? 'Loading reward...' : 'Double coins · watch ad'}
              </button>
            )}
            {adUnavailable && <p role="status" className="rounded-xl bg-red-400/15 px-3 py-2 text-xs font-bold text-red-100">The reward ad is unavailable. Try again later; your mission coins are safe.</p>}
            <button type="button" onClick={() => handleLeave(onPlayAgain)} disabled={isLeaving} aria-busy={isLeaving} className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-700/50 bg-orange-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-orange-300 active:translate-y-1 active:border-b-0 disabled:cursor-wait disabled:opacity-60">
              Play this mission again <Zap className="h-5 w-5" />
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={onShare} className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-400/10 px-3 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/20"><Share2 className="h-4 w-4" /> Share score</button>
              <button type="button" aria-label="Return to homepage" onClick={() => handleLeave(onDashboard)} disabled={isLeaving} aria-busy={isLeaving} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-black text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"><Home className="h-4 w-4" /> Home <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompletionScreen;
