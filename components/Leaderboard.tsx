import React from 'react';
import { X, Crown } from 'lucide-react';

interface LeaderboardProps {
  playerName: string;
  totalScore: number;
  level: number;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ playerName, totalScore, level, onClose }) => {
  const leaderboardData = [
    { name: 'Math Wizard', score: 5420, level: 12, avatar: '🧙' },
    { name: 'Number Ninja', score: 4850, level: 11, avatar: '🥷' },
    { name: playerName || 'You', score: totalScore, level: level, avatar: '👨‍🚀' }
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onClose} className="mb-6 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" /> Leaderboard
          </h2>
          <div className="space-y-4">
            {leaderboardData.map((player, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-2xl transition-transform hover:scale-[1.02] ${
                  player.name === playerName
                    ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                      i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="text-3xl">{player.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{player.name}</p>
                    <p className="text-sm text-gray-500">Level {player.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 font-mono">{player.score}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
