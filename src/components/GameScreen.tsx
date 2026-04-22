import React, { useState, useEffect, useRef } from 'react';
import { Pause, Skull, Heart, Infinity, Delete } from 'lucide-react';
import { Question, Difficulty, PlayerState } from '../types';
import Confetti from './Confetti';

interface GameScreenProps {
  question: Question;
  difficulty: Difficulty;
  score: number;
  streak: number;
  combo: number;
  timer: number | null;
  currentLives: number | null;
  progress: number;
  equippedRocket: string;
  powerUps: PlayerState['powerUps'];
  onAnswer: (answer: string) => void;
  onUsePowerUp: (type: 'hint' | 'timeFreeze') => void;
  onRequestMorePowerUps: (type: 'hint' | 'timeFreeze') => void;
  onExit: () => void;
  feedback: string;
  shake: boolean;
  showConfetti: boolean;
  currentWave?: number;
  isWaveTransition?: boolean;
  showAnimations?: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
  question,
  difficulty,
  score,
  streak,
  combo,
  timer,
  currentLives,
  progress,
  equippedRocket,
  powerUps,
  onAnswer,
  onUsePowerUp,
  onRequestMorePowerUps,
  onExit,
  feedback,
  shake,
  showConfetti,
  currentWave,
  isWaveTransition,
  showAnimations = true
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const isProcessingRef = useRef(false);

  // Clear answer on new question
  useEffect(() => {
    if (!isWaveTransition) {
      setUserAnswer('');
      isProcessingRef.current = false;
    }
  }, [question, isWaveTransition]);

  // Prevent mobile scroll/rubber-band in Capacitor WebView (scoped to game container)
  const gameContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gameContainerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  const isProcessing = Boolean(feedback && !feedback.includes('💡'));

  const handleSubmit = () => {
    if (userAnswer && userAnswer !== '-' && !isProcessing && !isProcessingRef.current) {
      isProcessingRef.current = true;
      onAnswer(userAnswer);
    }
  };

  const handleNumpadInput = (value: string) => {
    if (isProcessing || isProcessingRef.current) return;
    if (value === 'DEL') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (value === '-') {
      // Only allow minus at the start
      if (userAnswer === '') {
        setUserAnswer('-');
      }
    } else {
      // Limit length to prevent overflow
      if (userAnswer.length < 8) {
        setUserAnswer(prev => prev + value);
      }
    }
  };

