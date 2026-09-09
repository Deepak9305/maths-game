import React from 'react';
import { Calendar, CheckCircle, Flame, Star } from 'lucide-react';
import Confetti from './Confetti';

interface DailyRewardModalProps {
  streak: number;
  bonus: number;
  onClose: () => void;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ streak, bonus, onClose }) => {
  const getFlameColor = () => {
    if (streak >= 30) return 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]';
    if (streak >= 14) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]';
    if (streak >= 7) return 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    if (streak >= 3) return 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]';
    return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
  };

  return (
    <div role="alertdialog" aria-modal="true" aria-label="Daily reward earned" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-3 animate-fade-in sm:p-4">
      <div aria-hidden="true"><Confetti /></div>
      <div className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-sm overflow-x-hidden overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900 to-black p-5 text-center shadow-2xl animate-bounce-in sm:max-h-[calc(100dvh-2rem)] sm:p-7">
        
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/3 rounded-full bg-orange-500/15"></div>

        <div className="relative z-10 mx-auto -mt-10 mb-2 flex w-fit">
          <div className="bg-gradient-to-b from-orange-400 to-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] border-4 border-gray-900">
            <Flame className="w-10 h-10 animate-pulse" fill="currentColor" />
          </div>
        </div>

        <h2 className="mt-1 mb-2 text-3xl font-black tracking-tight text-white">Streak Kept!</h2>
        <p className="mb-4 font-medium text-gray-400">Your daily visit is counted and the bonus is already collected.</p>

        <div className="relative mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
             <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Current Streak</span>
             <span className={`bg-orange-500/20 px-3 py-1 rounded-lg text-sm font-black flex items-center gap-1 ${getFlameColor()}`}>
               {streak} {streak === 1 ? 'DAY' : 'DAYS'} <Flame className="w-4 h-4" fill="currentColor" />
             </span>
          </div>
          
          <div className="flex flex-col items-center">
             <div className="relative">
               <span className="text-6xl mb-2 filter drop-shadow-lg relative z-10">💰</span>
               <div className="absolute inset-0 rounded-full bg-yellow-400/15 z-0"></div>
             </div>
             <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mt-2">
               +{bonus}
             </span>
             <span className="text-yellow-500/50 text-xs font-bold uppercase tracking-widest mt-2">Bonus Coins Earned</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 py-3.5 text-lg font-black text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:from-orange-400 hover:to-red-500 hover:scale-[1.02] active:scale-95"
        >
          <CheckCircle className="w-6 h-6" /> Continue
        </button>
      </div>
    </div>
  );
};

export default DailyRewardModal;
