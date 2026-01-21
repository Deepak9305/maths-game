import React, { useState, useEffect, useCallback, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import GameScreen from './components/GameScreen';
import CompletionScreen from './components/CompletionScreen';
import Leaderboard from './components/Leaderboard';
import Achievements from './components/Achievements';
import Shop from './components/Shop';
import DailyRewardModal from './components/DailyRewardModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import { PlayerState, ScreenState, Difficulty, Question, RocketItem, AchievementItem } from './types';
import { generateQuestion, DIFFICULTY_SETTINGS, createSeededRandom } from './services/mathService';
import { playSound, music } from './services/audioService';
import { adMobService } from './services/adMobService';

// Constants
const ROCKETS: RocketItem[] = [
  { icon: '🚀', name: 'Explorer', cost: 0, perk: 'Standard Performance' },
  { icon: '⭐', name: 'Speed Star', cost: 500, perk: '+50% XP Boost' },
  { icon: '🛸', name: 'Mega Blaster', cost: 1000, perk: '2x Coin Earnings' }
];

const ACHIEVEMENTS_LIST: AchievementItem[] = [
  { id: 'first_win', name: 'First Victory', icon: '🎯', reward: 50 },
  { id: 'streak_10', name: 'Streak Master', icon: '🔥', reward: 200 },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', reward: 100 },
  { id: 'perfect_game', name: 'Perfect Game', icon: '💯', reward: 150 },
  { id: 'level_5', name: 'High Flyer', icon: '🦅', reward: 300 },
  { id: 'coin_1000', name: 'Treasure Hunter', icon: '💎', reward: 250 },
  { id: 'score_5000', name: 'Brainiac', icon: '🧠', reward: 400 },
  { id: 'combo_10', name: 'Combo King', icon: '👑', reward: 150 }
];

const STORAGE_KEY = 'math-quest-data-v1';
const QUESTIONS_PER_WAVE = 5;
const MAX_WAVES = 10;

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastScreen, setLastScreen] = useState<ScreenState>('splash'); // Track where we came from for Privacy Policy
  
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
    lastRewardDate: null
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

  // --- Effects ---

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration support
        if (!parsed.player.ownedRockets) parsed.player.ownedRockets = ['🚀'];
        if (parsed.player.lastRewardDate === undefined) parsed.player.lastRewardDate = null;
        
        setPlayer(parsed.player);
        setDailyStreak(parsed.dailyStreak);
      } catch (e) {
        console.error("Failed to load save data");
      }
    }
    setIsLoaded(true);
    
    // Initialize Ads
    adMobService.initialize();
  }, []);

  // Save Data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        player,
        dailyStreak
      }));
    }
  }, [player, dailyStreak, isLoaded]);

  // Handle Music for Survival Mode
  useEffect(() => {
    if (screen === 'game' && difficulty === 'survival' && !isWaveTransition) {
      music.startSurvivalTheme();
    } else {
      music.stop();
    }
    return () => music.stop();
  }, [screen, difficulty, isWaveTransition]);

  // Handle Android Hardware Back Button
  useEffect(() => {
    // We check if the Capacitor global exists (it will in a native app)
    const cap = (window as any).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.App) {
      const { App } = cap.Plugins;
      
      const handleBackButton = async () => {
        // If we are on dashboard, exit app (or minimize)
        if (screen === 'dashboard' || screen === 'splash') {
           App.exitApp();
        } else {
           // Otherwise, go back to dashboard
           setScreen('dashboard');
           music.stop();
        }
      };

      const listener = App.addListener('backButton', handleBackButton);
      return () => {
        if (listener && typeof listener.remove === 'function') {
           listener.remove();
        }
      };
    }
  }, [screen]);

  // --- Handlers ---

  const navigate = (newScreen: ScreenState) => {
    playSound.click();
    // Don't update lastScreen if we are just going to privacy
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
    
    setQuestion(generateQuestion(diff, rngRef.current, 1));
    setFeedback('');
    setShowConfetti(false);
    setActivePowerUp(null);
    setScreen('game');
    
    const settings = DIFFICULTY_SETTINGS[diff];
    if (settings.time) setTimer(settings.time);
    else setTimer(null);
  };

  const handleJoinChallenge = (code: string) => {
    startGame('medium', code);
  };

  const handleGameCompletion = useCallback(async () => {
     // Check for First Victory
     if (!player.achievements.includes('first_win')) {
        unlockAchievement('first_win');
     }

     // --- Daily Reward Logic ---
     const today = new Date().toDateString(); // e.g. "Fri Oct 27 2023"
     
     if (player.lastRewardDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        let newStreak = dailyStreak;
        
        // If last reward was yesterday, increment streak. Otherwise reset to 1.
        if (player.lastRewardDate === yesterdayString) {
           newStreak = dailyStreak + 1;
        } else {
           // If it's null (first time) or older than yesterday, reset
           newStreak = 1;
        }

        const bonusCoins = newStreak * 10;
        
        // Update State
        setDailyStreak(newStreak);
        setPlayer(prev => ({
           ...prev,
           coins: prev.coins + bonusCoins,
           lastRewardDate: today
        }));

        // Show Reward Modal
        setTimeout(() => {
           playSound.levelUp();
           setDailyRewardInfo({ streak: newStreak, bonus: bonusCoins });
        }, 800);
     }
     // --------------------------

     // Trigger Interstitial Ad logic
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
    }
  };

  const handleWatchAdForCoins = async () => {
    playSound.click();
    const success = await adMobService.showRewardVideo();
    if (success) {
      setPlayer(prev => ({ ...prev, coins: prev.coins + 50 }));
      playSound.levelUp();
    }
  };

  const checkAnswer = useCallback((answerStr: string) => {
    if (!question) return;

    const correct = parseFloat(answerStr) === question.answer;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    if (correct) {
      playSound.correct();
      
      const streakMult = difficulty === 'hard' ? Math.floor(streak / 3) + 1 : 1;
      const comboBonus = combo >= 5 ? 2 : 1;
      let points = 10 * streakMult * comboBonus;
      
      if (difficulty === 'survival') {
        points = Math.floor(points * (1 + (currentWave * 0.2))); // Bonus points for higher waves
      }

      // Base calculation
      let earnedCoins = Math.floor(points / 10);
      let earnedXP = points * settings.xp;

      // --- APPLY ROCKET PERKS ---
      if (player.equippedRocket === '⭐') {
         // Speed Star: 50% XP Boost
         earnedXP = Math.floor(earnedXP * 1.5);
      } else if (player.equippedRocket === '🛸') {
         // Mega Blaster: 2x Coins
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
            setTimeout(() => playSound.levelUp(), 500);
         }
         return {
           ...prev,
           coins: newCoins,
           totalScore: newTotalScore,
           level: newLevel,
           xp: newXp
         };
      });

      const achievementsToUnlock: string[] = [];

      if (newStreak === 10) achievementsToUnlock.push('streak_10');
      
      const nextQ = questionsAnswered + 1;
      
      let isGameComplete = false;
      
      if (difficulty === 'survival') {
         // Survival Mode Logic
         const questionsInWave = nextQ % QUESTIONS_PER_WAVE;
         const waveProgress = ((questionsInWave === 0 ? QUESTIONS_PER_WAVE : questionsInWave) / QUESTIONS_PER_WAVE) * 100;
         setProgress(waveProgress);
         setQuestionsAnswered(nextQ);

         if (questionsInWave === 0) {
            // Wave Complete
            if (currentWave >= MAX_WAVES) {
               isGameComplete = true;
            } else {
               // Next Wave
               setIsWaveTransition(true);
               music.stop(); // Stop music briefly for effect
               setTimeout(() => {
                 setCurrentWave(w => w + 1);
                 setIsWaveTransition(false);
                 setQuestion(generateQuestion(difficulty, rngRef.current, currentWave + 1));
                 setFeedback('');
                 setActivePowerUp(null);
                 if (settings.time) setTimer(settings.time);
               }, 3000); // 3 seconds transition
               
               // Return early to skip standard generation
               setFeedback(`${['Awesome!', 'Perfect!', 'Amazing!'][Math.floor(Math.random() * 3)]} +${points}`);
               setShowConfetti(true);
               setTimeout(() => setShowConfetti(false), 2000);
               return; 
            }
         }
      } else {
         // Standard Mode Logic
         if (nextQ === settings.questions && newStreak === settings.questions) {
           achievementsToUnlock.push('perfect_game');
         }
         if (nextQ >= settings.questions) {
           isGameComplete = true;
         }
         setProgress((nextQ / settings.questions) * 100);
         setQuestionsAnswered(nextQ);
      }

      if (difficulty === 'hard' && timer && timer > 5) achievementsToUnlock.push('speed_demon');
      if (newCombo >= 10) achievementsToUnlock.push('combo_10');
      
      if (newLevel >= 5) achievementsToUnlock.push('level_5');
      if (newCoins >= 1000) achievementsToUnlock.push('coin_1000');
      if (newTotalScore >= 5000) achievementsToUnlock.push('score_5000');

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
          if (settings.time) setTimer(settings.time);
        }, 1500);
      }
    } else {
      playSound.wrong();
      setStreak(0);
      setCombo(0);
      setFeedback(`Oops! Answer: ${question.answer}`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      setTimeout(() => {
        // For survival, we don't reset wave on wrong answer, just continue
        setQuestion(generateQuestion(difficulty, rngRef.current, currentWave));
        setFeedback('');
        if (settings.time) setTimer(settings.time);
      }, 2000);
    }
  }, [question, difficulty, streak, combo, player.achievements, player.level, player.xp, player.coins, player.totalScore, questionsAnswered, timer, handleGameCompletion, player.equippedRocket, currentWave]);

  useEffect(() => {
    if (timer !== null && timer > 0 && screen === 'game' && activePowerUp !== 'timeFreeze' && !isWaveTransition) {
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
  }, [timer, screen, activePowerUp, checkAnswer, isWaveTransition]);

  const handleUsePowerUp = (type: 'hint' | 'timeFreeze') => {
    if (player.powerUps[type] <= 0) return;
    
    playSound.powerUp();
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

  const handleShare = () => {
    playSound.click();
    let text = `🚀 I scored ${player.totalScore} in Math Quest! Level ${player.level}\n`;
    if (activeChallengeCode) {
      text += `⚔️ I played Challenge Code: ${activeChallengeCode}\n`;
    } else {
      text += `Challenge me: ${friendCode}\n`;
    }
    text += `#MathQuest`;

    if (navigator.share) {
      navigator.share({ title: 'Math Quest', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Score & Code copied to clipboard!');
    }
  };

  // Logic to BUY or EQUIP
  const handleSelectRocket = (rocket: RocketItem) => {
    playSound.click();
    
    // Check if owned
    const isOwned = player.ownedRockets.includes(rocket.icon);

    if (isOwned) {
      // Just Equip
      setPlayer(prev => ({ ...prev, equippedRocket: rocket.icon }));
    } else {
      // Try to Buy
      if (player.coins >= rocket.cost) {
        setPlayer(prev => ({
          ...prev,
          coins: prev.coins - rocket.cost,
          ownedRockets: [...prev.ownedRockets, rocket.icon],
          equippedRocket: rocket.icon // Auto equip on buy
        }));
        playSound.levelUp(); // Celebration sound for purchase
      }
    }
  };
  
  // Logic to Buy Power Ups
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
    }
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
          progress={progress}
          equippedRocket={player.equippedRocket}
          powerUps={player.powerUps}
          onAnswer={checkAnswer}
          onUsePowerUp={handleUsePowerUp}
          onExit={() => navigate('dashboard')}
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