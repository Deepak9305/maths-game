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
import { GAME_MODE_DEFINITIONS, generateModeQuestion, generateSudokuPuzzle, getGalaxyMapDifficulty, getModeConfig, getSurvivalConfig, modeDifficultyToLegacyDifficulty, countFilledSudokuCells, PRIMARY_GAME_MODES } from './services/modeService';
import { playSound, music } from './services/audioService';
import { adMobService } from './services/adMobService';
import { nativeService } from './services/nativeService';
import { normalizePlayerState, storageService } from './services/storageService';

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
  { id: 'coin_1000', name: 'Treasure Hunter', icon: '💎', reward: 250, description: 'Hold 1,000 coins at once' },
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
const BANNER_SCREENS: ScreenState[] = ['map', 'pet', 'shop', 'achievements'];
const BACK_DISMISS_EVENT = 'mathquest-back-dismiss';

const clampMapLevel = (value: number | undefined, fallback = 1) => {
  const level = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(GALAXY_MAP_LEVELS, Math.max(1, level));
};

const getInitialModeProgress = (savedPlayer?: PlayerState): ModeProgress => {
  const legacyLevel = clampMapLevel(savedPlayer?.level);
  return PRIMARY_GAME_MODES.reduce<ModeProgress>((progress, mode) => {
    const savedLevel = savedPlayer?.modeProgress?.[mode];
    const gamesPlayed = savedPlayer?.modeStats?.[mode]?.gamesPlayed;
    const fallback = typeof gamesPlayed === 'number' && Number.isFinite(gamesPlayed)
      ? clampMapLevel(gamesPlayed + 1)
      : legacyLevel;
    progress[mode] = clampMapLevel(savedLevel, fallback);
    return progress;
  }, {});
};

const isPrimaryMode = (mode: GameMode): mode is PrimaryMode => PRIMARY_GAME_MODES.includes(mode as PrimaryMode);
const getSurvivalSudokuMistakeLimit = (wave: number) => Math.max(1, 3 - Math.floor((wave - 1) / 4));

