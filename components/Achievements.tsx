import React from 'react';
import { X, Award } from 'lucide-react';
import { AchievementItem } from '../types';

interface AchievementsProps {
  unlockedAchievements: string[];
  achievementsList: AchievementItem[];
  onClose: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ unlockedAchievements, achievementsList, onClose }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onClose} className="mb-6 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="bg-white rounded-3xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-purple-500" /> Achievements
          </h2>
          <p className="text-center text-gray-500 font-bold mb-6">
            {unlockedAchievements.length} / {achievementsList.length} Unlocked
          </p>
          <div className="bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedAchievements.length / achievementsList.length) * 100}%` }}
            />
          </div>
          <div className="grid gap-4">
            {achievementsList.map((ach) => {
              const isUnlocked = unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-md'
                      : 'bg-gray-100 opacity-60 grayscale-[0.5]'
                  }`}
                >
                  <div className="text-4xl filter drop-shadow-sm">{ach.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{ach.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{ach.description}</p>
                    <p className={`text-sm font-medium ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                      {isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
                    </p>
                  </div>
                  <div className="text-right bg-white/50 p-2 rounded-xl min-w-[80px]">
                    <p className="text-lg font-bold text-yellow-600">+{ach.reward}</p>
                    <p className="text-xs text-gray-500 uppercase">coins</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
