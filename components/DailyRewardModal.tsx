import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import Confetti from './Confetti';

interface DailyRewardModalProps {
  streak: number;
  bonus: number;
  onClose: () => void;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ streak, bonus, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Confetti />
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative animate-bounce-in">
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 text-yellow-900 p-4 rounded-full shadow-lg border-4 border-white">
            <Calendar className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-800 mt-8 mb-2">Daily Bonus!</h2>
        <p className="text-gray-500 font-medium mb-6">Thanks for playing today!</p>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
             <span className="text-gray-600 font-bold uppercase text-sm">Current Streak</span>
             <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">
               {streak} DAYS 🔥
             </span>
          </div>
          
          <div className="flex flex-col items-center">
             <span className="text-5xl mb-2 filter drop-shadow-sm">💰</span>
             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
               +{bonus}
             </span>
             <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Coins Earned</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" /> Claim Reward
        </button>
      </div>
    </div>
  );
};

export default DailyRewardModal;