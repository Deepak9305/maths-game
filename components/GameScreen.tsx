import React, { useState, useEffect, useRef } from 'react';
import { X, Skull } from 'lucide-react';
import { Question, Difficulty, PlayerState } from '../types';
import Confetti from './Confetti';

interface GameScreenProps {
  question: Question;
  difficulty: Difficulty;
  score: number;
  streak: number;
  combo: number;
  timer: number | null;
  progress: number;
  equippedRocket: string;
  powerUps: PlayerState['powerUps'];
  onAnswer: (answer: string) => void;
  onUsePowerUp: (type: 'hint' | 'timeFreeze') => void;
  onExit: () => void;
  feedback: string;
  shake: boolean;
  showConfetti: boolean;
  currentWave?: number;
  isWaveTransition?: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
  question,
  difficulty,
  score,
  streak,
  combo,
  timer,
  progress,
  equippedRocket,
  powerUps,
  onAnswer,
  onUsePowerUp,
  onExit,
  feedback,
  shake,
  showConfetti,
  currentWave,
  isWaveTransition
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and question change
  useEffect(() => {
    if (!isWaveTransition) {
      inputRef.current?.focus();
      setUserAnswer('');
    }
  }, [question, isWaveTransition]);

  const handleSubmit = () => {
    if (userAnswer) {
      onAnswer(userAnswer);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and a single minus sign at the start
    if (val === '' || val === '-' || /^-?\d*$/.test(val)) {
      setUserAnswer(val);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 font-['Lexend'] flex flex-col relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Wave Transition Overlay */}
      {isWaveTransition && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center animate-fade-in">
           <div className="text-center">
              <h2 className="text-6xl md:text-8xl font-black text-yellow-400 mb-4 animate-bounce drop-shadow-[0_5px_5px_rgba(255,255,0,0.5)]">
                 WAVE {currentWave}
              </h2>
              <p className="text-2xl text-white font-bold tracking-widest uppercase">Approaching...</p>
           </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onExit} className="bg-red-500 hover:bg-red-600 transition-colors p-3 rounded-full shadow-lg">
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex gap-2">
             <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold text-xl border border-white/10 shadow-lg">
               Score: {score}
             </div>
             {/* Survival Mode Wave Indicator */}
             {difficulty === 'survival' && (
                <div className="bg-red-600 px-4 py-3 rounded-full text-white font-bold text-xl border border-red-400 shadow-lg flex items-center gap-2">
                  <Skull className="w-5 h-5" /> Wave {currentWave}/10
                </div>
             )}
          </div>

          {timer !== null && (
            <div className={`bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold text-xl border border-white/10 shadow-lg transition-all duration-300 ${timer <= 5 ? 'animate-pulse bg-red-500/50 text-red-100' : ''}`}>
              ⏱️ {timer}s
            </div>
          )}
        </div>

        {/* Streak Indicator */}
        {streak > 0 && (
          <div className="bg-yellow-400/20 backdrop-blur-md rounded-2xl p-3 mb-6 text-center border border-yellow-400/30 animate-fade-in-down">
            <p className="text-yellow-300 font-bold text-lg">
              🔥 Streak: {streak} {combo >= 5 && <span className="text-white ml-2 px-2 py-0.5 bg-red-500 rounded-lg text-sm">2x COMBO!</span>}
            </p>
          </div>
        )}

        {/* Power Ups */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => onUsePowerUp('hint')}
            disabled={powerUps.hint <= 0}
            className="flex-1 bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/30 backdrop-blur-md p-3 rounded-xl text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            💡 Hint ({powerUps.hint})
          </button>
          <button
            onClick={() => onUsePowerUp('timeFreeze')}
            disabled={powerUps.timeFreeze <= 0 || !timer}
            className="flex-1 bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/30 backdrop-blur-md p-3 rounded-xl text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ⏱️ Freeze ({powerUps.timeFreeze})
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-3xl filter drop-shadow-lg"
              style={{
                transform: `translateX(${Math.min(progress, 92)}%)`,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {equippedRocket}
            </div>
          </div>
          <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${difficulty === 'survival' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-2xl text-center border-b-8 border-gray-200 ${shake ? 'animate-shake' : ''} flex-1 flex flex-col justify-center`}>
          
          {question.visualAid && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[...Array(question.visualAid)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-sm" />
              ))}
            </div>
          )}

          <div className="text-6xl md:text-8xl font-black text-gray-800 mb-8 font-mono tracking-tighter">
            {question.display}
          </div>

          {/* New Hint Location - Visible and Persistent */}
          {feedback.includes('💡') && (
            <div className="mb-6 bg-blue-100 border-l-8 border-blue-500 text-blue-900 p-4 rounded-xl shadow-lg animate-pulse">
               <p className="text-2xl font-bold">{feedback}</p>
            </div>
          )}
          
          <div className="relative w-full max-w-xs mx-auto">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9-]*"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full text-6xl text-center py-6 px-4 rounded-3xl border-4 border-indigo-100 bg-indigo-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-200/50 outline-none mb-6 font-black text-indigo-900 placeholder-indigo-200 transition-all shadow-inner tracking-widest"
              placeholder="?"
              autoComplete="off"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!userAnswer && userAnswer !== '0'}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-2xl font-bold py-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl active:scale-[0.98] border-b-4 border-green-700/30"
          >
            Submit 🚀
          </button>
          
          {/* Only show Success/Error feedback here (Hint is shown above) */}
          {feedback && !feedback.includes('💡') && (
            <div className={`mt-6 text-xl font-bold animate-bounce ${feedback.includes('Oops') ? 'text-red-500' : 'text-green-500'}`}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;