  return (
    <div ref={gameContainerRef} className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-3 pt-3 pb-2 font-['Lexend'] flex flex-col relative overflow-hidden overscroll-none select-none">
      {showAnimations && showConfetti && <Confetti />}

      {/* Wave Transition Overlay */}
      {isWaveTransition && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <h2 className="text-6xl md:text-8xl font-black text-yellow-400 mb-4 animate-bounce drop-shadow-[0_5px_5px_rgba(255,255,0,0.5)]">
              WAVE {currentWave}
            </h2>
            <p className="text-2xl text-white font-bold tracking-widest uppercase">Approaching...</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative z-10 min-h-0">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-1.5">
          <button onClick={onExit} aria-label="Pause game" className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-full shadow-lg active:scale-95 border border-white/20">
            <Pause className="w-6 h-6 text-white" />
          </button>

          <div className="flex gap-2">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-lg border border-white/10 shadow-lg flex items-center gap-2">
              <span>{score}</span>
              <div className="h-4 w-px bg-white/20"></div>
              <div
                className="flex items-center gap-1"
                aria-label={currentLives === null ? 'Infinite lives' : `${currentLives} lives remaining`}
              >
                {currentLives === null ? (
                  <div className="flex items-center gap-1 text-red-400" aria-hidden="true">
                    <Heart className="w-4 h-4 fill-red-400" />
                    <Infinity className="w-3 h-3" />
                  </div>
                ) : (
                  Array.from({ length: currentLives }).map((_, i) => (
                    <Heart key={i} aria-hidden="true" className="w-4 h-4 text-red-400 fill-red-400 animate-pulse-slow" />
                  ))
                )}
                {currentLives !== null && currentLives < 3 && difficulty !== 'survival' && (
                  Array.from({ length: 3 - currentLives }).map((_, i) => (
                    <Heart key={`lost-${i}`} aria-hidden="true" className="w-4 h-4 text-red-900/50" />
                  ))
                )}
              </div>
            </div>
            {difficulty === 'survival' && (
              <div className="bg-red-600 px-3 py-2 rounded-full text-white font-bold text-lg border border-red-400 shadow-lg flex items-center gap-1">
                <Skull className="w-4 h-4" /> {currentWave}
              </div>
            )}
          </div>

          {timer !== null && (
            <div className={`bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-lg border border-white/10 shadow-lg transition-all duration-300 min-w-[80px] text-center tabular-nums ${timer <= 5 ? 'animate-pulse bg-red-500/50 text-red-100' : ''}`}>
              ⏱️ {timer}
            </div>
          )}
        </div>

        {/* Streak Indicator - Condensed */}
        {streak > 0 && (
          <div className={`backdrop-blur-md rounded-lg px-2 py-1 mb-1.5 text-center border animate-fade-in-down transition-all duration-300 ${streak >= 10 ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
            streak >= 5 ? 'bg-orange-500/20 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]' :
              'bg-yellow-400/10 border-yellow-400/20'
            }`}>
            <p className={`font-bold text-sm flex items-center justify-center gap-2 ${streak >= 10 ? 'text-red-400' :
              streak >= 5 ? 'text-orange-400' :
                'text-yellow-300'
              }`}>
              <span className={streak >= 5 ? 'animate-pulse' : ''}>🔥</span>
              Streak: {streak}
              {combo >= 5 && (
                <span className="text-white ml-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded text-xs shadow-lg animate-bounce">
                  2x COMBO
                </span>
              )}
            </p>
          </div>
        )}

        {/* Power Ups */}
        <div className="flex gap-2 mb-1.5">
          <button
            onClick={() => {
              if (powerUps.hint > 0) onUsePowerUp('hint');
              else onRequestMorePowerUps('hint');
            }}
            className={`flex-1 backdrop-blur-md p-2 rounded-xl font-bold text-sm transition-all active:scale-95 border ${powerUps.hint > 0
              ? 'bg-blue-500/30 hover:bg-blue-500/40 border-blue-400/30 text-white'
              : 'bg-gray-800/40 hover:bg-gray-800/60 border-gray-600/40 text-gray-300'
              }`}
          >
            {powerUps.hint > 0 ? `💡 Hint (${powerUps.hint})` : `📺 Free Hint`}
          </button>

          <button
            onClick={() => {
              if (powerUps.timeFreeze > 0) onUsePowerUp('timeFreeze');
              else onRequestMorePowerUps('timeFreeze');
            }}
            disabled={!timer}
            className={`flex-1 backdrop-blur-md p-2 rounded-xl font-bold text-sm transition-all active:scale-95 border disabled:opacity-30 disabled:cursor-not-allowed ${powerUps.timeFreeze > 0
              ? 'bg-purple-500/30 hover:bg-purple-500/40 border-purple-400/30 text-white'
              : 'bg-gray-800/40 hover:bg-gray-800/60 border-gray-600/40 text-gray-300'
              }`}
          >
            {powerUps.timeFreeze > 0 ? `⏱️ Freeze (${powerUps.timeFreeze})` : `📺 Free`}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-full p-0.5 mb-1.5 border border-white/10 relative h-5 overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out opacity-80 ${difficulty === 'survival' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 text-xl transition-all duration-500"
            style={{ left: `clamp(0px, calc(${Math.min(100, Math.max(0, progress))}% - 12px), calc(100% - 24px))` }}
          >
            {equippedRocket}
          </div>
        </div>

        {/* Game Card */}
        <div className={`bg-white rounded-3xl p-3 shadow-2xl text-center border-b-4 border-gray-200 ${shake ? 'animate-shake' : ''} flex-1 flex flex-col min-h-0 overflow-hidden`}>

          {/* Visual Aid */}
          {question.visualAid && (
            <div className="flex justify-center gap-1 mb-2 flex-wrap min-h-[1.5rem]">
              {[...Array(question.visualAid)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-sm" />
              ))}
            </div>
          )}

          {/* Question Display */}
          <div className="text-4xl font-black text-gray-800 mb-1.5 font-mono tracking-tighter">
            {question.display}
          </div>

          {/* Hint Message */}
          {feedback.includes('💡') && (
            <div className="mb-2 bg-blue-100 border-l-4 border-blue-500 text-blue-900 px-3 py-2 rounded-lg shadow-sm text-sm font-bold animate-pulse">
              {feedback}
            </div>
          )}

          {/* Answer Display Box */}
          <div className="w-full bg-indigo-50 border-4 border-indigo-100 rounded-2xl min-h-[3rem] flex items-center justify-center mb-1.5 shadow-inner">
            <span className={`text-3xl font-black tracking-widest ${userAnswer ? 'text-indigo-900' : 'text-indigo-200/50'}`}>
              {userAnswer || '?'}
            </span>
          </div>

          {/* Numpad & Submit */}
          <div className="flex flex-col flex-1 min-h-0 gap-1.5">
            {([[1, 2, 3], [4, 5, 6], [7, 8, 9]] as number[][]).map((row) => (
              <div key={row[0]} className="flex gap-1.5 flex-1 min-h-0">
                {row.map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumpadInput(num.toString())}
                    className="flex-1 min-h-12 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-900 text-2xl font-bold rounded-xl shadow-sm border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-1.5 flex-1 min-h-0">
              <button
                onClick={() => handleNumpadInput('-')}
                className="flex-1 min-h-12 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-900 text-2xl font-bold rounded-xl shadow-sm border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all"
              >
                -
              </button>
              <button
                onClick={() => handleNumpadInput('0')}
                className="flex-1 min-h-12 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-900 text-2xl font-bold rounded-xl shadow-sm border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all"
              >
                0
              </button>
              <button
                onClick={() => handleNumpadInput('DEL')}
                className="flex-1 min-h-12 flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 text-xl font-bold rounded-xl shadow-sm border-b-4 border-red-100 active:border-b-0 active:translate-y-1 transition-all"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={userAnswer.length === 0 || isProcessing}
              className="flex-shrink-0 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-3 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg border-b-4 border-green-700/30"
            >
              SUBMIT 🚀
            </button>
          </div>

        </div>

        {/* Result Feedback (Success/Error) - positioned outside card to avoid layout shift */}
        {feedback && !feedback.includes('💡') && (
          <div className={`text-center py-1 text-lg font-bold ${showAnimations ? 'animate-bounce' : ''} ${feedback.includes('Oops') ? 'text-red-400' : 'text-green-400'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;