import React from 'react';
import { Trophy } from 'lucide-react';
import { Difficulty, DifficultySetting } from '../types';
import { DIFFICULTY_SETTINGS } from '../services/mathService';

interface CompletionScreenProps {
  score: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onDashboard: () => void;
  onShare: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  score,
  difficulty,
  onPlayAgain,
  onDashboard,
  onShare
}) => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const coinsEarned = Math.floor(score / 10);
  const xpEarned = score * settings.xp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400">
        <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400 drop-shadow-lg animate-bounce" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mission Complete! 🎉</h1>
        <p className="text-5xl text-purple-600 font-bold mb-8">{score}</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <p className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">Rewards</p>
          <div className="flex justify-around items-center">
             <div>
                <p className="text-3xl mb-1">💰</p>
                <p className="font-bold text-gray-800 text-xl">+{coinsEarned}</p>
                <p className="text-xs text-gray-500">Coins</p>
             </div>
             <div className="w-px h-12 bg-gray-200"></div>
             <div>
                <p className="text-3xl mb-1">✨</p>
                <p className="font-bold text-gray-800 text-xl">+{xpEarned}</p>
                <p className="text-xs text-gray-500">XP</p>
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold py-4 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Play Again 🔄
          </button>
          <button
            onClick={onShare}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white text-xl font-bold py-4 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Share Score 📱
          </button>
          <button
            onClick={onDashboard}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-4 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Dashboard 🏠
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
