import React from 'react';
import { Trophy } from 'lucide-react';
import { Difficulty, DifficultySetting } from '../types';
import { DIFFICULTY_SETTINGS } from '../services/mathService';

interface CompletionScreenProps {
  score: number;
  difficulty: Difficulty;
  gameCoins: number;
  gameXp: number;
  onPlayAgain: () => void;
  onDashboard: () => void;
  onShare: () => void;
  onDoubleCoins: () => Promise<boolean>;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  score,
  difficulty,
  gameCoins,
  gameXp,
  onPlayAgain,
  onDashboard,
  onShare,
  onDoubleCoins
}) => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const [hasDoubled, setHasDoubled] = React.useState(false);
  const [isDoubling, setIsDoubling] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400 overflow-y-auto max-h-[95vh]">
        <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400 drop-shadow-lg" style={{ animation: 'bounce 0.6s ease-in-out 3' }} />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mission Complete! 🎉</h1>
        <p className={`inline-block text-sm font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-4 ${settings.color} text-white`}>
          {settings.name}
        </p>
        <p className="text-5xl text-purple-600 font-bold mb-8">{score}</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <p className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">Rewards</p>
          <div className="flex justify-around items-center">
             <div>
                <p className="text-3xl mb-1">💰</p>
                <p className="font-bold text-gray-800 text-xl">+{gameCoins}</p>
                <p className="text-xs text-gray-500">Coins</p>
             </div>
             <div className="w-px h-12 bg-gray-200"></div>
             <div>
                <p className="text-3xl mb-1">✨</p>
                <p className="font-bold text-gray-800 text-xl">+{gameXp}</p>
                <p className="text-xs text-gray-500">XP</p>
             </div>
          </div>
        </div>

        <div className="space-y-3">
          {!hasDoubled && gameCoins > 0 && (
            <button
              onClick={async () => {
                setIsDoubling(true);
                const success = await onDoubleCoins();
                setIsDoubling(false);
                if (success) {
                  setHasDoubled(true);
                }
              }}
              disabled={isDoubling}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold py-3 rounded-2xl transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              {isDoubling ? 'Loading Ad...' : '📺 Double Coins!'}
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold py-3 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Play Again 🔄
          </button>
          <button
            onClick={onShare}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white text-xl font-bold py-3 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Share Score 📱
          </button>
          <button
            onClick={onDashboard}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xl font-bold py-3 rounded-2xl transition-transform hover:scale-105 shadow-lg"
          >
            Dashboard 🏠
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
