import React from 'react';
import { Flame, Star, Gift, Zap } from 'lucide-react';

interface StreakBoardProps {
  streak: number;
}

const StreakBoard: React.FC<StreakBoardProps> = ({ streak }) => {
  // Calculate progress towards next 7-day milestone
  const progress = streak % 7;
  const days = [1, 2, 3, 4, 5, 6, 7];
  
  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (streak >= 30) return 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]';
    if (streak >= 14) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]';
    if (streak >= 7) return 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    if (streak >= 3) return 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]';
    return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
  };

  return (
    <div className="bg-gradient-to-b from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-3xl p-5 border border-orange-400/30 relative overflow-hidden group h-full flex flex-col justify-between">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all duration-500"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-white/80 font-bold uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Daily Streak
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white">{streak}</span>
            <span className="text-white/60 font-medium text-sm">days</span>
          </div>
        </div>
        
        <div className={`transform transition-all duration-500 hover:scale-110 ${streak > 0 ? 'animate-pulse' : 'opacity-50 grayscale'}`}>
          <Flame className={`w-14 h-14 ${getFlameColor()}`} fill="currentColor" />
        </div>
      </div>

      {/* 7-Day Tracker */}
      <div className="bg-black/20 rounded-2xl p-3 border border-white/5 relative z-10 mt-auto">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Weekly Progress</span>
          <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md whitespace-nowrap">
            +{streak * 10 > 999 ? '999+' : streak * 10} 💰/Day
          </span>
        </div>
        
        <div className="flex justify-between gap-1.5">
          {days.map((day) => {
            const weekDone = progress === 0 && streak > 0;
            const isCompleted = day <= (weekDone ? 7 : progress);
            const isToday = !weekDone && day === progress + 1;
            const isMilestone = day === 7;
            
            return (
              <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] border-none' 
                      : isToday
                        ? 'bg-white/10 border border-dashed border-orange-400/50'
                        : 'bg-black/30 border border-white/5'
                  }`}
                >
                  {isCompleted ? (
                    <Star className="w-3 h-3 text-white" fill="currentColor" />
                  ) : isMilestone ? (
                    <Gift className={`w-3 h-3 ${isToday ? 'text-orange-400 animate-bounce' : 'text-white/30'}`} />
                  ) : (
                    <span className={`text-[10px] font-bold ${isToday ? 'text-orange-400' : 'text-white/20'}`}>
                      {day}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakBoard;
