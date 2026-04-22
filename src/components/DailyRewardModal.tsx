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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <Confetti />
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/10 relative animate-bounce-in overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>

        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-b from-orange-400 to-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] border-4 border-gray-900">
            <Flame className="w-10 h-10 animate-pulse" fill="currentColor" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mt-8 mb-2 tracking-tight">Streak Kept!</h2>
        <p className="text-gray-400 font-medium mb-6">You're on fire! Keep it up!</p>

        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10 relative">
          <div className="flex justify-between items-center mb-6">
             <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Current Streak</span>
             <span className={`bg-orange-500/20 px-3 py-1 rounded-lg text-sm font-black flex items-center gap-1 ${getFlameColor()}`}>
               {streak} DAYS <Flame className="w-4 h-4" fill="currentColor" />
             </span>
          </div>
          
          <div className="flex flex-col items-center">
             <div className="relative">
               <span className="text-6xl mb-2 filter drop-shadow-lg relative z-10">💰</span>
               <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full z-0"></div>
             </div>
             <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mt-2">
               +{bonus}
             </span>
             <span className="text-yellow-500/50 text-xs font-bold uppercase tracking-widest mt-2">Bonus Coins Earned</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xl font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" /> Claim Reward
        </button>
      </div>
    </div>
  );
};

export default DailyRewardModal;