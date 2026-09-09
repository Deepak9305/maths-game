import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Calculator,
  Delete,
  Grid2X2,
  Heart,
  Infinity,
  Lightbulb,
  Orbit,
  Pause,
  Snowflake,
  Square,
  Target,
  TimerReset,
  Zap
} from 'lucide-react';
import { GameMode, ModeDifficulty, ModeSessionConfig, PlayerState, Question } from '../types';
import Confetti from '../components/Confetti';

interface GameScreenProps {
  question: Question;
  mode: GameMode;
  modeName: string;
  modeDifficulty: ModeDifficulty;
  sessionConfig: ModeSessionConfig;
  difficulty: 'easy' | 'medium' | 'hard' | 'survival';
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

const MODE_ICONS: Record<GameMode, React.ComponentType<{ className?: string }>> = {
  'quick-calc': Calculator,
  'square-sprint': Square,
  'log-lab': BarChart3,
  'mini-sudoku': Grid2X2,
  'target-puzzle': Target,
  survival: Orbit
};

const MODE_ACCENTS: Record<GameMode, { icon: string; glow: string; soft: string }> = {
  'quick-calc': { icon: 'text-cyan-200', glow: 'shadow-cyan-400/20', soft: 'bg-cyan-400/10' },
  'square-sprint': { icon: 'text-violet-200', glow: 'shadow-violet-400/20', soft: 'bg-violet-400/10' },
  'log-lab': { icon: 'text-emerald-200', glow: 'shadow-emerald-400/20', soft: 'bg-emerald-400/10' },
  'mini-sudoku': { icon: 'text-orange-200', glow: 'shadow-orange-400/20', soft: 'bg-orange-400/10' },
  'target-puzzle': { icon: 'text-rose-200', glow: 'shadow-rose-400/20', soft: 'bg-rose-400/10' },
  survival: { icon: 'text-red-200', glow: 'shadow-red-400/20', soft: 'bg-red-400/10' }
};

const GameScreen: React.FC<GameScreenProps> = ({
  question,
  mode,
  modeName,
  modeDifficulty,
  sessionConfig,
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
  const isHintVisible = feedback.startsWith('Hint:');
  const isChoiceQuestion = Boolean(question.choices?.length);
  const Icon = MODE_ICONS[mode];
  const accent = MODE_ACCENTS[mode];

  useEffect(() => {
    if (!isWaveTransition) {
      setUserAnswer('');
      isProcessingRef.current = false;
    }
  }, [question, isWaveTransition]);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = gameContainerRef.current;
    if (!element) return;
    const prevent = (event: TouchEvent) => event.preventDefault();
    element.addEventListener('touchmove', prevent, { passive: false });
    return () => element.removeEventListener('touchmove', prevent);
  }, []);

  const isProcessing = Boolean(feedback && !isHintVisible);

