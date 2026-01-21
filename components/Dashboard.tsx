import React from 'react';
import { TrendingUp, Award, Share2, Users } from 'lucide-react';
import { PlayerState, Difficulty, DifficultySetting } from '../types';
import { DIFFICULTY_SETTINGS } from '../services/mathService';

interface DashboardProps {
  player: PlayerState;
  dailyStreak: number;
  friendCode: string;
  onStartGame: (diff: Difficulty) => void;
  onNavigate: (screen: 'shop' | 'leaderboard' | 'achievements') => void;
  onShare: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  player,
  dailyStreak,
  friendCode,
  onStartGame,
  onNavigate,
  onShare
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-4xl">👨‍🚀</span> {player.name}
            </h2>
            <p className="text-yellow-300 font-medium mt-1">
              Level {player.level} • {Math.floor(player.xp)}/{player.level * 100} XP
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-yellow-400/20 hover:bg-yellow-400/30 transition-colors px-4 py-2 rounded-xl text-white font-bold border border-yellow-400/50"
            >
              {player.coins} 💰
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-xl border border-white/20"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-black/30 rounded-full h-4 mb-8 overflow-hidden backdrop-blur-sm border border-white/10">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(player.xp / (player.level * 100)) * 100}%` }}
          />
        </div>

        {/* Daily Streak */}
        <div className="bg-yellow-400/20 backdrop-blur-md rounded-2xl p-4 mb-8 text-center border border-yellow-400/30 transform hover:scale-[1.02] transition-transform">
          <p className="text-white font-bold text-lg flex justify-center items-center gap-2">
            🔥 Daily Streak: {dailyStreak} days!
          </p>
          <p className="text-yellow-300 text-sm mt-1">+{dailyStreak * 10} bonus coins today</p>
        </div>

        {/* Game Modes */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {(Object.entries(DIFFICULTY_SETTINGS) as [Difficulty, DifficultySetting][]).map(([key, settings]) => (
            <button
              key={key}
              onClick={() => onStartGame(key)}
              className={`${settings.color} hover:brightness-110 active:scale-95 transform transition-all rounded-3xl p-6 text-white shadow-xl border-b-4 border-black/20`}
            >
              <div className="text-5xl mb-3 drop-shadow-md">
                {key === 'easy' ? '⭐' : key === 'medium' ? '🚀' : '🏆'}
              </div>
              <h3 className="text-xl font-bold mb-2">{settings.name}</h3>
              <p className="text-sm opacity-90 font-medium">
                {key === 'easy' ? '➕➖ Add & Subtract' : key === 'medium' ? '✖️➗ Multiply & Divide' : '🧮 Mixed Operations'}
              </p>
              {settings.time && <p className="text-xs mt-3 bg-black/20 inline-block px-2 py-1 rounded-lg">⏱️ {settings.time}s per Q</p>}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => onNavigate('achievements')}
            className="bg-purple-500/30 hover:bg-purple-500/40 border border-purple-500/30 backdrop-blur-md p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <Award className="w-6 h-6" /> Achievements ({player.achievements.length}/4)
          </button>
          <button
            onClick={onShare}
            className="bg-pink-500/30 hover:bg-pink-500/40 border border-pink-500/30 backdrop-blur-md p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <Share2 className="w-6 h-6" /> Share
          </button>
        </div>

        {/* Friend Code */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white border border-white/10">
          <h3 className="font-bold mb-2 flex items-center gap-2 justify-center text-lg">
            <Users className="w-5 h-5" /> Your Friend Code
          </h3>
          <p className="text-3xl font-bold text-yellow-300 text-center py-2 tracking-widest">{friendCode}</p>
          <p className="text-sm text-center opacity-75">Share to challenge friends!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
