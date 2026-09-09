import React, { useState } from 'react';
import { Heart, Video, X } from 'lucide-react';

interface ContinueAdModalProps {
  modeName: string;
  score: number;
  onWatchAndContinue: () => Promise<boolean>;
  onEndRun: () => void;
}

const ContinueAdModal: React.FC<ContinueAdModalProps> = ({ modeName, score, onWatchAndContinue, onEndRun }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [adUnavailable, setAdUnavailable] = useState(false);

  const continueRun = async () => {
    setIsLoading(true);
    setAdUnavailable(false);
    const rewarded = await onWatchAndContinue();
    setIsLoading(false);
    if (!rewarded) setAdUnavailable(true);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="continue-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-[#02081d]/85 p-5 font-['Lexend'] text-white backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-[2rem] border border-orange-200/40 bg-[#0b1b48] p-6 text-center shadow-[0_0_42px_rgba(251,146,60,.28)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200/35 bg-red-400/15 text-red-100">
          <Heart className="h-9 w-9 fill-red-400 text-red-200" />
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-orange-200/75">Last life lost</p>
        <h2 id="continue-title" className="mt-2 font-['Press_Start_2P'] text-lg leading-8 text-white">Continue mission?</h2>
        <p className="mt-4 text-sm leading-6 text-blue-100/80">Watch one rewarded ad to restore a life and continue your {modeName} run from {score} points.</p>

        {adUnavailable && <p role="status" className="mt-3 rounded-xl bg-red-400/15 px-3 py-2 text-xs font-bold text-red-100">The reward was not completed. You can try again or end this run.</p>}

        <button
          type="button"
          onClick={continueRun}
          disabled={isLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-700 bg-gradient-to-b from-yellow-300 to-orange-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110 active:translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        >
          <Video className="h-5 w-5" /> {isLoading ? 'Loading reward…' : 'Watch ad · Continue'}
        </button>
        <button type="button" onClick={onEndRun} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-blue-100/70 transition hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" /> End mission
        </button>
      </section>
    </div>
  );
};

export default ContinueAdModal;
