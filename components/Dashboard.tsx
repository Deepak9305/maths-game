import React, { useState } from 'react';
import { TrendingUp, Award, Share2, Users, Swords, Skull, Shield, CheckCircle, Zap } from 'lucide-react';
import { PlayerState, Difficulty, DifficultySetting } from '../types';
import { DIFFICULTY_SETTINGS } from '../services/mathService';

interface DashboardProps {
  player: PlayerState;
  dailyStreak: number;
  friendCode: string;
  onStartGame: (diff: Difficulty) => void;
  onNavigate: (screen: 'shop' | 'leaderboard' | 'achievements' | 'privacy') => void;
  onShare: () => void;
  onJoinChallenge: (code: string) => void;
  onClaimChallenge: (id: string) => void;
}

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
  const [challengeInput, setChallengeInput] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 pb-12">
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

        {/* Daily Streak & Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-yellow-400/20 backdrop-blur-md rounded-2xl p-4 text-center border border-yellow-400/30 transform hover:scale-[1.02] transition-transform">
            <p className="text-white font-bold text-lg flex justify-center items-center gap-2">
              🔥 Streak: {dailyStreak} days!
            </p>
            <p className="text-yellow-300 text-sm mt-1">+{dailyStreak * 10} bonus coins today</p>
          </div>

          {/* Daily Challenges Section */}
          <div className="md:col-span-2 bg-indigo-500/20 backdrop-blur-md rounded-2xl p-4 border border-indigo-400/30">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Daily Missions
            </h3>
            <div className="space-y-3">
              {player.dailyChallenges && player.dailyChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-black/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-bold">{challenge.description}</span>
                      <span className={challenge.completed ? "text-green-400" : "text-gray-400"}>
                        {Math.min(challenge.current, challenge.target)}/{challenge.target}
                      </span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${challenge.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    {challenge.claimed ? (
                      <span className="text-gray-500 text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Done
                      </span>
                    ) : (
                      <button
                        disabled={!challenge.completed}
                        onClick={() => onClaimChallenge(challenge.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                          challenge.completed 
                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg animate-pulse' 
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                      >
                         {challenge.completed ? 'Claim' : `+${challenge.reward}`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!player.dailyChallenges || player.dailyChallenges.length === 0) && (
                <p className="text-white/50 text-sm text-center">No active missions.</p>
              )}
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(Object.entries(DIFFICULTY_SETTINGS) as [Difficulty, DifficultySetting][]).map(([key, settings]) => (
            <button
              key={key}
              onClick={() => onStartGame(key)}
              className={`${settings.color} hover:brightness-110 active:scale-95 transform transition-all rounded-3xl p-4 text-white shadow-xl border-b-4 border-black/20 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden`}
            >
              {key === 'survival' && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-bl-xl">
                  NEW!
                </div>
              )}
              <div className="text-4xl mb-3 drop-shadow-md">
                {key === 'easy' ? '⭐' : key === 'medium' ? '🚀' : key === 'hard' ? '🏆' : <Skull className="w-10 h-10 animate-pulse" />}
              </div>
              <h3 className="text-lg font-bold mb-1">{settings.name}</h3>
              <p className="text-xs opacity-90 font-medium text-center">
                {key === 'easy' ? 'Add & Subtract' : key === 'medium' ? 'Multiply & Divide' : key === 'hard' ? 'Mixed Operations' : '10 Waves of Chaos!'}
              </p>
              {settings.time && <p className="text-[10px] mt-2 bg-black/20 px-2 py-1 rounded-lg">⏱️ {settings.time}s</p>}
            </button>
          ))}
        </div>

        {/* Challenge Section */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-orange-400/30">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <Swords className="w-6 h-6 text-orange-400" /> Challenge a Friend
              </h3>
              <p className="text-gray-300 text-sm mt-1">Enter a friend's code to play the <b>exact same questions</b> they did!</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="bg-black/30 border-2 border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-orange-400 w-full font-mono uppercase"
              />
              <button 
                onClick={() => challengeInput && onJoinChallenge(challengeInput)}
                disabled={!challengeInput}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-xl transition-all"
              >
                VS
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => onNavigate('achievements')}
            className="bg-purple-500/30 hover:bg-purple-500/40 border border-purple-500/30 backdrop-blur-md p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <Award className="w-6 h-6" /> Achievements
          </button>
          <button
            onClick={onShare}
            className="bg-pink-500/30 hover:bg-pink-500/40 border border-pink-500/30 backdrop-blur-md p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <Share2 className="w-6 h-6" /> Share Code
          </button>
        </div>

        {/* Friend Code */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white border border-white/10 relative text-center">
          <h3 className="font-bold mb-2 flex items-center gap-2 justify-center text-lg">
            <Users className="w-5 h-5" /> Your Friend Code
          </h3>
          <p className="text-3xl font-bold text-yellow-300 py-2 tracking-widest font-mono">{friendCode}</p>
          <p className="text-sm opacity-75">Send this code to friends so they can challenge you!</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
          <button 
            onClick={() => onNavigate('privacy')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full"
          >
            <Shield className="w-4 h-4" /> Privacy Policy
          </button>
          <p className="text-white/20 text-xs font-mono">v1.0.0 • Math Quest</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;