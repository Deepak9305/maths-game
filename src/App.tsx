import React, { useState, useEffect, useCallback, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import SplashScreen from './screens/SplashScreen';
import Dashboard from './screens/Dashboard';
import GameScreen from './screens/GameScreen';
import SudokuScreen from './screens/SudokuScreen';
import CompletionScreen from './screens/CompletionScreen';
import Achievements from './screens/Achievements';
import Shop from './screens/Shop';
import DailyRewardModal from './components/DailyRewardModal';
import PauseModal from './components/PauseModal';
import PowerUpAdModal from './components/PowerUpAdModal';
import ContinueAdModal from './components/ContinueAdModal';
import MapScreen from './screens/MapScreen';
import PetScreen from './screens/PetScreen';
import { PlayerState, ScreenState, Difficulty, Question, RocketItem, AchievementItem, GameMode, ModeDifficulty, SudokuSize } from './types';
import type { PluginListenerHandle } from '@capacitor/core';
import { createSeededRandom, generateDailyChallenges } from './services/mathService';
import { GAME_MODE_DEFINITIONS, generateModeQuestion, generateSudokuPuzzle, getModeConfig, getSurvivalConfig, modeDifficultyToLegacyDifficulty, countFilledSudokuCells, PRIMARY_GAME_MODES } from './services/modeService';
import { playSound, music } from './services/audioService';
import { adMobService } from './services/adMobService';
import { nativeService } from './services/nativeService';
import { storageService } from './services/storageService';

// Constants
const ROCKETS: RocketItem[] = [
  { icon: '🚀', name: 'Explorer', cost: 0, perk: 'Standard Performance' },
  { icon: '⭐', name: 'Speed Star', cost: 500, perk: '+50% XP Boost' },
  { icon: '🛸', name: 'Mega Blaster', cost: 1000, perk: '2x Coin Earnings' }
];

const ACHIEVEMENTS_LIST: AchievementItem[] = [
  // --- EXISTING ---
  { id: 'first_win', name: 'First Victory', icon: '🎯', reward: 50, description: 'Complete your first game' },
  { id: 'streak_10', name: 'Streak Master', icon: '🔥', reward: 200, description: 'Get a 10-answer streak in one game' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', reward: 100, description: 'Answer correctly with under 3s left' },
  { id: 'perfect_game', name: 'Perfect Game', icon: '💯', reward: 150, description: 'Answer every question correctly' },
  { id: 'level_5', name: 'High Flyer', icon: '🦅', reward: 300, description: 'Reach player level 5' },
  { id: 'coin_1000', name: 'Treasure Hunter', icon: '💎', reward: 250, description: 'Earn 1,000 coins total' },
  { id: 'score_5000', name: 'Brainiac', icon: '🧠', reward: 400, description: 'Reach a lifetime score of 5,000' },
  { id: 'combo_10', name: 'Combo King', icon: '👑', reward: 150, description: 'Build a 10x combo multiplier' },
  { id: 'wave_20', name: 'Survivor', icon: '🛡️', reward: 500, description: 'Reach wave 20 in Survival mode' },

  // Progression
  { id: 'level_10', name: 'Commander', icon: '👨‍✈️', reward: 500, description: 'Reach player level 10' },
  { id: 'level_20', name: 'Admiral', icon: '🎖️', reward: 1000, description: 'Reach player level 20' },
  { id: 'level_50', name: 'Galactic Emperor', icon: '👑', reward: 5000, description: 'Reach player level 50' },

  // Lifetime Score
  { id: 'total_score_10k', name: 'Math Whiz', icon: '🎓', reward: 1000, description: 'Reach a lifetime score of 10,000' },
  { id: 'total_score_50k', name: 'Calculus King', icon: '📐', reward: 2500, description: 'Reach a lifetime score of 50,000' },
  { id: 'total_score_100k', name: 'Omniscient', icon: '👁️', reward: 5000, description: 'Reach a lifetime score of 100,000' },

  // Economy
  { id: 'hoarder_coins', name: 'Banker', icon: '🏦', reward: 500, description: 'Collect 2,000 coins at once' },
  { id: 'wealthy_coins', name: 'Tycoon', icon: '💰', reward: 1000, description: 'Collect 5,000 coins at once' },
  { id: 'rocket_collector', name: 'Fleet Admiral', icon: '🚀', reward: 2000, description: 'Own all rockets in the shop' },

  // Skill & Streaks
  { id: 'streak_25', name: 'On Fire', icon: '🚒', reward: 500, description: 'Get a 25-answer streak in one game' },
  { id: 'streak_50', name: 'Unstoppable', icon: '🛑', reward: 1000, description: 'Get a 50-answer streak in one game' },
  { id: 'streak_100', name: 'Math God', icon: '😇', reward: 2500, description: 'Get a 100-answer streak in one game' },
  { id: 'combo_20', name: 'Flow State', icon: '🌊', reward: 500, description: 'Build a 20x combo multiplier' },
  { id: 'score_game_5000', name: 'Epic Run', icon: '🏃', reward: 1000, description: 'Score 5,000 in a single game' },

  // Modes
  { id: 'wave_5', name: 'Survivor I', icon: '🌵', reward: 200, description: 'Reach wave 5 in Survival mode' },
  { id: 'wave_10', name: 'Survivor II', icon: '🌴', reward: 500, description: 'Reach wave 10 in Survival mode' },
  { id: 'wave_30', name: 'Void Walker', icon: '👻', reward: 2000, description: 'Reach wave 30 in Survival mode' },
  { id: 'hard_streak_20', name: 'Hardcore', icon: '💀', reward: 1000, description: 'Get a 20-answer streak in Hard mode' },

  // Daily Habits
  { id: 'daily_streak_3', name: 'Consistent', icon: '📅', reward: 100, description: 'Log in 3 days in a row' },
  { id: 'daily_streak_7', name: 'Dedicated', icon: '📆', reward: 500, description: 'Log in 7 days in a row' }
];

const QUESTIONS_PER_WAVE = 5;
const GALAXY_MAP_LEVELS = 50;
type PrimaryMode = Exclude<GameMode, 'survival'>;
type ModeProgress = NonNullable<PlayerState['modeProgress']>;

const clampMapLevel = (value: number | undefined, fallback = 1) => {
  const level = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(GALAXY_MAP_LEVELS, Math.max(1, level));
};

const getInitialModeProgress = (savedPlayer?: PlayerState): ModeProgress => {
  const legacyLevel = clampMapLevel(savedPlayer?.level);
  const hasSavedModeProgress = savedPlayer?.modeProgress !== undefined;

  return PRIMARY_GAME_MODES.reduce<ModeProgress>((progress, mode) => {
    const savedLevel = savedPlayer?.modeProgress?.[mode];
    const gamesPlayed = savedPlayer?.modeStats?.[mode]?.gamesPlayed;
    const legacyModeLevel = hasSavedModeProgress
      ? 1
      : gamesPlayed !== undefined
        ? clampMapLevel(gamesPlayed + 1)
        : legacyLevel;

    progress[mode] = clampMapLevel(savedLevel, legacyModeLevel);
    return progress;
  }, {});
};

const isPrimaryMode = (mode: GameMode): mode is PrimaryMode => PRIMARY_GAME_MODES.includes(mode as PrimaryMode);
const getSurvivalSudokuMistakeLimit = (wave: number) => Math.max(1, 3 - Math.floor((wave - 1) / 4));

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [isLoaded, setIsLoaded] = useState(false);

  // Game Configuration State
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameMode, setGameMode] = useState<GameMode>('quick-calc');
  const [modeDifficulty, setModeDifficulty] = useState<ModeDifficulty>('standard');
  const [sudokuSize, setSudokuSize] = useState<SudokuSize>(4);
  const [isSurvivalMode, setIsSurvivalMode] = useState(false);
  const [friendCode, setFriendCode] = useState('QUEST' + Math.floor(Math.random() * 9000 + 1000));
  const friendCodeRef = useRef<string>('');

  // Player Data Persistence
  const [player, setPlayer] = useState<PlayerState>({
    name: '',
    coins: 150,
    level: 1,
    xp: 0,
    totalScore: 0,
    achievements: [],
    equippedRocket: '🚀',
    ownedRockets: ['🚀'],
    powerUps: { hint: 3, timeFreeze: 2 },
    lastRewardDate: null,
    dailyChallenges: [],
    lastChallengeDate: null,
    showAnimations: true,
    modeStats: {},
    modeProgress: getInitialModeProgress()
  });
  const [dailyStreak, setDailyStreak] = useState(1);
  const [dailyRewardInfo, setDailyRewardInfo] = useState<{ streak: number; bonus: number } | null>(null);

  // Active Game Session State
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [gameCoins, setGameCoins] = useState(0);
  const [gameXp, setGameXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentLives, setCurrentLives] = useState<number | null>(null);

  // Sudoku session state (kept separate because Sudoku is a board game, not a question stream)
  const [sudokuBoard, setSudokuBoard] = useState<number[][] | null>(null);
  const [sudokuSolution, setSudokuSolution] = useState<number[][] | null>(null);
  const [sudokuGiven, setSudokuGiven] = useState<boolean[][] | null>(null);
  const [sudokuSelectedCell, setSudokuSelectedCell] = useState<{ row: number; column: number } | null>(null);
  const [sudokuMistakes, setSudokuMistakes] = useState(0);
  const sudokuCompleteRef = useRef(false);

  // Survival Mode State
  const [currentWave, setCurrentWave] = useState(1);
  const [isWaveTransition, setIsWaveTransition] = useState(false);

  // Challenge Mode State
  const rngRef = useRef<() => number>(Math.random);
  const screenRef = useRef<ScreenState>('splash');
  const playerRef = useRef<PlayerState>(player);
  const [activeChallengeCode, setActiveChallengeCode] = useState<string | null>(null);

  // Feedback UI State
  const [feedback, setFeedback] = useState('');
  const feedbackRef = useRef<string>('');
  const [shake, setShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<'timeFreeze' | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const lastRewardProcessedRef = useRef<string | null>(null);

  // Pause & Ad State
  const [isPaused, setIsPaused] = useState(false);
  const [powerUpAdTarget, setPowerUpAdTarget] = useState<'hint' | 'timeFreeze' | null>(null);
  const [lossContinueOpen, setLossContinueOpen] = useState(false);
  const [hasUsedRewardContinue, setHasUsedRewardContinue] = useState(false);
  const [completionOutcome, setCompletionOutcome] = useState<'won' | 'lost'>('won');

  // --- Effects ---

  // Initialization
  useEffect(() => {
    const init = async () => {
      // Keep native setup off the first-render path so the home screen can appear immediately.
      void (async () => {
        try {
          await nativeService.initialize();
          await adMobService.initialize();

          // Setup Local Notifications for re-engagement after the app is already usable.
          const permStatus = await nativeService.notifications.requestPermissions();
          if (permStatus?.display === 'granted') {
            await nativeService.notifications.scheduleRecurring();
          }
        } catch (error) {
          console.warn('Background native setup failed', error);
        }
      })();

      // Load independent local data in parallel before showing the personalized home screen.
      const [persistedCode, savedData] = await Promise.all([
        storageService.getFriendCode(() => 'QUEST' + Math.floor(Math.random() * 9000 + 1000)),
        storageService.loadData()
      ]);
      setFriendCode(persistedCode);

      if (savedData) {
        const p = savedData.player;
        if (!p.ownedRockets) p.ownedRockets = ['🚀'];
        if (!p.equippedRocket) p.equippedRocket = '🚀';
        if (!p.achievements) p.achievements = [];
        if (!p.powerUps) p.powerUps = { hint: 3, timeFreeze: 2 };
        if (typeof p.powerUps.hint !== 'number') p.powerUps.hint = 3;
        if (typeof p.powerUps.timeFreeze !== 'number') p.powerUps.timeFreeze = 2;
        if (p.lastRewardDate === undefined) p.lastRewardDate = null;
        if (!p.dailyChallenges) p.dailyChallenges = [];
        if (!p.modeStats) p.modeStats = {};
        p.modeProgress = getInitialModeProgress(p);

        // Check if we need to generate new challenges
        const today = new Date().toDateString();
        if (p.lastChallengeDate !== today) {
          p.dailyChallenges = generateDailyChallenges();
          p.lastChallengeDate = today;
        }

        // Handle Pet Decay and Defaults
        if (p.pet && !p.pets) {
          // Migrate legacy pet
          p.pets = {
            'alien': { ...p.pet, id: 'alien' }
          };
          p.activePetId = 'alien';
          delete p.pet;
        }

        if (!p.pets) {
          p.pets = {
            'alien': { id: 'alien', name: 'Astro', happiness: 100, hunger: 0, level: 1, xp: 0, lastInteractionTime: Date.now() }
          };
          p.activePetId = 'alien';
        }

        if (p.pets) {
          const now = Date.now();
          Object.values(p.pets).forEach(pet => {
            if (pet.xp === undefined) pet.xp = 0;
            if (pet.lastInteractionTime === undefined) pet.lastInteractionTime = now;

            const hoursPassed = (now - pet.lastInteractionTime) / (1000 * 60 * 60);
            if (hoursPassed > 1) {
              // Only update timestamp when decay actually happens
              const decayAmount = Math.floor(hoursPassed * 5); // 5 points per hour
              pet.happiness = Math.max(0, pet.happiness - decayAmount);
              pet.hunger = Math.min(100, pet.hunger + decayAmount);
              pet.lastInteractionTime = now; // stamp only after decaying
            }
          });
        }

        setPlayer(p);
        setDailyStreak(savedData.dailyStreak);
      } else {
        // First launch, generate challenges
        setPlayer(prev => ({
          ...prev,
          dailyChallenges: generateDailyChallenges(),
          lastChallengeDate: new Date().toDateString(),
          pets: {
            'alien': { id: 'alien', name: 'Astro', happiness: 100, hunger: 0, level: 1, xp: 0, lastInteractionTime: Date.now() }
          },
          activePetId: 'alien'
        }));
      }

      setIsLoaded(true);
    };

    init();
  }, []);

  // Auto-pause on background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && screen === 'game') {
        setIsPaused(true);
        music.stop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screen]);

  // Save Data
  useEffect(() => {
    if (isLoaded) {
      storageService.saveData(player, dailyStreak).then(ok => {
        if (!ok) nativeService.ui.showToast('Warning: Progress could not be saved.');
      });
    }
  }, [player, dailyStreak, isLoaded]);

  // Handle Music
  useEffect(() => {
    if (screen === 'game' && !isWaveTransition && !isPaused && !powerUpAdTarget && !lossContinueOpen) {
      music.startGameMusic(difficulty);
    } else {
      music.stop();
    }
    return () => music.stop();
  }, [screen, difficulty, isWaveTransition, isPaused, powerUpAdTarget, lossContinueOpen]);

  // Handle Android Back Button
  // Keep screenRef in sync with screen state
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Keep feedbackRef in sync with feedback state
  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  // Keep playerRef in sync with player state
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    let listener: PluginListenerHandle | null = null;

    const setupBackButton = async () => {
      try {
        listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (screenRef.current === 'game') {
            setIsPaused(true);
          } else if (screenRef.current === 'dashboard' || screenRef.current === 'splash') {
            CapacitorApp.exitApp();
          } else {
            setScreen('dashboard');
            music.stop();
          }
        });
      } catch (e) {
        console.warn('Back button setup failed', e);
      }
    };

    setupBackButton();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  const navigate = (newScreen: ScreenState) => {
    playSound.click();
    nativeService.haptics.impactLight();
    setScreen(newScreen);
  };

  const calculateSurvivalTime = (wave: number) => {
    return Math.max(3, 10 - Math.floor((wave - 1) * 0.5));
  };

  const startMode = (
    requestedMode: GameMode,
    tier: ModeDifficulty,
    selectedSudokuSize: SudokuSize = 4,
    challengeCode?: string,
    requestedSurvival = requestedMode === 'survival'
  ) => {
    playSound.click();
    const mode = requestedMode === 'survival' ? 'quick-calc' : requestedMode;
    const survival = requestedSurvival || requestedMode === 'survival';
    setGameMode(mode);
    setIsSurvivalMode(survival);
    setModeDifficulty(tier);
    setDifficulty(survival ? 'survival' : modeDifficultyToLegacyDifficulty(tier));

    if (challengeCode) {
      rngRef.current = createSeededRandom(challengeCode);
      setActiveChallengeCode(challengeCode);
    } else {
      rngRef.current = Math.random;
      setActiveChallengeCode(null);
    }

    setScore(0);
    setGameCoins(0);
    setGameXp(0);
    setStreak(0);
    setCombo(0);
    setProgress(0);
    setQuestionsAnswered(0);
    setCurrentWave(1);
    setIsWaveTransition(false);
    setIsPaused(false);
    setPowerUpAdTarget(null);
    setLossContinueOpen(false);
    setHasUsedRewardContinue(false);
    setCompletionOutcome('won');
    setFeedback('');
    setShowConfetti(false);
    setActivePowerUp(null);
    setSudokuMistakes(0);
    setSudokuSelectedCell(null);
    sudokuCompleteRef.current = false;

    const settings = survival ? getSurvivalConfig(mode, tier, 1) : getModeConfig(mode, tier);
    setCurrentLives(settings.lives);

    if (mode === 'mini-sudoku') {
      const puzzle = generateSudokuPuzzle(selectedSudokuSize, tier, rngRef.current, 1, survival);
      setSudokuSize(selectedSudokuSize);
      setSudokuBoard(puzzle.puzzle);
      setSudokuSolution(puzzle.solution);
      setSudokuGiven(puzzle.given);
      setQuestion(null);
      setTimer(null);
    } else {
      setSudokuBoard(null);
      setSudokuSolution(null);
      setSudokuGiven(null);
      setQuestion(generateModeQuestion(mode, tier, rngRef.current, 1, survival));
      setTimer(settings.time);
    }

    setScreen('game');
  };

  // Backwards-compatible entry point for the legacy map/challenge actions.
  const startGame = (diff: Difficulty, challengeCode?: string) => {
    const tier: ModeDifficulty = diff === 'easy' ? 'beginner' : diff === 'hard' ? 'expert' : 'standard';
    startMode(diff === 'survival' ? 'survival' : 'quick-calc', tier, 4, challengeCode);
  };

  const handleJoinChallenge = (code: string) => {
    startMode('quick-calc', 'standard', 4, code);
  };

  const unlockAchievement = useCallback((id: string) => {
    if (!player.achievements.includes(id)) {
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
      const reward = ach ? ach.reward : 0;

      setPlayer(prev => {
        if (prev.achievements.includes(id)) return prev;

        return {
          ...prev,
          achievements: [...prev.achievements, id],
          coins: prev.coins + reward
        };
      });

      playSound.levelUp();
      nativeService.haptics.notificationSuccess();
    }
  }, [player.achievements]);

  const handleGameCompletion = useCallback(async (completedScore = score, completedStreak = streak, outcome: 'won' | 'lost' = 'won') => {
    setCompletionOutcome(outcome);
    const routeMode: PrimaryMode | null = !isSurvivalMode && outcome === 'won' && isPrimaryMode(gameMode)
      ? gameMode
      : null;

    setPlayer(prev => {
      const previousStats = prev.modeStats?.[gameMode] ?? { bestScore: 0, bestStreak: 0, gamesPlayed: 0 };
      const nextModeProgress = routeMode
        ? {
            ...getInitialModeProgress(prev),
            [routeMode]: clampMapLevel((prev.modeProgress?.[routeMode] ?? 1) + 1)
          }
        : prev.modeProgress;

      return {
        ...prev,
        modeStats: {
          ...(prev.modeStats ?? {}),
          [gameMode]: {
            ...previousStats,
            bestScore: Math.max(previousStats.bestScore, completedScore),
            bestStreak: Math.max(previousStats.bestStreak, completedStreak),
            gamesPlayed: previousStats.gamesPlayed + 1
          }
        },
        ...(routeMode ? { modeProgress: nextModeProgress } : {})
      };
    });

    if (outcome === 'won' && !player.achievements.includes('first_win')) {
      unlockAchievement('first_win');
    }

    const today = new Date().toDateString();

    if (player.lastRewardDate !== today && lastRewardProcessedRef.current !== today) {
      lastRewardProcessedRef.current = today;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = dailyStreak;
      if (player.lastRewardDate === yesterdayString) {
        newStreak = dailyStreak + 1;
      } else {
        newStreak = 1;
      }

      const bonusCoins = newStreak * 10;

      setDailyStreak(newStreak);

      // Check Daily Streak Achievements
      if (newStreak >= 3) setTimeout(() => unlockAchievement('daily_streak_3'), 100);
      if (newStreak >= 7) setTimeout(() => unlockAchievement('daily_streak_7'), 200);

      setTimeout(() => {
        playSound.levelUp();
        nativeService.haptics.notificationSuccess();
        setDailyRewardInfo({ streak: newStreak, bonus: bonusCoins });
      }, 800);

      setPlayer(prev => {
        if (prev.lastRewardDate === today) return prev;
        return {
          ...prev,
          coins: prev.coins + bonusCoins,
          lastRewardDate: today
        };
      });
    }

    setScreen('complete');
  }, [player.achievements, player.lastRewardDate, dailyStreak, unlockAchievement, gameMode, score, streak, isSurvivalMode]);

  const handleDoubleCoins = async (): Promise<boolean> => {
    if (completionOutcome !== 'won') return false;
    playSound.click();
    const success = await adMobService.showRewardVideo('double-coins');
    if (success) {
      // Add the same amount again (doubling total) — don't double-count what's already added
      setPlayer(prev => ({ ...prev, coins: prev.coins + gameCoins }));
      setGameCoins(prev => prev * 2);
      playSound.levelUp();
      nativeService.haptics.notificationSuccess();
    }
    return success;
  };

  const handleContinueAfterLoss = async (): Promise<boolean> => {
    if (hasUsedRewardContinue || currentLives === null) return false;

    playSound.click();
    const rewarded = await adMobService.showRewardVideo('continue');
    if (!rewarded) return false;

    const settings = isSurvivalMode ? getSurvivalConfig(gameMode, modeDifficulty, currentWave) : getModeConfig(gameMode, modeDifficulty);
    setHasUsedRewardContinue(true);
    setLossContinueOpen(false);
    setCurrentLives(1);
    if (gameMode === 'mini-sudoku') {
      setSudokuMistakes(0);
      setSudokuSelectedCell(null);
      setFeedback('');
    } else {
      setQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, currentWave, isSurvivalMode));
      setFeedback('');
      setTimer(isSurvivalMode ? getSurvivalConfig(gameMode, modeDifficulty, currentWave).time : settings.time);
    }
    setShake(false);
    playSound.levelUp();
    nativeService.haptics.notificationSuccess();
    return true;
  };

  const handleEndLostRun = () => {
    setLossContinueOpen(false);
    handleGameCompletion(score, 0, 'lost');
  };

  const handleWatchAdForCoins = async (): Promise<void> => {
    playSound.click();
    const success = await adMobService.showRewardVideo('coins');
    if (success) {
      setPlayer(prev => ({ ...prev, coins: prev.coins + 500 }));
      playSound.levelUp();
      nativeService.haptics.notificationSuccess();
    }
  };

  const checkAnswer = useCallback((answerStr: string) => {
    if (!question || (feedbackRef.current !== '' && !feedbackRef.current.startsWith('Hint:'))) return;

    const submittedValue = Number(answerStr);
    const correct = question.choices
      ? submittedValue === question.answer
      : Math.abs(submittedValue - question.answer) < 0.0001;
    const settings = isSurvivalMode ? getSurvivalConfig(gameMode, modeDifficulty, currentWave) : getModeConfig(gameMode, modeDifficulty);

    if (correct) {
      playSound.correct();
      nativeService.haptics.impactMedium();

      const streakMult = modeDifficulty === 'expert' ? Math.floor(streak / 3) + 1 : 1;
      const comboBonus = combo >= 5 ? 2 : 1;
      let points = 10 * streakMult * comboBonus;

      if (isSurvivalMode) {
        points = Math.floor(points * (1 + (currentWave * 0.2)));
      }

      let earnedCoins = Math.floor(points / 10);
      let earnedXP = points * settings.xp;

      // Pet Bonus (20% more coins and XP if happy and fed)
      let petBonus = 1;
      const activePet = player.pets?.[player.activePetId || 'alien'];
      if (activePet && activePet.happiness >= 80 && activePet.hunger <= 20) {
        petBonus = 1.2;
      }

      earnedCoins = Math.floor(earnedCoins * petBonus);
      earnedXP = Math.floor(earnedXP * petBonus);

      if (player.equippedRocket === '⭐') {
        earnedXP = Math.floor(earnedXP * 1.5);
      } else if (player.equippedRocket === '🛸') {
        earnedCoins = earnedCoins * 2;
      }

      const newScore = score + points;
      const newGameCoins = gameCoins + earnedCoins;
      const newGameXp = gameXp + earnedXP;
      const newStreak = streak + 1;
      const newCombo = combo + 1;

      const newCoins = player.coins + earnedCoins;
      const newTotalScore = player.totalScore + points;

      // Calculate new level for achievement checks
      let newLevel = player.level;
      let newXp = player.xp + earnedXP;
      let leveledUp = false;
      while (newXp >= newLevel * 100) {
        newXp -= (newLevel * 100);
        newLevel++;
        leveledUp = true;
      }

      setScore(newScore);
      setGameCoins(newGameCoins);
      setGameXp(newGameXp);
      setStreak(newStreak);
      setCombo(newCombo);

      setPlayer(prev => {
        // Update Daily Challenge Progress
        const updatedChallenges = prev.dailyChallenges.map(challenge => {
          if (challenge.completed) return challenge;

          let newCurrent = challenge.current;
          switch (challenge.type) {
            case 'total_score':
              newCurrent += points;
              break;
            case 'total_answers':
              newCurrent += 1;
              break;
            case 'high_streak':
              newCurrent = Math.max(challenge.current, newStreak);
              break;
            case 'survival_wave':
              if (isSurvivalMode) {
                newCurrent = Math.max(challenge.current, currentWave);
              }
              break;
          }

          const isNowComplete = newCurrent >= challenge.target;
          return {
            ...challenge,
            current: newCurrent,
            completed: isNowComplete
          };
        });

        // Check completion against prev (not stale closure) so sound fires correctly
        const newlyCompleted = updatedChallenges.some(c => c.completed && !prev.dailyChallenges.find(pc => pc.id === c.id)?.completed);
        if (newlyCompleted) {
          setTimeout(() => playSound.levelUp(), 200);
        }

        let prevXp = prev.xp + earnedXP;
        let prevLevel = prev.level;
        while (prevXp >= prevLevel * 100) {
          prevXp -= (prevLevel * 100);
          prevLevel++;
        }

        return {
          ...prev,
          coins: prev.coins + earnedCoins,
          totalScore: prev.totalScore + points,
          level: prevLevel,
          xp: prevXp,
          dailyChallenges: updatedChallenges
        };
      });

      if (leveledUp) {
        setTimeout(() => {
          playSound.levelUp();
          nativeService.haptics.notificationSuccess();
        }, 500);
      }

      const achievementsToUnlock: string[] = [];

      // Existing Checks
      if (newStreak === 10) achievementsToUnlock.push('streak_10');
      if (isSurvivalMode && currentWave >= 20 && !player.achievements.includes('wave_20')) achievementsToUnlock.push('wave_20');
      if (newCombo >= 10) achievementsToUnlock.push('combo_10');
      if (newLevel >= 5) achievementsToUnlock.push('level_5');
      if (newCoins >= 1000) achievementsToUnlock.push('coin_1000');
      if (newTotalScore >= 5000) achievementsToUnlock.push('score_5000');
      if (modeDifficulty === 'expert' && timer !== null && timer <= 3 && !player.achievements.includes('speed_demon')) achievementsToUnlock.push('speed_demon');

      // --- NEW ACHIEVEMENT CHECKS ---
      // Progression
      if (newLevel >= 10) achievementsToUnlock.push('level_10');
      if (newLevel >= 20) achievementsToUnlock.push('level_20');
      if (newLevel >= 50) achievementsToUnlock.push('level_50');

      // Streaks & Combos
      if (newStreak >= 25 && !player.achievements.includes('streak_25')) achievementsToUnlock.push('streak_25');
      if (newStreak >= 50 && !player.achievements.includes('streak_50')) achievementsToUnlock.push('streak_50');
      if (newStreak >= 100 && !player.achievements.includes('streak_100')) achievementsToUnlock.push('streak_100');
      if (newCombo >= 20 && !player.achievements.includes('combo_20')) achievementsToUnlock.push('combo_20');

      // Hard Mode
      if (modeDifficulty === 'expert' && newStreak >= 20 && !player.achievements.includes('hard_streak_20')) achievementsToUnlock.push('hard_streak_20');

      // Survival Waves
      if (isSurvivalMode) {
        if (currentWave >= 5 && !player.achievements.includes('wave_5')) achievementsToUnlock.push('wave_5');
        if (currentWave >= 10 && !player.achievements.includes('wave_10')) achievementsToUnlock.push('wave_10');
        if (currentWave >= 30 && !player.achievements.includes('wave_30')) achievementsToUnlock.push('wave_30');
      }

      // Single Game Score
      if (newScore >= 5000) achievementsToUnlock.push('score_game_5000');

      // Lifetime Score
      if (newTotalScore >= 10000) achievementsToUnlock.push('total_score_10k');
      if (newTotalScore >= 50000) achievementsToUnlock.push('total_score_50k');
      if (newTotalScore >= 100000) achievementsToUnlock.push('total_score_100k');

      // Wealth
      if (newCoins >= 2000) achievementsToUnlock.push('hoarder_coins');
      if (newCoins >= 5000) achievementsToUnlock.push('wealthy_coins');


      const nextQ = questionsAnswered + 1;
      let isGameComplete = false;

      if (isSurvivalMode) {
        const questionsInWave = nextQ % QUESTIONS_PER_WAVE;
        const waveProgress = ((questionsInWave === 0 ? QUESTIONS_PER_WAVE : questionsInWave) / QUESTIONS_PER_WAVE) * 100;
        setProgress(waveProgress);
        setQuestionsAnswered(nextQ);

        if (questionsInWave === 0) {
          const nextWave = currentWave + 1;
          setCurrentWave(nextWave); // Update before transition so overlay shows correct wave
          setIsWaveTransition(true);
          music.stop();
          nativeService.haptics.notificationSuccess();

          setTimeout(() => {
            setIsWaveTransition(false);
            setQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, nextWave, true));
            setFeedback('');
            setActivePowerUp(null);
            setTimer(getSurvivalConfig(gameMode, modeDifficulty, nextWave).time);
          }, 3000);

          setFeedback(`${['Awesome!', 'Perfect!', 'Amazing!'][Math.floor(Math.random() * 3)]} +${points}`);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);

          // Process achievements before returning
          if (achievementsToUnlock.length > 0) {
            achievementsToUnlock.forEach(id => unlockAchievement(id));
          }
          return;
        }
      } else {
        if (nextQ === settings.questions && newStreak === settings.questions) {
          achievementsToUnlock.push('perfect_game');
        }
        if (nextQ >= settings.questions) {
          isGameComplete = true;
        }
        setProgress((nextQ / settings.questions) * 100);
        setQuestionsAnswered(nextQ);
      }

      if (achievementsToUnlock.length > 0) {
        achievementsToUnlock.forEach(id => unlockAchievement(id));
      }

      setFeedback(`${['Awesome!', 'Perfect!', 'Amazing!'][Math.floor(Math.random() * 3)]} +${points}`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      if (isGameComplete) {
        handleGameCompletion(newScore, newStreak);
      } else {
        // Capture currentWave in a local variable so the timeout closure doesn't use stale state
        const waveForNextQ = currentWave;
        setTimeout(() => {
          setQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, waveForNextQ, isSurvivalMode));
          setFeedback('');
          setActivePowerUp(null);
          if (isSurvivalMode) {
            setTimer(getSurvivalConfig(gameMode, modeDifficulty, waveForNextQ).time);
          } else if (settings.time) {
            setTimer(settings.time);
          }
        }, 1500);
      }
    } else {
      playSound.wrong();
      nativeService.haptics.notificationError();
      setStreak(0);
      setCombo(0);
      setFeedback(`Oops! Answer: ${question.answer}`);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Lives Logic
      let isGameOver = false;
      if (currentLives !== null) {
        const newLives = currentLives - 1;
        setCurrentLives(newLives);
        if (newLives <= 0) {
          isGameOver = true;
        }
      }

      setTimeout(() => {
        if (isGameOver) {
          if (hasUsedRewardContinue) {
            handleGameCompletion(score, 0, 'lost');
          } else {
            setLossContinueOpen(true);
          }
        } else {
          setQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, currentWave, isSurvivalMode));
          setFeedback('');
          if (isSurvivalMode) {
            setTimer(getSurvivalConfig(gameMode, modeDifficulty, currentWave).time);
          } else if (settings.time) {
            setTimer(settings.time);
          }
        }
      }, isGameOver ? 1500 : 2000);
    }
  }, [question, difficulty, gameMode, modeDifficulty, score, streak, combo, questionsAnswered, timer, handleGameCompletion, currentWave, currentLives, unlockAchievement, isSurvivalMode, hasUsedRewardContinue]);

  const handleSudokuSelectCell = (row: number, column: number) => {
    if (!sudokuBoard || !sudokuGiven || sudokuCompleteRef.current || sudokuGiven[row]?.[column]) return;
    playSound.click();
    setSudokuSelectedCell({ row, column });
    setFeedback('');
  };

  const handleSudokuInput = (value: number) => {
    if (!sudokuBoard || !sudokuSolution || !sudokuGiven || !sudokuSelectedCell || sudokuCompleteRef.current) return;

    const { row, column } = sudokuSelectedCell;
    if (sudokuGiven[row]?.[column]) return;

    if (sudokuSolution[row]?.[column] === value) {
      playSound.correct();
      nativeService.haptics.impactMedium();

      const nextBoard = sudokuBoard.map(boardRow => [...boardRow]);
      nextBoard[row][column] = value;
      const filledCells = countFilledSudokuCells(nextBoard);
      const totalCells = sudokuSize * sudokuSize;
      const nextStreak = streak + 1;
      setSudokuBoard(nextBoard);
      setStreak(nextStreak);
      setProgress((filledCells / totalCells) * 100);
      setFeedback(filledCells === totalCells ? 'Sector cleared!' : 'Correct cell locked in.');

      if (filledCells === totalCells) {
        sudokuCompleteRef.current = true;
        const settings = isSurvivalMode
          ? getSurvivalConfig('mini-sudoku', modeDifficulty, currentWave)
          : getModeConfig('mini-sudoku', modeDifficulty);
        const baseScore = sudokuSize === 4 ? 400 : 900;
        const basePoints = Math.max(100, baseScore + (filledCells * 15) - (sudokuMistakes * 50));
        const points = isSurvivalMode ? Math.floor(basePoints * (1 + (currentWave * 0.2))) : basePoints;
        let earnedCoins = Math.floor(points / 10);
        let earnedXP = points * settings.xp;

        const activePet = player.pets?.[player.activePetId || 'alien'];
        if (activePet && activePet.happiness >= 80 && activePet.hunger <= 20) {
          earnedCoins = Math.floor(earnedCoins * 1.2);
          earnedXP = Math.floor(earnedXP * 1.2);
        }
        if (player.equippedRocket === '⭐') earnedXP = Math.floor(earnedXP * 1.5);
        if (player.equippedRocket === '🛸') earnedCoins *= 2;

        let nextLevel = player.level;
        let nextXp = player.xp + earnedXP;
        while (nextXp >= nextLevel * 100) {
          nextXp -= nextLevel * 100;
          nextLevel++;
        }

        const nextWave = currentWave + 1;
        const nextScore = isSurvivalMode ? score + points : points;
        const nextGameCoins = isSurvivalMode ? gameCoins + earnedCoins : earnedCoins;
        const nextGameXp = isSurvivalMode ? gameXp + earnedXP : earnedXP;

        setScore(nextScore);
        setGameCoins(nextGameCoins);
        setGameXp(nextGameXp);
        setQuestionsAnswered(isSurvivalMode ? nextWave : 1);
        setPlayer(prev => ({
          ...prev,
          coins: prev.coins + earnedCoins,
          totalScore: prev.totalScore + points,
          level: nextLevel,
          xp: nextXp,
          dailyChallenges: prev.dailyChallenges.map(challenge => {
            if (challenge.completed) return challenge;
            const current = challenge.type === 'total_score'
              ? challenge.current + points
              : challenge.type === 'total_answers'
                ? challenge.current + 1
              : challenge.type === 'high_streak'
                  ? Math.max(challenge.current, nextStreak)
                  : challenge.type === 'survival_wave' && isSurvivalMode
                    ? Math.max(challenge.current, nextWave)
                  : challenge.current;
            return { ...challenge, current, completed: current >= challenge.target };
          })
        }));

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        if (isSurvivalMode) {
          setCurrentWave(nextWave);
          setIsWaveTransition(true);
          music.stop();
          nativeService.haptics.notificationSuccess();
          setProgress(0);
          setSudokuMistakes(0);
          setSudokuSelectedCell(null);
          setFeedback(`Sector cleared! +${points}`);
          setTimeout(() => {
            const nextPuzzle = generateSudokuPuzzle(sudokuSize, modeDifficulty, rngRef.current, nextWave, true);
            setSudokuBoard(nextPuzzle.puzzle);
            setSudokuSolution(nextPuzzle.solution);
            setSudokuGiven(nextPuzzle.given);
            sudokuCompleteRef.current = false;
            setIsWaveTransition(false);
            setFeedback('');
          }, 3000);
        } else {
          setTimeout(() => handleGameCompletion(points, nextStreak, 'won'), 900);
        }
      }
    } else {
      playSound.wrong();
      nativeService.haptics.notificationError();
      setSudokuMistakes(previous => {
        const nextMistakes = previous + 1;
        if (isSurvivalMode && nextMistakes >= getSurvivalSudokuMistakeLimit(currentWave)) {
          setTimeout(() => {
            if (hasUsedRewardContinue) {
              handleGameCompletion(score, 0, 'lost');
            } else {
              setLossContinueOpen(true);
            }
          }, 500);
        }
        return nextMistakes;
      });
      setFeedback('Try another number.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSudokuErase = () => {
    if (!sudokuBoard || !sudokuGiven || !sudokuSelectedCell || sudokuCompleteRef.current) return;
    const { row, column } = sudokuSelectedCell;
    if (sudokuGiven[row]?.[column]) return;
    if (sudokuBoard[row]?.[column] === 0) return;
    const nextBoard = sudokuBoard.map(boardRow => [...boardRow]);
    nextBoard[row][column] = 0;
    setSudokuBoard(nextBoard);
    setProgress((countFilledSudokuCells(nextBoard) / (sudokuSize * sudokuSize)) * 100);
    setFeedback('Cell cleared.');
  };

  const checkAnswerRef = useRef(checkAnswer);
  useEffect(() => {
    checkAnswerRef.current = checkAnswer;
  }, [checkAnswer]);

  useEffect(() => {
    // Only run timer while the player can answer; reward dialogs pause the run.
    if (screen === 'game' && activePowerUp !== 'timeFreeze' && !isWaveTransition && !isPaused && !powerUpAdTarget && !lossContinueOpen) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t === null || t <= 0) return t;
          if (t <= 1) {
            checkAnswerRef.current('-999999');
            return null;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screen, activePowerUp, isWaveTransition, isPaused, powerUpAdTarget, lossContinueOpen, question]);

  const handleUsePowerUp = (type: 'hint' | 'timeFreeze') => {
    if (player.powerUps[type] <= 0) return;

    playSound.powerUp();
    nativeService.haptics.impactLight();
    setPlayer(prev => {
      if (prev.powerUps[type] <= 0) return prev;
      return {
        ...prev,
        powerUps: { ...prev.powerUps, [type]: prev.powerUps[type] - 1 }
      };
    });

    if (type === 'hint' && question) {
      setFeedback(`Hint: The answer is ${question.correctLabel ?? question.answer}`);
    } else if (type === 'timeFreeze') {
      setActivePowerUp('timeFreeze');
      setTimeout(() => setActivePowerUp(null), 10000);
    }
  };

  const handleRequestMorePowerUps = (type: 'hint' | 'timeFreeze') => {
    playSound.click();
    setPowerUpAdTarget(type);
  };

  const handleWatchPowerUpAd = async (): Promise<void> => {
    if (!powerUpAdTarget) return;

    const success = await adMobService.showRewardVideo('power-up');
    if (success) {
      setPlayer(prev => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [powerUpAdTarget]: prev.powerUps[powerUpAdTarget] + 3
        }
      }));
      nativeService.haptics.notificationSuccess();
      playSound.powerUp();
    }
    setPowerUpAdTarget(null);
  };

  const handleShare = async () => {
    playSound.click();
    let text = `🚀 I scored ${player.totalScore} in Math Quest! Level ${player.level}\n`;
    if (activeChallengeCode) {
      text += `⚔️ I played Challenge Code: ${activeChallengeCode}\n`;
    } else {
      text += `Challenge me: ${friendCode}\n`;
    }
    text += `#MathQuest`;

    const shared = await nativeService.share('Math Quest', text);
    if (!shared) {
      await nativeService.copyToClipboard(text);
      await nativeService.ui.showToast('Score & code copied to clipboard!');
    }
  };

  const handleSelectRocket = (rocket: RocketItem) => {
    playSound.click();

    const isOwned = player.ownedRockets.includes(rocket.icon);

    if (isOwned) {
      setPlayer(prev => ({ ...prev, equippedRocket: rocket.icon }));
      nativeService.haptics.impactLight();
    } else {
      if (player.coins >= rocket.cost) {
        setPlayer(prev => {
          if (prev.ownedRockets.includes(rocket.icon) || prev.coins < rocket.cost) return prev;

          const newOwned = [...prev.ownedRockets, rocket.icon];
          const unlockedCollector = newOwned.length === ROCKETS.length && !prev.achievements.includes('rocket_collector');

          if (unlockedCollector) {
            setTimeout(() => unlockAchievement('rocket_collector'), 500);
          }

          return {
            ...prev,
            coins: prev.coins - rocket.cost,
            ownedRockets: newOwned,
            equippedRocket: rocket.icon
          };
        });

        playSound.levelUp();
        nativeService.haptics.notificationSuccess();
      }
    }
  };

  const handleBuyPowerUp = (type: 'hint' | 'timeFreeze', cost: number) => {
    playSound.click();
    if (player.coins >= cost) {
      setPlayer(prev => {
        if (prev.coins < cost) return prev;
        return {
          ...prev,
          coins: prev.coins - cost,
          powerUps: {
            ...prev.powerUps,
            [type]: prev.powerUps[type] + 1
          }
        };
      });
      playSound.powerUp();
      nativeService.haptics.impactMedium();
    }
  };

  const handleClaimChallenge = (id: string) => {
    const challenge = player.dailyChallenges.find(c => c.id === id);
    if (!challenge || !challenge.completed || challenge.claimed) return;

    playSound.levelUp();
    nativeService.haptics.notificationSuccess();

    setPlayer(prev => {
      const challengeIndex = prev.dailyChallenges.findIndex(c => c.id === id);
      if (challengeIndex === -1) return prev;

      const currentChallenge = prev.dailyChallenges[challengeIndex];
      if (!currentChallenge.completed || currentChallenge.claimed) return prev;

      const newChallenges = [...prev.dailyChallenges];
      newChallenges[challengeIndex] = { ...currentChallenge, claimed: true };

      return {
        ...prev,
        coins: prev.coins + currentChallenge.reward,
        dailyChallenges: newChallenges
      };
    });
  };

  const handleResume = () => {
    playSound.click();
    setIsPaused(false);
  };

  const handleToggleAnimations = () => {
    setPlayer(prev => ({ ...prev, showAnimations: !(prev.showAnimations ?? true) }));
  };

  const handleQuitGame = () => {
    playSound.click();
    setIsPaused(false);
    navigate('dashboard');
    music.stop();
  };

  const handleFeedPet = () => {
    const activePetId = player.activePetId || 'alien';
    const currentPetState = player.pets?.[activePetId];
    if (!currentPetState || player.coins < 10) return;

    const now = Date.now();

    // Pre-compute level-up before setPlayer (updater runs async during render)
    if (currentPetState.lastFedTime && now - currentPetState.lastFedTime < 60000) return;
    let checkXp = (currentPetState.xp || 0) + 15;
    let checkLevel = currentPetState.level;
    let didLevelUp = false;
    while (checkXp >= checkLevel * 50) { checkXp -= checkLevel * 50; checkLevel++; didLevelUp = true; }

    setPlayer(prev => {
      const currentPet = prev.pets?.[activePetId];
      if (!currentPet || prev.coins < 10) return prev;

      if (currentPet.lastFedTime && now - currentPet.lastFedTime < 60000) {
        return prev; // Cooldown active
      }

      let newXp = (currentPet.xp || 0) + 15;
      let newLevel = currentPet.level;
      while (newXp >= newLevel * 50) {
        newXp -= newLevel * 50;
        newLevel++;
      }

      return {
        ...prev,
        coins: prev.coins - 10,
        pets: {
          ...prev.pets,
          [activePetId]: {
            ...currentPet,
            hunger: Math.max(0, currentPet.hunger - 20),
            xp: newXp,
            level: newLevel,
            lastInteractionTime: now,
            lastFedTime: now
          }
        }
      };
    });

    if (didLevelUp) {
      setTimeout(() => playSound.levelUp(), 100);
    } else {
      setTimeout(() => playSound.click(), 100);
    }
  };

  const handlePlayWithPet = () => {
    const activePetId = player.activePetId || 'alien';
    const currentPetState = player.pets?.[activePetId];
    if (!currentPetState || player.coins < 15) return;

    const now = Date.now();

    // Pre-compute level-up before setPlayer (updater runs async during render)
    if (currentPetState.lastPlayedTime && now - currentPetState.lastPlayedTime < 60000) return;
    let checkXp = (currentPetState.xp || 0) + 25;
    let checkLevel = currentPetState.level;
    let didLevelUp = false;
    while (checkXp >= checkLevel * 50) { checkXp -= checkLevel * 50; checkLevel++; didLevelUp = true; }

    setPlayer(prev => {
      const currentPet = prev.pets?.[activePetId];
      if (!currentPet || prev.coins < 15) return prev;

      if (currentPet.lastPlayedTime && now - currentPet.lastPlayedTime < 60000) {
        return prev; // Cooldown active
      }

      let newXp = (currentPet.xp || 0) + 25;
      let newLevel = currentPet.level;
      while (newXp >= newLevel * 50) {
        newXp -= newLevel * 50;
        newLevel++;
      }

      return {
        ...prev,
        coins: prev.coins - 15,
        pets: {
          ...prev.pets,
          [activePetId]: {
            ...currentPet,
            happiness: Math.min(100, currentPet.happiness + 20),
            xp: newXp,
            level: newLevel,
            lastInteractionTime: now,
            lastPlayedTime: now
          }
        }
      };
    });

    if (didLevelUp) {
      setTimeout(() => playSound.levelUp(), 100);
    } else {
      setTimeout(() => playSound.click(), 100);
    }
  };

  const handleRenamePet = (newName: string) => {
    setPlayer(prev => {
      const activePetId = prev.activePetId || 'alien';
      const activePet = prev.pets?.[activePetId];
      if (!activePet) return prev;
      return {
        ...prev,
        pets: {
          ...prev.pets,
          [activePetId]: {
            ...activePet,
            name: newName
          }
        }
      };
    });
  };

  const handleBuyPet = (petId: string, cost: number) => {
    if (player.coins < cost || player.pets?.[petId]) return;

    setPlayer(prev => {
      if (prev.coins < cost || prev.pets?.[petId]) return prev;

      return {
        ...prev,
        coins: prev.coins - cost,
        pets: {
          ...prev.pets,
          [petId]: {
            id: petId,
            name: petId === 'wolf' ? 'Nebula Wolf' : 'Solar Phoenix',
            happiness: 100,
            hunger: 0,
            level: 1,
            xp: 0,
            lastInteractionTime: Date.now()
          }
        },
        activePetId: petId
      };
    });

    setTimeout(() => playSound.levelUp(), 0);
  };

  const handleEquipPet = (petId: string) => {
    setPlayer(prev => {
      if (!prev.pets?.[petId]) return prev;
      return {
        ...prev,
        activePetId: petId
      };
    });
    playSound.click();
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin-slow">🚀</div>
        <p className="text-white text-xl font-bold">Loading...</p>
      </div>
    </div>
  );

  return (
    <>
      {dailyRewardInfo && (
        <DailyRewardModal
          streak={dailyRewardInfo.streak}
          bonus={dailyRewardInfo.bonus}
          onClose={() => setDailyRewardInfo(null)}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onQuit={handleQuitGame}
          showAnimations={player.showAnimations ?? true}
          onToggleAnimations={handleToggleAnimations}
        />
      )}

      {powerUpAdTarget && (
        <PowerUpAdModal
          type={powerUpAdTarget}
          onWatch={handleWatchPowerUpAd}
          onClose={() => setPowerUpAdTarget(null)}
        />
      )}

      {lossContinueOpen && (
        <ContinueAdModal
          modeName={`${GAME_MODE_DEFINITIONS[gameMode].name}${isSurvivalMode ? ' Survival' : ''}`}
          score={score}
          onWatchAndContinue={handleContinueAfterLoss}
          onEndRun={handleEndLostRun}
        />
      )}

      {screen === 'splash' && (
        <SplashScreen
          playerName={player.name}
          setPlayerName={(name) => setPlayer(p => ({ ...p, name }))}
          onStart={() => navigate('dashboard')}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          player={player}
          dailyStreak={dailyStreak}
          friendCode={friendCode}
          onStartGame={(mode, tier, selectedSize, survival) => startMode(mode, tier, selectedSize, undefined, survival)}
          onNavigate={(s) => {
            navigate(s as ScreenState);
          }}
          onShare={handleShare}
          onJoinChallenge={handleJoinChallenge}
          onClaimChallenge={handleClaimChallenge}
        />
      )}

      {screen === 'map' && (
        <MapScreen
          player={player}
          onStartMode={(mode, tier, selectedSize, survival) => startMode(mode, tier, selectedSize, undefined, survival)}
          onClose={() => navigate('dashboard')}
        />
      )}

      {screen === 'pet' && (
        <PetScreen
          player={player}
          onFeed={handleFeedPet}
          onPlay={handlePlayWithPet}
          onRename={handleRenamePet}
          onBuyPet={handleBuyPet}
          onEquipPet={handleEquipPet}
          onClose={() => navigate('dashboard')}
        />
      )}

      {screen === 'game' && gameMode === 'mini-sudoku' && sudokuBoard && sudokuGiven && (
        <SudokuScreen
          size={sudokuSize}
          board={sudokuBoard}
          given={sudokuGiven}
          selectedCell={sudokuSelectedCell}
          mistakes={sudokuMistakes}
          feedback={feedback}
          shake={shake}
          showAnimations={player.showAnimations ?? true}
          onSelectCell={handleSudokuSelectCell}
          onInput={handleSudokuInput}
          onErase={handleSudokuErase}
          onExit={() => setIsPaused(true)}
          currentWave={isSurvivalMode ? currentWave : undefined}
          isWaveTransition={isSurvivalMode && isWaveTransition}
        />
      )}

      {screen === 'game' && gameMode !== 'mini-sudoku' && question && (
        <GameScreen
          question={question}
          mode={gameMode}
          modeName={`${GAME_MODE_DEFINITIONS[gameMode].name}${isSurvivalMode ? ' Survival' : ''}`}
          modeDifficulty={modeDifficulty}
          sessionConfig={isSurvivalMode ? getSurvivalConfig(gameMode, modeDifficulty, currentWave) : getModeConfig(gameMode, modeDifficulty)}
          difficulty={difficulty}
          score={score}
          streak={streak}
          combo={combo}
          timer={timer}
          currentLives={currentLives}
          progress={progress}
          equippedRocket={player.equippedRocket}
          powerUps={player.powerUps}
          onAnswer={checkAnswer}
          onUsePowerUp={handleUsePowerUp}
          onRequestMorePowerUps={handleRequestMorePowerUps}
          onExit={() => setIsPaused(true)}
          feedback={feedback}
          shake={shake}
          showConfetti={showConfetti}
          currentWave={currentWave}
          isWaveTransition={isWaveTransition}
          showAnimations={player.showAnimations ?? true}
        />
      )}

      {screen === 'complete' && (
        <CompletionScreen
          score={score}
          modeName={`${GAME_MODE_DEFINITIONS[gameMode].name}${isSurvivalMode ? ' Survival' : ''}`}
          modeDifficulty={modeDifficulty}
          sessionConfig={isSurvivalMode ? getSurvivalConfig(gameMode, modeDifficulty, currentWave) : getModeConfig(gameMode, modeDifficulty)}
          gameCoins={gameCoins}
          gameXp={gameXp}
          didWin={completionOutcome === 'won'}
          onPlayAgain={() => {
            adMobService.showInterstitial().catch(() => { });
            startMode(gameMode, modeDifficulty, sudokuSize, activeChallengeCode || undefined, isSurvivalMode);
          }}
          onDashboard={() => {
            adMobService.showInterstitial().catch(() => { });
            navigate('dashboard');
          }}
          onShare={handleShare}
          onDoubleCoins={handleDoubleCoins}
        />
      )}

      {screen === 'achievements' && (
        <Achievements
          unlockedAchievements={player.achievements}
          achievementsList={ACHIEVEMENTS_LIST}
          onClose={() => navigate('dashboard')}
        />
      )}

      {screen === 'shop' && (
        <Shop
          coins={player.coins}
          equippedRocket={player.equippedRocket}
          ownedRockets={player.ownedRockets}
          powerUps={player.powerUps}
          rockets={ROCKETS}
          onEquip={handleSelectRocket}
          onBuyPowerUp={handleBuyPowerUp}
          onWatchAd={handleWatchAdForCoins}
          onClose={() => navigate('dashboard')}
        />
      )}
    </>
  );
};

export default App;
