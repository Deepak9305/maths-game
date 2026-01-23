import React, { useState, useEffect, useCallback, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import GameScreen from './components/GameScreen';
import CompletionScreen from './components/CompletionScreen';
import Leaderboard from './components/Leaderboard';
import Achievements from './components/Achievements';
import Shop from './components/Shop';
import DailyRewardModal from './components/DailyRewardModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import PauseModal from './components/PauseModal';
import PowerUpAdModal from './components/PowerUpAdModal';
import { PlayerState, ScreenState, Difficulty, Question, RocketItem, AchievementItem } from './types';
import { generateQuestion, DIFFICULTY_SETTINGS, createSeededRandom, generateDailyChallenges } from './services/mathService';
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
  { id: 'first_win', name: 'First Victory', icon: '🎯', reward: 50 },
  { id: 'streak_10', name: 'Streak Master', icon: '🔥', reward: 200 },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', reward: 100 },
  { id: 'perfect_game', name: 'Perfect Game', icon: '💯', reward: 150 },
  { id: 'level_5', name: 'High Flyer', icon: '🦅', reward: 300 },
  { id: 'coin_1000', name: 'Treasure Hunter', icon: '💎', reward: 250 },
  { id: 'score_5000', name: 'Brainiac', icon: '🧠', reward: 400 },
  { id: 'combo_10', name: 'Combo King', icon: '👑', reward: 150 },
  { id: 'wave_20', name: 'Survivor', icon: '🛡️', reward: 500 },

  // --- NEW (20 Added) ---
  
  // Progression
  { id: 'level_10', name: 'Commander', icon: '👨‍✈️', reward: 500 },
  { id: 'level_20', name: 'Admiral', icon: '🎖️', reward: 1000 },
  { id: 'level_50', name: 'Galactic Emperor', icon: '👑', reward: 5000 },
  
  // Lifetime Score
  { id: 'total_score_10k', name: 'Math Whiz', icon: '🎓', reward: 1000 },
  { id: 'total_score_50k', name: 'Calculus King', icon: '📐', reward: 2500 },
  { id: 'total_score_100k', name: 'Omniscient', icon: '👁️', reward: 5000 },

  // Economy
  { id: 'hoarder_coins', name: 'Banker', icon: '🏦', reward: 500 }, // 2000 coins
  { id: 'wealthy_coins', name: 'Tycoon', icon: '💰', reward: 1000 }, // 5000 coins
  { id: 'rocket_collector', name: 'Fleet Admiral', icon: '🚀', reward: 2000 }, // Own all rockets

  // Skill & Streaks
  { id: 'streak_25', name: 'On Fire', icon: '🚒', reward: 500 },
  { id: 'streak_50', name: 'Unstoppable', icon: '🛑', reward: 1000 },
  { id: 'streak_100', name: 'Math God', icon: '😇', reward: 2500 },
  { id: 'combo_20', name: 'Flow State', icon: '🌊', reward: 500 },
  { id: 'score_game_5000', name: 'Epic Run', icon: '🏃', reward: 1000 }, // Single Game Score

  // Modes
  { id: 'wave_5', name: 'Survivor I', icon: '🌵', reward: 200 },
  { id: 'wave_10', name: 'Survivor II', icon: '🌴', reward: 500 },
  { id: 'wave_30', name: 'Void Walker', icon: '👻', reward: 2000 },
  { id: 'hard_streak_20', name: 'Hardcore', icon: '💀', reward: 1000 },

  // Daily Habits
  { id: 'daily_streak_3', name: 'Consistent', icon: '📅', reward: 100 },
  { id: 'daily_streak_7', name: 'Dedicated', icon: '📆', reward: 500 }
];