  const submitAnswer = (answer: string) => {
    if (!answer || (answer === '-' && !isChoiceQuestion) || isProcessing || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setUserAnswer(answer);
    onAnswer(answer);
  };

  const handleSubmit = () => submitAnswer(userAnswer);

  const handleNumpadInput = (value: string) => {
    if (isProcessing || isProcessingRef.current) return;
    if (value === 'DEL') {
      setUserAnswer(previous => previous.slice(0, -1));
    } else if (value === '-') {
      setUserAnswer(previous => previous.startsWith('-') ? previous.slice(1) : `-${previous}`);
    } else if (userAnswer.length < 8) {
      setUserAnswer(previous => previous + value);
    }
  };

  const progressValue = Math.min(100, Math.max(0, progress));
  const currentLivesLabel = currentLives === null ? 'Infinite lives' : `${currentLives} lives remaining`;

  return (
    <div
      ref={gameContainerRef}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden overscroll-none bg-[#050d29] font-['Lexend'] text-white select-none"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
        backgroundImage: "linear-gradient(rgba(5, 13, 41, .78), rgba(5, 13, 41, .94)), url('/assets/orbit-space-bg.png')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {showAnimations && showConfetti && <Confetti />}

      {isWaveTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-6 text-center animate-fade-in">
          <div>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-300/40 bg-red-400/15 text-red-200 shadow-[0_0_40px_rgba(248,113,113,.25)]">
              <Orbit className="h-10 w-10 animate-spin-slow" />
            </div>
            <h2 className="font-['Press_Start_2P'] text-3xl text-red-200 sm:text-5xl">Wave {currentWave}</h2>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.28em] text-white/60">Incoming difficulty spike</p>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            aria-label="Pause game"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-[#0b1b48]/90 text-cyan-100 shadow-lg backdrop-blur-md transition hover:bg-cyan-400/15 active:scale-95"
          >
            <Pause className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 rounded-2xl border border-cyan-200/20 bg-[#0b1b48]/90 px-3 py-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 shrink-0 ${accent.icon}`} />
              <div className="min-w-0">
                <p className="truncate font-['Press_Start_2P'] text-[10px] text-white sm:text-xs">{modeName}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200/60">{modeDifficulty} mission</p>
              </div>
              {difficulty === 'survival' && (
                <span className="ml-auto shrink-0 rounded-lg bg-red-400/15 px-2 py-1 text-[10px] font-black uppercase text-red-200">Wave {currentWave}</span>
              )}
            </div>
          </div>

          {timer !== null && (
            <div className={`flex h-11 min-w-[4.5rem] shrink-0 items-center justify-center gap-1 rounded-2xl border border-cyan-200/20 bg-[#0b1b48]/90 px-3 text-sm font-black tabular-nums text-white shadow-lg backdrop-blur-md ${timer <= 5 ? 'border-red-300/50 bg-red-400/20 text-red-100 animate-pulse' : ''}`}>
              <TimerReset className="h-4 w-4" />
              {timer}s
            </div>
          )}
        </header>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-cyan-200/15 bg-[#0b1b48]/85 px-3 py-2 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-wider text-cyan-200/55">Score</p>
            <p className="mt-1 text-lg font-black text-white tabular-nums">{score}</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2 backdrop-blur-md ${streak > 0 ? 'border-orange-300/30 bg-orange-400/10' : 'border-white/10 bg-[#0b1b48]/85'}`}>
            <p className="text-[9px] font-black uppercase tracking-wider text-orange-200/60">Streak</p>
            <p className="mt-1 flex items-center gap-1 text-lg font-black text-orange-100 tabular-nums"><Zap className="h-4 w-4" />{streak}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200/15 bg-[#0b1b48]/85 px-3 py-2 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-wider text-cyan-200/55">Lives</p>
            <div className="mt-1 flex min-h-7 items-center gap-1" aria-label={currentLivesLabel}>
              {currentLives === null ? (
                <span className="flex items-center gap-1 text-cyan-100"><Heart className="h-4 w-4 fill-cyan-300 text-cyan-300" /><Infinity className="h-4 w-4" /></span>
              ) : (
                <>
                  {Array.from({ length: currentLives }).map((_, index) => <Heart key={index} aria-hidden="true" className="h-4 w-4 fill-red-400 text-red-300" />)}
                  {currentLives < 3 && Array.from({ length: 3 - currentLives }).map((_, index) => <Heart key={`lost-${index}`} aria-hidden="true" className="h-4 w-4 text-red-950/80" />)}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full border border-cyan-200/10 bg-slate-950/70">
            <div className={`h-full rounded-full transition-all duration-500 ${difficulty === 'survival' ? 'bg-gradient-to-r from-red-400 to-orange-300' : 'bg-gradient-to-r from-cyan-300 to-violet-400'}`} style={{ width: `${progressValue}%` }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-100/60">{Math.round(progressValue)}%</span>
        </div>

        {streak >= 3 && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-orange-300/25 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100 animate-fade-in-down">
            <Zap className="h-4 w-4" /> {streak} in a row
            {combo >= 5 && <span className="rounded-md bg-orange-300 px-2 py-0.5 text-[9px] uppercase text-slate-950">2x bonus</span>}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => powerUps.hint > 0 ? onUsePowerUp('hint') : onRequestMorePowerUps('hint')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-95 ${powerUps.hint > 0 ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20' : 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10'}`}
          >
            <Lightbulb className="h-4 w-4" /> {powerUps.hint > 0 ? `Hint · ${powerUps.hint}` : 'Watch ad · Hint'}
          </button>
          <button
            type="button"
            disabled={timer === null}
            onClick={() => powerUps.timeFreeze > 0 ? onUsePowerUp('timeFreeze') : onRequestMorePowerUps('timeFreeze')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${powerUps.timeFreeze > 0 ? 'border-violet-300/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20' : 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10'}`}
          >
            <Snowflake className="h-4 w-4" /> {powerUps.timeFreeze > 0 ? `Freeze · ${powerUps.timeFreeze}` : 'Watch ad · Freeze'}
          </button>
        </div>

        <section className={`relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-cyan-100/30 bg-[#f6fbff] p-4 text-center shadow-2xl ${accent.glow} ${shake ? 'animate-shake' : ''}`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-violet-300/20 blur-2xl" />

          {question.visualAid && (
            <div className="relative mb-2 flex min-h-6 max-h-16 flex-wrap justify-center gap-1.5 overflow-y-auto p-1">
              {Array.from({ length: question.visualAid }).map((_, index) => <div key={index} className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-md animate-bounce-in" style={{ animationDelay: `${index * 50}ms` }} />)}
            </div>
          )}

          <div className="relative flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/70">
            <Icon className="h-4 w-4" /> {modeName}
          </div>
          <div className="relative mt-3 break-words font-mono text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">{question.display}</div>

          {isHintVisible && (
            <div className="relative mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-900 animate-pulse">{feedback}</div>
          )}

          {isChoiceQuestion ? (
            <div className="relative mt-5 grid flex-1 auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2">
              {question.choices?.map((choice, index) => {
                const selected = userAnswer === String(index);
                return (
                  <button
                    type="button"
                    key={`${choice}-${index}`}
                    onClick={() => submitAnswer(String(index))}
                    disabled={isProcessing}
                    className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-mono text-base font-black transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-70 ${selected ? 'border-orange-400 bg-orange-100 text-orange-900 shadow-lg' : 'border-indigo-100 bg-indigo-50 text-indigo-900 hover:border-cyan-300 hover:bg-cyan-50'}`}
                  >
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-xs text-indigo-500">{String.fromCharCode(65 + index)}</span>
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="relative mt-4 flex min-h-14 items-center justify-center rounded-2xl border-2 border-indigo-100 bg-indigo-50 px-4 shadow-inner">
                <span className={`font-mono text-4xl font-black tracking-widest ${userAnswer ? 'text-indigo-900' : 'text-indigo-200'}`}>{userAnswer || '?'}</span>
              </div>

              <div className="relative mt-3 flex min-h-0 flex-1 flex-col gap-1.5">
                {([[1, 2, 3], [4, 5, 6], [7, 8, 9]] as number[][]).map(row => (
                  <div key={row[0]} className="flex min-h-0 flex-1 gap-1.5">
                    {row.map(number => (
                      <button key={number} type="button" onClick={() => handleNumpadInput(String(number))} className="flex flex-1 items-center justify-center rounded-xl border-b-4 border-indigo-100 bg-indigo-50 text-2xl font-black text-indigo-900 shadow-sm transition hover:bg-indigo-100 active:translate-y-1 active:border-b-0">{number}</button>
                    ))}
                  </div>
                ))}
                <div className="flex min-h-0 flex-1 gap-1.5">
                  <button type="button" onClick={() => handleNumpadInput('-')} aria-label="Toggle negative" className="flex flex-1 items-center justify-center rounded-xl border-b-4 border-orange-100 bg-orange-50 text-2xl font-black text-orange-600 transition hover:bg-orange-100 active:translate-y-1 active:border-b-0">±</button>
                  <button type="button" onClick={() => handleNumpadInput('0')} className="flex flex-1 items-center justify-center rounded-xl border-b-4 border-indigo-100 bg-indigo-50 text-2xl font-black text-indigo-900 shadow-sm transition hover:bg-indigo-100 active:translate-y-1 active:border-b-0">0</button>
                  <button type="button" onClick={() => handleNumpadInput('DEL')} aria-label="Delete last digit" className="flex flex-1 items-center justify-center rounded-xl border-b-4 border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 active:translate-y-1 active:border-b-0"><Delete className="h-6 w-6" /></button>
                </div>
                <button type="button" onClick={handleSubmit} disabled={!userAnswer || isProcessing} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-700/40 bg-orange-400 text-base font-black text-slate-950 shadow-lg transition hover:bg-orange-300 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-45">Lock answer <Zap className="h-5 w-5" /></button>
              </div>
            </>
          )}
        </section>

        {feedback && !isHintVisible && (
          <div aria-live="polite" className={`min-h-8 py-1 text-center text-sm font-black ${showAnimations ? 'animate-bounce' : ''} ${feedback.includes('Oops') || feedback.includes('Try') ? 'text-red-300' : 'text-emerald-300'}`}>{feedback}</div>
        )}

        <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          <span>{sessionConfig.description}</span>
          <span aria-hidden="true">·</span>
          <span>Rocket {equippedRocket}</span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