const getSharedAchievementIds = ({
  level, coins, totalScore, score, streak, difficulty, survival, wave
}: {
  level: number; coins: number; totalScore: number; score: number; streak: number;
  difficulty: ModeDifficulty; survival: boolean; wave: number;
}) => {
  const ids: string[] = [];
  if (level >= 5) ids.push('level_5');
  if (level >= 10) ids.push('level_10');
  if (level >= 20) ids.push('level_20');
  if (level >= 50) ids.push('level_50');
  if (coins >= 1000) ids.push('coin_1000');
  if (coins >= 2000) ids.push('hoarder_coins');
  if (coins >= 5000) ids.push('wealthy_coins');
  if (totalScore >= 5000) ids.push('score_5000');
  if (totalScore >= 10000) ids.push('total_score_10k');
  if (totalScore >= 50000) ids.push('total_score_50k');
  if (totalScore >= 100000) ids.push('total_score_100k');
  if (score >= 5000) ids.push('score_game_5000');
  if (streak >= 10) ids.push('streak_10');
  if (streak >= 25) ids.push('streak_25');
  if (streak >= 50) ids.push('streak_50');
  if (streak >= 100) ids.push('streak_100');
  if (difficulty === 'expert' && streak >= 20) ids.push('hard_streak_20');
  if (survival) {
    if (wave >= 5) ids.push('wave_5');
    if (wave >= 10) ids.push('wave_10');
    if (wave >= 20) ids.push('wave_20');
    if (wave >= 30) ids.push('wave_30');
  }
  return ids;
};

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
  const [bannerInset, setBannerInset] = useState(0);

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
    hapticsEnabled: true,
    musicEnabled: true,
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
  const sudokuInputLockRef = useRef(false);
  const sudokuMistakesRef = useRef(0);

  // Survival Mode State
  const [currentWave, setCurrentWave] = useState(1);
  const [isWaveTransition, setIsWaveTransition] = useState(false);

  // Challenge Mode State
  const rngRef = useRef<() => number>(Math.random);
  const screenRef = useRef<ScreenState>('splash');
  const playerRef = useRef<PlayerState>(player);
  const [activeChallengeCode, setActiveChallengeCode] = useState<string | null>(null);
  const [activeMapRun, setActiveMapRun] = useState<{ mode: PrimaryMode; level: number } | null>(null);

  // Feedback UI State
  const [feedback, setFeedback] = useState('');
  const feedbackRef = useRef<string>('');
  const [shake, setShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<'timeFreeze' | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const lastRewardProcessedRef = useRef<string | null>(null);
  const saveReadFailedRef = useRef(false);
  const latestSaveRef = useRef<{ player: PlayerState; dailyStreak: number } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const saveErrorReportedRef = useRef(false);

  // Pause & Ad State
  const [isPaused, setIsPaused] = useState(false);
  const [powerUpAdTarget, setPowerUpAdTarget] = useState<'hint' | 'timeFreeze' | null>(null);
  const [lossContinueOpen, setLossContinueOpen] = useState(false);
  const [hasUsedRewardContinue, setHasUsedRewardContinue] = useState(false);
  const [completionOutcome, setCompletionOutcome] = useState<'won' | 'lost'>('won');
  const modalStateRef = useRef({ daily: false, paused: false, powerUp: false, continue: false });
  const [isAnswerResolving, setIsAnswerResolving] = useState(false);
  const gameSessionRef = useRef(0);
  const gameTimeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const answerLockedRef = useRef(false);
  const hintedQuestionRef = useRef<number | null>(null);
  const questionVersionRef = useRef(0);
  const runHadMistakeRef = useRef(false);
  const sudokuLockedCellsRef = useRef(new Set<string>());
  const freezeActiveRef = useRef(false);

  const clearGameTimeouts = () => {
    gameTimeoutsRef.current.forEach(handle => clearTimeout(handle));
    gameTimeoutsRef.current.clear();
  };

  const invalidateGameSession = () => {
    gameSessionRef.current += 1;
    clearGameTimeouts();
    answerLockedRef.current = true;
    sudokuInputLockRef.current = true;
    freezeActiveRef.current = false;
    setIsAnswerResolving(true);
  };

  const beginGameSession = () => {
    clearGameTimeouts();
    gameSessionRef.current += 1;
    answerLockedRef.current = false;
    sudokuInputLockRef.current = false;
    hintedQuestionRef.current = null;
    questionVersionRef.current = 0;
    runHadMistakeRef.current = false;
    sudokuLockedCellsRef.current.clear();
    freezeActiveRef.current = false;
    sudokuMistakesRef.current = 0;
    setIsAnswerResolving(false);
    return gameSessionRef.current;
  };

  const scheduleGameTask = (callback: () => void, delay: number, sessionId = gameSessionRef.current) => {
    const handle = setTimeout(() => {
      gameTimeoutsRef.current.delete(handle);
      if (sessionId === gameSessionRef.current) callback();
    }, delay);
    gameTimeoutsRef.current.add(handle);
    return handle;
  };

  const setReadyQuestion = (nextQuestion: Question) => {
    questionVersionRef.current += 1;
    hintedQuestionRef.current = null;
    answerLockedRef.current = false;
    setIsAnswerResolving(false);
    setQuestion(nextQuestion);
  };

  useEffect(() => () => clearGameTimeouts(), []);

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

      try {
        const [codeResult, saveResult] = await Promise.allSettled([
          storageService.getFriendCode(() => 'QUEST' + Math.floor(Math.random() * 9000 + 1000)),
          storageService.loadDataResult()
        ]);
        const persistedCode = codeResult.status === 'fulfilled'
          ? codeResult.value
          : 'QUEST' + Math.floor(Math.random() * 9000 + 1000);
        const loadResult = saveResult.status === 'fulfilled' ? saveResult.value : { data: null, failed: true };
        saveReadFailedRef.current = loadResult.failed;
        setFriendCode(persistedCode);

        const today = new Date().toDateString();
        const now = Date.now();
        const saved = loadResult.data;
        const p = normalizePlayerState(saved?.player);
        p.modeProgress = getInitialModeProgress(p);
        if (p.lastChallengeDate !== today) {
          p.dailyChallenges = generateDailyChallenges();
          p.lastChallengeDate = today;
        }
        Object.values(p.pets ?? {}).forEach(pet => {
          const hoursPassed = Math.max(0, (now - pet.lastInteractionTime) / (1000 * 60 * 60));
          if (hoursPassed >= 1) {
            const decay = Math.floor(hoursPassed * 5);
            pet.happiness = Math.max(0, pet.happiness - decay);
            pet.hunger = Math.min(100, pet.hunger + decay);
            pet.lastInteractionTime = now;
          }
        });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const nextStreak = p.lastRewardDate === today
          ? Math.max(1, saved?.dailyStreak ?? 1)
          : p.lastRewardDate === yesterday.toDateString()
            ? Math.max(1, saved?.dailyStreak ?? 1) + 1
            : 1;
        if (p.lastRewardDate !== today) {
          const bonus = nextStreak * 10;
          p.coins += bonus;
          p.lastRewardDate = today;
          lastRewardProcessedRef.current = today;
          setDailyRewardInfo({ streak: nextStreak, bonus });
        }

        setPlayer(p);
        setDailyStreak(nextStreak);
        if (p.name.trim()) setScreen('dashboard');
      } catch (error) {
        console.error('Startup data migration failed; using in-memory defaults', error);
        saveReadFailedRef.current = true;
        setPlayer(previous => ({ ...previous, dailyChallenges: generateDailyChallenges(), lastChallengeDate: new Date().toDateString() }));
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, []);

  // Auto-pause on background
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsDocumentVisible(isVisible);

      if (!isVisible) {
        music.stop();
        if (screen === 'game') setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screen]);

  // Save data in a short, ordered queue. This avoids native Preferences write
  // races while preserving the most recent in-memory snapshot.
  useEffect(() => {
    if (!isLoaded || saveReadFailedRef.current) return;
    latestSaveRef.current = { player, dailyStreak };
    if (saveTimerRef.current) return;
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      const flush = async () => {
        if (saveInFlightRef.current) {
          saveQueuedRef.current = true;
          return;
        }
        saveInFlightRef.current = true;
        do {
          saveQueuedRef.current = false;
          const snapshot = latestSaveRef.current;
          if (!snapshot) continue;
          const ok = await storageService.saveData(snapshot.player, snapshot.dailyStreak);
          if (!ok && !saveErrorReportedRef.current) {
            saveErrorReportedRef.current = true;
            nativeService.ui.showToast('Progress could not be saved. Your current session is still safe.');
          }
          if (ok) saveErrorReportedRef.current = false;
        } while (saveQueuedRef.current);
        saveInFlightRef.current = false;
      };
      void flush();
    }, 250);
  }, [player, dailyStreak, isLoaded]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  // Keep device feedback preferences in sync with the saved player settings.
  useEffect(() => {
    nativeService.haptics.setEnabled(player.hapticsEnabled !== false);
    music.setEnabled(player.musicEnabled !== false);
  }, [player.hapticsEnabled, player.musicEnabled]);

  // Handle Music
  useEffect(() => {
    if (!isDocumentVisible) {
      music.stop();
    } else if (player.musicEnabled !== false && screen === 'dashboard') {
      music.startMenuMusic();
    } else if (player.musicEnabled !== false && screen === 'game' && !isWaveTransition && !isPaused && !powerUpAdTarget && !lossContinueOpen) {
      music.startGameMusic(difficulty);
    } else {
      music.stop();
    }
    return () => music.stop();
  }, [screen, difficulty, isWaveTransition, isPaused, powerUpAdTarget, lossContinueOpen, isDocumentVisible, player.musicEnabled]);

  // Keep native banners out of active play and full-screen reward/completion flows.
  useEffect(() => {
    const shouldShowBanner = isLoaded
      && isDocumentVisible
      && BANNER_SCREENS.includes(screen)
      && !isPaused
      && !powerUpAdTarget
      && !lossContinueOpen;

    void adMobService.setBannerVisible(shouldShowBanner);
  }, [screen, isLoaded, isDocumentVisible, isPaused, powerUpAdTarget, lossContinueOpen]);

  useEffect(() => {
    const unsubscribe = adMobService.onBannerSizeChange(setBannerInset);
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--native-banner-inset', `${bannerInset}px`);
    return () => { document.documentElement.style.removeProperty('--native-banner-inset'); };
  }, [bannerInset]);

  // Handle Android Back Button
  // Keep screenRef in sync with screen state
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    modalStateRef.current = {
      daily: dailyRewardInfo !== null,
      paused: isPaused,
      powerUp: powerUpAdTarget !== null,
      continue: lossContinueOpen
    };
  }, [dailyRewardInfo, isPaused, powerUpAdTarget, lossContinueOpen]);

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
          const dismissEvent = new Event(BACK_DISMISS_EVENT, { cancelable: true });
          window.dispatchEvent(dismissEvent);
          if (dismissEvent.defaultPrevented) return;

          const modal = modalStateRef.current;
          if (modal.daily) {
            setDailyRewardInfo(null);
          } else if (modal.powerUp) {
            setPowerUpAdTarget(null);
          } else if (modal.continue) {
            setLossContinueOpen(false);
            setIsPaused(true);
          } else if (modal.paused) {
            setIsPaused(false);
          } else if (screenRef.current === 'game') {
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

  const openSettingsFromNavigation = () => {
    setSettingsOpenRequest(1);
    navigate('dashboard');
  };

  const calculateSurvivalTime = (wave: number) => {
    return Math.max(3, 10 - Math.floor((wave - 1) * 0.5));
  };

  const getRunConfig = (
    mode: GameMode,
    tier: ModeDifficulty,
    wave: number,
    survival: boolean,
    routeLevel = activeMapRun?.level
  ) => {
    const config = survival ? getSurvivalConfig(mode, tier, wave) : getModeConfig(mode, tier);
    if (!survival && routeLevel !== undefined && routeLevel >= 36 && config.time !== null) {
      return {
        ...config,
        time: Math.max(5, config.time - 2),
        description: `Galaxy Level ${routeLevel}: ${config.description}`
      };
    }
    return config;
  };

  const startMode = (
    requestedMode: GameMode,
    tier: ModeDifficulty,
    selectedSudokuSize: SudokuSize = 4,
    challengeCode?: string,
    requestedSurvival = requestedMode === 'survival',
    mapLevel?: number
  ) => {
    playSound.click();
    beginGameSession();
    const mode = requestedMode === 'survival' ? 'quick-calc' : requestedMode;
    const survival = requestedSurvival || requestedMode === 'survival';
    setActiveMapRun(mapLevel === undefined ? null : { mode, level: clampMapLevel(mapLevel) });
    const routeLevel = mapLevel === undefined ? undefined : clampMapLevel(mapLevel);
    const effectiveTier = routeLevel === undefined ? tier : getGalaxyMapDifficulty(routeLevel);
    setGameMode(mode);
    setIsSurvivalMode(survival);
    setModeDifficulty(effectiveTier);
    setDifficulty(survival ? 'survival' : modeDifficultyToLegacyDifficulty(effectiveTier));

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
    sudokuInputLockRef.current = false;

    const settings = getRunConfig(mode, effectiveTier, 1, survival, routeLevel);
    setCurrentLives(settings.lives);

    if (mode === 'mini-sudoku') {
      const puzzle = generateSudokuPuzzle(selectedSudokuSize, effectiveTier, rngRef.current, 1, survival, routeLevel);
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
      setReadyQuestion(generateModeQuestion(mode, effectiveTier, rngRef.current, 1, survival, routeLevel));
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

  useEffect(() => {
    if (!dailyRewardInfo) return;
    if (dailyRewardInfo.streak >= 3) unlockAchievement('daily_streak_3');
    if (dailyRewardInfo.streak >= 7) unlockAchievement('daily_streak_7');
  }, [dailyRewardInfo, unlockAchievement]);

  const handleGameCompletion = useCallback(async (completedScore = score, completedStreak = streak, outcome: 'won' | 'lost' = 'won') => {
    if (screenRef.current !== 'game') return;
    invalidateGameSession();
    setCompletionOutcome(outcome);
    const routeMode: PrimaryMode | null = activeMapRun && !isSurvivalMode && outcome === 'won' && isPrimaryMode(gameMode) && activeMapRun.mode === gameMode
      ? gameMode
      : null;

    setPlayer(prev => {
      const previousStats = prev.modeStats?.[gameMode] ?? { bestScore: 0, bestStreak: 0, gamesPlayed: 0 };
      const currentRouteLevel = routeMode ? clampMapLevel(prev.modeProgress?.[routeMode]) : null;
      const shouldAdvanceMap = routeMode !== null && activeMapRun?.level === currentRouteLevel;
      const nextModeProgress = shouldAdvanceMap
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
        ...(shouldAdvanceMap ? { modeProgress: nextModeProgress } : {})
      };
    });

    if (outcome === 'won' && !player.achievements.includes('first_win')) {
      unlockAchievement('first_win');
    }

    setScreen('complete');
  }, [player.achievements, unlockAchievement, gameMode, score, streak, isSurvivalMode, activeMapRun]);

  const handleDoubleCoins = async (): Promise<boolean> => {
    if (completionOutcome !== 'won') return false;
    const sessionId = gameSessionRef.current;
    playSound.click();
    const success = await adMobService.showRewardVideo('double-coins');
    if (success && sessionId === gameSessionRef.current && screenRef.current === 'complete') {
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
    const sessionId = gameSessionRef.current;

    playSound.click();
    const rewarded = await adMobService.showRewardVideo('continue');
    if (!rewarded || sessionId !== gameSessionRef.current || screenRef.current !== 'game') return false;

    const settings = getRunConfig(gameMode, modeDifficulty, currentWave, isSurvivalMode);
    setHasUsedRewardContinue(true);
    setLossContinueOpen(false);
    setCurrentLives(1);
    if (gameMode === 'mini-sudoku') {
      setSudokuMistakes(0);
      sudokuMistakesRef.current = 0;
      setSudokuSelectedCell(null);
      sudokuInputLockRef.current = false;
      setFeedback('');
    } else {
      setReadyQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, currentWave, isSurvivalMode, activeMapRun?.level));
      setFeedback('');
      setTimer(settings.time);
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

  const handleWatchAdForCoins = async (): Promise<boolean> => {
    playSound.click();
    const success = await adMobService.showRewardVideo('coins');
    if (success) {
      setPlayer(prev => ({ ...prev, coins: prev.coins + 500 }));
      playSound.levelUp();
      nativeService.haptics.notificationSuccess();
    }
    return success;
  };

  const checkAnswer = useCallback((answerStr: string) => {
    if (screenRef.current !== 'game' || !question || answerLockedRef.current) return;
    const sessionId = gameSessionRef.current;
    answerLockedRef.current = true;
    setIsAnswerResolving(true);

    const submittedValue = Number(answerStr);
    const correct = question.choices
      ? submittedValue === question.answer
      : Math.abs(submittedValue - question.answer) < 0.0001;
    const settings = getRunConfig(gameMode, modeDifficulty, currentWave, isSurvivalMode);

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
      achievementsToUnlock.push(...getSharedAchievementIds({
        level: newLevel,
        coins: newCoins,
        totalScore: newTotalScore,
        score: newScore,
        streak: newStreak,
        difficulty: modeDifficulty,
        survival: isSurvivalMode,
        wave: currentWave
      }));

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

          scheduleGameTask(() => {
            setIsWaveTransition(false);
            setReadyQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, nextWave, true, activeMapRun?.level));
            setFeedback('');
            setActivePowerUp(null);
            setTimer(getRunConfig(gameMode, modeDifficulty, nextWave, true).time);
          }, 3000, sessionId);

          setFeedback(`${['Awesome!', 'Perfect!', 'Amazing!'][Math.floor(Math.random() * 3)]} +${points}`);
          setShowConfetti(true);
          scheduleGameTask(() => setShowConfetti(false), 2000, sessionId);

          // Process achievements before returning
          if (achievementsToUnlock.length > 0) {
            achievementsToUnlock.forEach(id => unlockAchievement(id));
          }
          return;
        }
      } else {
        if (nextQ === settings.questions && !runHadMistakeRef.current) {
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
      scheduleGameTask(() => setShowConfetti(false), 2000, sessionId);

      if (isGameComplete) {
        handleGameCompletion(newScore, newStreak);
      } else {
        // Capture currentWave in a local variable so the timeout closure doesn't use stale state
        const waveForNextQ = currentWave;
        scheduleGameTask(() => {
          setReadyQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, waveForNextQ, isSurvivalMode, activeMapRun?.level));
          setFeedback('');
          setActivePowerUp(null);
          if (isSurvivalMode) {
            setTimer(getRunConfig(gameMode, modeDifficulty, waveForNextQ, true).time);
          } else if (settings.time) {
            setTimer(settings.time);
          }
        }, 1500, sessionId);
      }
    } else {
      playSound.wrong();
      nativeService.haptics.notificationError();
      setStreak(0);
      setCombo(0);
      runHadMistakeRef.current = true;
      setFeedback(`Oops! Answer: ${question.answer}`);
      setShake(true);
      scheduleGameTask(() => setShake(false), 500, sessionId);

      // Lives Logic
      let isGameOver = false;
      if (currentLives !== null) {
        const newLives = currentLives - 1;
        setCurrentLives(newLives);
        if (newLives <= 0) {
          isGameOver = true;
        }
      }

      scheduleGameTask(() => {
        if (isGameOver) {
          if (hasUsedRewardContinue) {
            handleGameCompletion(score, 0, 'lost');
          } else {
            setLossContinueOpen(true);
          }
        } else {
          setReadyQuestion(generateModeQuestion(gameMode, modeDifficulty, rngRef.current, currentWave, isSurvivalMode, activeMapRun?.level));
          setFeedback('');
          if (isSurvivalMode) {
            setTimer(getRunConfig(gameMode, modeDifficulty, currentWave, true).time);
          } else if (settings.time) {
            setTimer(settings.time);
          }
        }
      }, isGameOver ? 1500 : 2000, sessionId);
    }
  }, [question, difficulty, gameMode, modeDifficulty, score, streak, combo, questionsAnswered, timer, handleGameCompletion, currentWave, currentLives, unlockAchievement, isSurvivalMode, hasUsedRewardContinue, activeMapRun]);

  const handleSudokuSelectCell = (row: number, column: number) => {
    if (!sudokuBoard || !sudokuGiven || sudokuCompleteRef.current || sudokuInputLockRef.current || sudokuGiven[row]?.[column] || sudokuBoard[row]?.[column] !== 0) return;
    playSound.click();
    setSudokuSelectedCell({ row, column });
    setFeedback('');
  };

  const handleSudokuInput = (value: number) => {
    if (screenRef.current !== 'game' || !sudokuBoard || !sudokuSolution || !sudokuGiven || !sudokuSelectedCell || sudokuCompleteRef.current) return;
    if (sudokuInputLockRef.current) return;
    const sessionId = gameSessionRef.current;

    const { row, column } = sudokuSelectedCell;
    if (sudokuGiven[row]?.[column] || sudokuBoard[row]?.[column] !== 0) return;

    sudokuInputLockRef.current = true;

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
      setSudokuSelectedCell(null);
      setProgress((filledCells / totalCells) * 100);
      setFeedback(filledCells === totalCells ? 'Sector cleared!' : 'Correct cell locked in.');

      if (filledCells === totalCells) {
        sudokuCompleteRef.current = true;
        const settings = getRunConfig('mini-sudoku', modeDifficulty, currentWave, isSurvivalMode);
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
        const sharedAchievementIds = getSharedAchievementIds({
          level: nextLevel,
          coins: player.coins + earnedCoins,
          totalScore: player.totalScore + points,
          score: nextScore,
          streak: nextStreak,
          difficulty: modeDifficulty,
          survival: isSurvivalMode,
          wave: nextWave
        });

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
        sharedAchievementIds.forEach(id => unlockAchievement(id));

        setShowConfetti(true);
        scheduleGameTask(() => setShowConfetti(false), 2000, sessionId);
        if (isSurvivalMode) {
          setCurrentWave(nextWave);
          setIsWaveTransition(true);
          music.stop();
          nativeService.haptics.notificationSuccess();
          setProgress(0);
          setSudokuMistakes(0);
          sudokuMistakesRef.current = 0;
          setSudokuSelectedCell(null);
          setFeedback(`Sector cleared! +${points}`);
          scheduleGameTask(() => {
            const nextPuzzle = generateSudokuPuzzle(sudokuSize, modeDifficulty, rngRef.current, nextWave, true, activeMapRun?.level);
            setSudokuBoard(nextPuzzle.puzzle);
            setSudokuSolution(nextPuzzle.solution);
            setSudokuGiven(nextPuzzle.given);
            sudokuMistakesRef.current = 0;
            sudokuCompleteRef.current = false;
            sudokuInputLockRef.current = false;
            setIsWaveTransition(false);
            setFeedback('');
          }, 3000, sessionId);
        } else {
          scheduleGameTask(() => handleGameCompletion(points, nextStreak, 'won'), 900, sessionId);
        }
      }
    } else {
      playSound.wrong();
      nativeService.haptics.notificationError();
      setStreak(0);
      setCombo(0);
      const nextMistakes = sudokuMistakesRef.current + 1;
      sudokuMistakesRef.current = nextMistakes;
      const terminalMistake = isSurvivalMode && nextMistakes >= getSurvivalSudokuMistakeLimit(currentWave);
      sudokuInputLockRef.current = terminalMistake;
      setSudokuMistakes(nextMistakes);
      if (terminalMistake) {
        scheduleGameTask(() => {
          if (hasUsedRewardContinue) {
            handleGameCompletion(score, 0, 'lost');
          } else {
            setLossContinueOpen(true);
          }
        }, 500, sessionId);
      }
      setFeedback('Try another number.');
      setShake(true);
      scheduleGameTask(() => setShake(false), 500, sessionId);
    }
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
    if (screenRef.current !== 'game' || !question || answerLockedRef.current || player.powerUps[type] <= 0) return;
    if (type === 'hint' && hintedQuestionRef.current === questionVersionRef.current) return;
    if (type === 'timeFreeze' && freezeActiveRef.current) return;

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
      hintedQuestionRef.current = questionVersionRef.current;
      setFeedback(`Hint: The answer is ${question.correctLabel ?? question.answer}`);
    } else if (type === 'timeFreeze') {
      const sessionId = gameSessionRef.current;
      freezeActiveRef.current = true;
      setActivePowerUp('timeFreeze');
      scheduleGameTask(() => {
        freezeActiveRef.current = false;
        setActivePowerUp(null);
      }, 10000, sessionId);
    }
  };

  const handleRequestMorePowerUps = (type: 'hint' | 'timeFreeze') => {
    playSound.click();
    setPowerUpAdTarget(type);
  };

  const handleWatchPowerUpAd = async (): Promise<boolean> => {
    if (!powerUpAdTarget) return false;

    const requestedPowerUp = powerUpAdTarget;
    const sessionId = gameSessionRef.current;
    const success = await adMobService.showRewardVideo('power-up');
    if (success && sessionId === gameSessionRef.current && screenRef.current === 'game') {
      setPlayer(prev => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [requestedPowerUp]: prev.powerUps[requestedPowerUp] + 3
        }
      }));
      nativeService.haptics.notificationSuccess();
      playSound.powerUp();
      setPowerUpAdTarget(null);
    }
    return success;
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

  const handleShareMission = async () => {
    playSound.click();
    const result = completionOutcome === 'won' ? 'cleared' : 'finished';
    let text = `🚀 I ${result} a ${GAME_MODE_DEFINITIONS[gameMode].name} mission in Math Quest with ${score} points!`;
    if (activeChallengeCode) text += `\nChallenge Code: ${activeChallengeCode}`;
    text += '\n#MathQuest';
    const shared = await nativeService.share('Math Quest mission score', text);
    if (!shared) {
      await nativeService.copyToClipboard(text);
      await nativeService.ui.showToast('Mission score copied to clipboard!');
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

  const handleToggleHaptics = () => {
    setPlayer(prev => ({ ...prev, hapticsEnabled: !(prev.hapticsEnabled ?? true) }));
  };

  const handleToggleMusic = () => {
    setPlayer(prev => ({ ...prev, musicEnabled: !(prev.musicEnabled ?? true) }));
  };

  const handleQuitGame = () => {
    playSound.click();
    invalidateGameSession();
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-6 text-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin-slow">🚀</div>
        <p className="text-base font-black uppercase tracking-[0.18em] text-white">Preparing your mission</p>
        <p className="mt-2 text-xs font-bold text-cyan-100/65">Loading your cockpit…</p>
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
          settingsOpenRequest={settingsOpenRequest}
          onSettingsRequestConsumed={() => setSettingsOpenRequest(0)}
          onToggleHaptics={handleToggleHaptics}
          onToggleMusic={handleToggleMusic}
          onShare={handleShare}
          onJoinChallenge={handleJoinChallenge}
          onClaimChallenge={handleClaimChallenge}
        />
      )}

      {screen === 'map' && (
        <MapScreen
          player={player}
          onStartMode={(mode, tier, selectedSize, survival, routeLevel) => startMode(mode, tier, selectedSize, undefined, survival, routeLevel)}
          onClose={() => navigate('dashboard')}
          onNavigate={(s) => navigate(s)}
          onOpenSettings={openSettingsFromNavigation}
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
          onNavigate={(s) => navigate(s)}
          onOpenSettings={openSettingsFromNavigation}
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
          sessionConfig={getRunConfig(gameMode, modeDifficulty, currentWave, isSurvivalMode)}
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
          isAnswerResolving={isAnswerResolving}
          showAnimations={player.showAnimations ?? true}
        />
      )}

      {screen === 'complete' && (
        <CompletionScreen
          score={score}
          modeName={`${GAME_MODE_DEFINITIONS[gameMode].name}${isSurvivalMode ? ' Survival' : ''}`}
          modeDifficulty={modeDifficulty}
          sessionConfig={getRunConfig(gameMode, modeDifficulty, currentWave, isSurvivalMode)}
          gameCoins={gameCoins}
          gameXp={gameXp}
          didWin={completionOutcome === 'won'}
          onPlayAgain={async () => {
            if (completionOutcome === 'won') await adMobService.showInterstitial();
            startMode(gameMode, modeDifficulty, sudokuSize, activeChallengeCode || undefined, isSurvivalMode, activeMapRun?.level);
          }}
          onDashboard={async () => {
            if (completionOutcome === 'won') await adMobService.showInterstitial();
            navigate('dashboard');
          }}
          onShare={handleShareMission}
          onDoubleCoins={handleDoubleCoins}
        />
      )}

      {screen === 'achievements' && (
        <Achievements
          unlockedAchievements={player.achievements}
          achievementsList={ACHIEVEMENTS_LIST}
          onClose={() => navigate('dashboard')}
          onNavigate={(s) => navigate(s)}
          onOpenSettings={openSettingsFromNavigation}
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
          onNavigate={(s) => navigate(s)}
          onOpenSettings={openSettingsFromNavigation}
        />
      )}
    </>
  );
};

export default App;