const QUESTIONS_PER_WAVE = 5;

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastScreen, setLastScreen] = useState<ScreenState>('splash'); 
  
  // Game Configuration State
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [friendCode] = useState('QUEST' + Math.floor(Math.random() * 9000 + 1000));
  
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
    lastChallengeDate: null
  });
  const [dailyStreak, setDailyStreak] = useState(1);
  const [dailyRewardInfo, setDailyRewardInfo] = useState<{ streak: number; bonus: number } | null>(null);

  // Active Game Session State
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentLives, setCurrentLives] = useState<number | null>(null);
  
  // Survival Mode State
  const [currentWave, setCurrentWave] = useState(1);
  const [isWaveTransition, setIsWaveTransition] = useState(false);
  
  // Challenge Mode State
  const rngRef = useRef<() => number>(Math.random);
  const [activeChallengeCode, setActiveChallengeCode] = useState<string | null>(null);
  
  // Feedback UI State
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<'timeFreeze' | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  
  // Pause & Ad State
  const [isPaused, setIsPaused] = useState(false);
  const [powerUpAdTarget, setPowerUpAdTarget] = useState<'hint' | 'timeFreeze' | null>(null);

  // --- Effects ---

  // Initialization
  useEffect(() => {
    const init = async () => {
      await nativeService.initialize();
      await adMobService.initialize();

      const savedData = await storageService.loadData();
      if (savedData) {
        const p = savedData.player;
        if (!p.ownedRockets) p.ownedRockets = ['🚀'];
        if (p.lastRewardDate === undefined) p.lastRewardDate = null;
        if (!p.dailyChallenges) p.dailyChallenges = [];
        
        // Check if we need to generate new challenges
        const today = new Date().toDateString();
        if (p.lastChallengeDate !== today) {
           p.dailyChallenges = generateDailyChallenges();
           p.lastChallengeDate = today;
        }

        setPlayer(p);
        setDailyStreak(savedData.dailyStreak);
      } else {
        // First launch, generate challenges
        setPlayer(prev => ({
           ...prev,
           dailyChallenges: generateDailyChallenges(),
           lastChallengeDate: new Date().toDateString()
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
      storageService.saveData(player, dailyStreak);
    }
  }, [player, dailyStreak, isLoaded]);

  // Handle Music
  useEffect(() => {
    if (screen === 'game' && !isWaveTransition && !isPaused && !powerUpAdTarget) {
      music.startGameMusic(difficulty);
    } else {
      music.stop();
    }
    return () => music.stop();
  }, [screen, difficulty, isWaveTransition, isPaused, powerUpAdTarget]);

  // Handle Android Back Button
  useEffect(() => {
    let listener: any;
    
    const setupBackButton = async () => {
      try {
        listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (screen === 'game') {
            setIsPaused(true);
          } else if (screen === 'dashboard' || screen === 'splash') {
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
  }, [screen]);

  // --- Handlers ---

  const navigate = (newScreen: ScreenState) => {
    playSound.click();
    nativeService.haptics.impactLight();
    if (newScreen !== 'privacy') {
        setLastScreen(screen);
    }
    setScreen(newScreen);
  };

  const handlePrivacyNav = () => {
    playSound.click();
    setLastScreen(screen);
    setScreen('privacy');
  };

  const calculateSurvivalTime = (wave: number) => {
    return Math.max(3, 10 - Math.floor((wave - 1) * 0.5));
  };

  const startGame = (diff: Difficulty, challengeCode?: string) => {
    playSound.click();
    setDifficulty(diff);
    
    // Initialize RNG
    if (challengeCode) {
      rngRef.current = createSeededRandom(challengeCode);
      setActiveChallengeCode(challengeCode);
    } else {
      rngRef.current = Math.random;
      setActiveChallengeCode(null);
    }

    setScore(0);
    setStreak(0);
    setCombo(0);
    setProgress(0);
    setQuestionsAnswered(0);
    
    // Survival Setup
    setCurrentWave(1);
    setIsWaveTransition(false);
    setIsPaused(false);
    setPowerUpAdTarget(null);
    
    const settings = DIFFICULTY_SETTINGS[diff];
    setCurrentLives(settings.lives);

    setQuestion(generateQuestion(diff, rngRef.current, 1));
    setFeedback('');
    setShowConfetti(false);
    setActivePowerUp(null);
    setScreen('game');
    
    if (diff === 'survival') {
       setTimer(calculateSurvivalTime(1));
    } else if (settings.time) {
       setTimer(settings.time);
    } else {
       setTimer(null);
    }
  };

  const handleJoinChallenge = (code: string) => {
    startGame('medium', code);
  };

  const handleGameCompletion = useCallback(async () => {
     if (!player.achievements.includes('first_win')) {
        unlockAchievement('first_win');
     }

     const today = new Date().toDateString();
     
     if (player.lastRewardDate !== today) {
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
        setPlayer(prev => ({
           ...prev,
           coins: prev.coins + bonusCoins,
           lastRewardDate: today
        }));

        // Check Daily Streak Achievements
        if (newStreak >= 3) unlockAchievement('daily_streak_3');
        if (newStreak >= 7) unlockAchievement('daily_streak_7');

        setTimeout(() => {
           playSound.levelUp();
           nativeService.haptics.notificationSuccess();
           setDailyRewardInfo({ streak: newStreak, bonus: bonusCoins });
        }, 800);
     }

     try {
       await adMobService.showInterstitial();
     } catch (e) {
       console.log("Ad skipped or failed");
     }

     setScreen('complete');
  }, [player.achievements, player.lastRewardDate, dailyStreak]); 

  const unlockAchievement = (id: string) => {
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
  };

  const handleWatchAdForCoins = async () => {
    playSound.click();
    const success = await adMobService.showRewardVideo();
    if (success) {
      setPlayer(prev => ({ ...prev, coins: prev.coins + 50 }));
      playSound.levelUp();
      nativeService.haptics.notificationSuccess();
    }
  };

  const checkAnswer = useCallback((answerStr: string) => {
    if (!question) return;

    const correct = parseFloat(answerStr) === question.answer;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    if (correct) {
      playSound.correct();
      nativeService.haptics.impactMedium();
      
      const streakMult = difficulty === 'hard' ? Math.floor(streak / 3) + 1 : 1;
      const comboBonus = combo >= 5 ? 2 : 1;
      let points = 10 * streakMult * comboBonus;
      
      if (difficulty === 'survival') {
        points = Math.floor(points * (1 + (currentWave * 0.2)));
      }

      let earnedCoins = Math.floor(points / 10);
      let earnedXP = points * settings.xp;

      if (player.equippedRocket === '⭐') {
         earnedXP = Math.floor(earnedXP * 1.5);
      } else if (player.equippedRocket === '🛸') {
         earnedCoins = earnedCoins * 2;
      }

      const newScore = score + points;
      const newStreak = streak + 1;
      const newCombo = combo + 1;
      
      let newXp = player.xp + earnedXP;
      let newLevel = player.level;
      let leveledUp = false;
      if (newXp >= newLevel * 100) {
        newXp -= (newLevel * 100);
        newLevel++;
        leveledUp = true;
      }
      
      const newCoins = player.coins + earnedCoins;
      const newTotalScore = player.totalScore + points;
      
      setScore(newScore);
      setStreak(newStreak);
      setCombo(newCombo);
      
      setPlayer(prev => {
         if (leveledUp) {
            setTimeout(() => {
              playSound.levelUp();
              nativeService.haptics.notificationSuccess();
            }, 500);
         }

         // Update Daily Challenge Progress
         const updatedChallenges = prev.dailyChallenges.map(challenge => {
            if (challenge.completed) return challenge;

            let newCurrent = challenge.current;
            switch(challenge.type) {
                case 'total_score':
                    newCurrent += points;
                    break;
                case 'total_answers':
                    newCurrent += 1;
                    break;
                case 'high_streak':
                    newCurrent = Math.max(challenge.current, newStreak);
                    break;
            }

            const isNowComplete = newCurrent >= challenge.target;
            if (isNowComplete && !challenge.completed) {
                // Notify user subtly (could add visual toast later)
                setTimeout(() => playSound.levelUp(), 200);
            }

            return {
                ...challenge,
                current: newCurrent,
                completed: isNowComplete
            };
         });

         return {
           ...prev,
           coins: newCoins,
           totalScore: newTotalScore,
           level: newLevel,
           xp: newXp,
           dailyChallenges: updatedChallenges
         };
      });

      const achievementsToUnlock: string[] = [];
      
      // Existing Checks
      if (newStreak === 10) achievementsToUnlock.push('streak_10');
      if (difficulty === 'survival' && currentWave === 20) achievementsToUnlock.push('wave_20');
      if (newCombo >= 10) achievementsToUnlock.push('combo_10');
      if (newLevel >= 5) achievementsToUnlock.push('level_5');
      if (newCoins >= 1000) achievementsToUnlock.push('coin_1000');
      if (newTotalScore >= 5000) achievementsToUnlock.push('score_5000');
      if (difficulty === 'hard' && timer && timer > 5) achievementsToUnlock.push('speed_demon');

      // --- NEW ACHIEVEMENT CHECKS ---
      // Progression
      if (newLevel >= 10) achievementsToUnlock.push('level_10');
      if (newLevel >= 20) achievementsToUnlock.push('level_20');
      if (newLevel >= 50) achievementsToUnlock.push('level_50');

      // Streaks & Combos
      if (newStreak === 25) achievementsToUnlock.push('streak_25');
      if (newStreak === 50) achievementsToUnlock.push('streak_50');
      if (newStreak === 100) achievementsToUnlock.push('streak_100');
      if (newCombo === 20) achievementsToUnlock.push('combo_20');
      
      // Hard Mode
      if (difficulty === 'hard' && newStreak === 20) achievementsToUnlock.push('hard_streak_20');

      // Survival Waves
      if (difficulty === 'survival') {
          if (currentWave === 5) achievementsToUnlock.push('wave_5');
          if (currentWave === 10) achievementsToUnlock.push('wave_10');
          if (currentWave === 30) achievementsToUnlock.push('wave_30');
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
      
      if (difficulty === 'survival') {
         const questionsInWave = nextQ % QUESTIONS_PER_WAVE;
         const waveProgress = ((questionsInWave === 0 ? QUESTIONS_PER_WAVE : questionsInWave) / QUESTIONS_PER_WAVE) * 100;
         setProgress(waveProgress);
         setQuestionsAnswered(nextQ);

         if (questionsInWave === 0) {
            const nextWave = currentWave + 1;
            setIsWaveTransition(true);
            music.stop(); 
            nativeService.haptics.notificationSuccess();
            
            setTimeout(() => {
              setCurrentWave(nextWave);
              setIsWaveTransition(false);
              setQuestion(generateQuestion(difficulty, rngRef.current, nextWave));
              setFeedback('');
              setActivePowerUp(null);
              setTimer(calculateSurvivalTime(nextWave)); 
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
        handleGameCompletion();
      } else {
        setTimeout(() => {
          setQuestion(generateQuestion(difficulty, rngRef.current, currentWave));
          setFeedback('');
          setActivePowerUp(null);
          if (difficulty === 'survival') {
             setTimer(calculateSurvivalTime(currentWave));
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
             handleGameCompletion();
         } else {
            setQuestion(generateQuestion(difficulty, rngRef.current, currentWave));
            setFeedback('');
            if (difficulty === 'survival') {
                setTimer(calculateSurvivalTime(currentWave));
            } else if (settings.time) {
                setTimer(settings.time);
            }
         }
      }, isGameOver ? 1500 : 2000);
    }
  }, [question, difficulty, streak, combo, player.achievements, player.level, player.xp, player.coins, player.totalScore, questionsAnswered, timer, handleGameCompletion, player.equippedRocket, currentWave, currentLives]);

  useEffect(() => {
    // Only run timer if not paused AND not watching powerup ad
    if (timer !== null && timer > 0 && screen === 'game' && activePowerUp !== 'timeFreeze' && !isWaveTransition && !isPaused && !powerUpAdTarget) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t === null) return null;
          if (t <= 1) {
             checkAnswer('-999999'); 
             return null;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, screen, activePowerUp, checkAnswer, isWaveTransition, isPaused, powerUpAdTarget]);

  const handleUsePowerUp = (type: 'hint' | 'timeFreeze') => {
    if (player.powerUps[type] <= 0) return;
    
    playSound.powerUp();
    nativeService.haptics.impactLight();
    setPlayer(prev => ({
      ...prev,
      powerUps: { ...prev.powerUps, [type]: prev.powerUps[type] - 1 }
    }));

    if (type === 'hint' && question) {
      setFeedback(`💡 Hint: The answer is ${question.answer}`);
    } else if (type === 'timeFreeze') {
      setActivePowerUp('timeFreeze');
      setTimeout(() => setActivePowerUp(null), 10000);
    }
  };

  const handleRequestMorePowerUps = (type: 'hint' | 'timeFreeze') => {
    playSound.click();
    setPowerUpAdTarget(type);
  };

  const handleWatchPowerUpAd = async () => {
    if (!powerUpAdTarget) return;
    
    const success = await adMobService.showRewardVideo();
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
      alert('Score & Code copied to clipboard!');
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
           const newOwned = [...prev.ownedRockets, rocket.icon];
           
           // Check Rocket Collector Achievement
           if (newOwned.length === ROCKETS.length && !prev.achievements.includes('rocket_collector')) {
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
      setPlayer(prev => ({
        ...prev,
        coins: prev.coins - cost,
        powerUps: {
          ...prev.powerUps,
          [type]: prev.powerUps[type] + 1
        }
      }));
      playSound.powerUp();
      nativeService.haptics.impactMedium();
    }
  };

  const handleClaimChallenge = (id: string) => {
    setPlayer(prev => {
        const challengeIndex = prev.dailyChallenges.findIndex(c => c.id === id);
        if (challengeIndex === -1) return prev;
        
        const challenge = prev.dailyChallenges[challengeIndex];
        if (!challenge.completed || challenge.claimed) return prev;
        
        const newChallenges = [...prev.dailyChallenges];
        newChallenges[challengeIndex] = { ...challenge, claimed: true };
        
        playSound.levelUp();
        nativeService.haptics.notificationSuccess();

        return {
            ...prev,
            coins: prev.coins + challenge.reward,
            dailyChallenges: newChallenges
        };
    });
  };

  const handleResume = () => {
    playSound.click();
    setIsPaused(false);
  };

  const handleQuitGame = () => {
    playSound.click();
    setIsPaused(false);
    navigate('dashboard');
    music.stop();
  };

  if (!isLoaded) return null;

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
        />
      )}

      {powerUpAdTarget && (
        <PowerUpAdModal
            type={powerUpAdTarget}
            onWatch={handleWatchPowerUpAd}
            onClose={() => setPowerUpAdTarget(null)}
        />
      )}

      {screen === 'splash' && (
        <SplashScreen 
          playerName={player.name} 
          setPlayerName={(name) => setPlayer(p => ({ ...p, name }))}
          onStart={() => navigate('dashboard')}
          onPrivacy={handlePrivacyNav}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          player={player}
          dailyStreak={dailyStreak}
          friendCode={friendCode}
          onStartGame={startGame}
          onNavigate={(s) => {
             if(s === 'privacy') handlePrivacyNav();
             else navigate(s);
          }}
          onShare={handleShare}
          onJoinChallenge={handleJoinChallenge}
          onClaimChallenge={handleClaimChallenge}
        />
      )}

      {screen === 'game' && question && (
        <GameScreen
          question={question}
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
        />
      )}

      {screen === 'complete' && (
        <CompletionScreen
          score={score}
          difficulty={difficulty}
          onPlayAgain={() => startGame(difficulty, activeChallengeCode || undefined)}
          onDashboard={() => navigate('dashboard')}
          onShare={handleShare}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard
          playerName={player.name}
          totalScore={player.totalScore}
          level={player.level}
          onClose={() => navigate('dashboard')}
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
      
      {screen === 'privacy' && (
        <PrivacyPolicy onBack={() => setScreen(lastScreen)} />
      )}
    </>
  );
};

export default App;