import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import GameScreen from './components/GameScreen';
import CompletionScreen from './components/CompletionScreen';
import Leaderboard from './components/Leaderboard';
import Achievements from './components/Achievements';
import Shop from './components/Shop';
import { PlayerState, ScreenState, Difficulty, Question, RocketItem, AchievementItem } from './types';
import { generateQuestion, DIFFICULTY_SETTINGS } from './services/mathService';
import { playSound } from './services/audioService';

// Constants
const ROCKETS: RocketItem[] = [
  { icon: '🚀', name: 'Explorer', cost: 0 },
  { icon: '⭐', name: 'Speed Star', cost: 500 },
  { icon: '🛸', name: 'Mega Blaster', cost: 1000 }
];

const ACHIEVEMENTS_LIST: AchievementItem[] = [
  { id: 'first_win', name: 'First Victory', icon: '🎯', reward: 50 },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', reward: 100 },
  { id: 'perfect_game', name: 'Perfect Game', icon: '💯', reward: 150 },
  { id: 'streak_10', name: 'Streak Master', icon: '🔥', reward: 200 }
];

const STORAGE_KEY = 'math-quest-data-v1';

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Game Configuration State
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [friendCode] = useState('QUEST' + Math.random().toString(36).substr(2, 6).toUpperCase());
  
  // Player Data Persistence
  const [player, setPlayer] = useState<PlayerState>({
    name: '',
    coins: 150,
    level: 1,
    xp: 0,
    totalScore: 0,
    achievements: [],
    equippedRocket: '🚀',
    powerUps: { hint: 3, timeFreeze: 2 }
  });
  const [dailyStreak, setDailyStreak] = useState(1);

  // Active Game Session State
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
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
        setPlayer(parsed.player);
        setDailyStreak(parsed.dailyStreak);
      } catch (e) {
        console.error("Failed to load save data");
      }
    }
    setIsLoaded(true);
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

  // --- Handlers ---

  const navigate = (newScreen: ScreenState) => {
    playSound.click();
    setScreen(newScreen);
  };

  const startGame = (diff: Difficulty) => {
    playSound.click();
    setDifficulty(diff);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setProgress(0);
    setQuestionsAnswered(0);
    setQuestion(generateQuestion(diff));
    setFeedback('');
    setShowConfetti(false);
    setActivePowerUp(null);
    setScreen('game');
    
    const settings = DIFFICULTY_SETTINGS[diff];
    if (settings.time) setTimer(settings.time);
    else setTimer(null);
  };

  const handleGameCompletion = useCallback(() => {
     // Check for First Victory
     if (!player.achievements.includes('first_win')) {
        unlockAchievement('first_win');
     }
     setTimeout(() => setScreen('complete'), 1000);
  }, [player.achievements]); // Only recreate if achievements change

  const unlockAchievement = (id: string) => {
    if (!player.achievements.includes(id)) {
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
      setPlayer(prev => ({
        ...prev,
        achievements: [...prev.achievements, id],
        coins: prev.coins + (ach ? ach.reward : 0)
      }));
      playSound.levelUp(); // Re-use level up sound for achievement
    }
  };

  const checkAnswer = useCallback((answerStr: string) => {
    if (!question) return;

    const correct = parseFloat(answerStr) === question.answer;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    if (correct) {
      playSound.correct();
      // Calculate Rewards
      const streakMult = difficulty === 'hard' ? Math.floor(streak / 3) + 1 : 1;
      const comboBonus = combo >= 5 ? 2 : 1;
      const points = 10 * streakMult * comboBonus;
      const earnedCoins = Math.floor(points / 10);
      const earnedXP = points * settings.xp;

      // Update Session State
      setScore(s => s + points);
      setStreak(s => s + 1);
      setCombo(c => c + 1);
      
      // Update Player State
      setPlayer(prev => {
         let newXp = prev.xp + earnedXP;
         let newLevel = prev.level;
         let leveledUp = false;
         if (newXp >= newLevel * 100) {
           newXp -= (newLevel * 100);
           newLevel++;
           leveledUp = true;
         }
         
         if (leveledUp) {
            setTimeout(() => playSound.levelUp(), 500);
         }

         return {
           ...prev,
           coins: prev.coins + earnedCoins,
           totalScore: prev.totalScore + points,
           level: newLevel,
           xp: newXp
         };
      });

      // Achievement Checks
      if (streak + 1 === 10) unlockAchievement('streak_10');
      if (difficulty === 'hard' && timer && timer > 5) unlockAchievement('speed_demon');

      // Feedback
      setFeedback(`${['Awesome!', 'Perfect!', 'Amazing!'][Math.floor(Math.random() * 3)]} +${points}`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      // Progress Logic
      const nextQ = questionsAnswered + 1;
      setQuestionsAnswered(nextQ);
      setProgress((nextQ / settings.questions) * 100);

      if (nextQ >= settings.questions) {
        handleGameCompletion();
      } else {
        // Next Question Delay
        setTimeout(() => {
          setQuestion(generateQuestion(difficulty));
          setFeedback('');
          setActivePowerUp(null);
          if (settings.time) setTimer(settings.time);
        }, 1500);
      }
    } else {
      // Wrong Answer
      playSound.wrong();
      setStreak(0);
      setCombo(0);
      setFeedback(`Oops! Answer: ${question.answer}`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      setTimeout(() => {
        setQuestion(generateQuestion(difficulty));
        setFeedback('');
        if (settings.time) setTimer(settings.time);
      }, 2000);
    }
  }, [question, difficulty, streak, combo, player.achievements, questionsAnswered, timer, handleGameCompletion]);

  // Timer Effect
  useEffect(() => {
    if (timer !== null && timer > 0 && screen === 'game' && activePowerUp !== 'timeFreeze') {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t === null) return null;
          if (t <= 1) {
             // Time's up handled as wrong answer effectively
             checkAnswer('-999999'); // Force wrong answer
             return null;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, screen, activePowerUp, checkAnswer]);

  const handleUsePowerUp = (type: 'hint' | 'timeFreeze') => {
    if (player.powerUps[type] <= 0) return;
    
    playSound.powerUp();
    setPlayer(prev => ({
      ...prev,
      powerUps: { ...prev.powerUps, [type]: prev.powerUps[type] - 1 }
    }));

    if (type === 'hint' && question) {
      setFeedback(`💡 Hint: Answer is near ${Math.floor(question.answer)}`);
      setTimeout(() => setFeedback(''), 3000);
    } else if (type === 'timeFreeze') {
      setActivePowerUp('timeFreeze');
      setTimeout(() => setActivePowerUp(null), 10000);
    }
  };

  const handleShare = () => {
    playSound.click();
    const text = `🚀 I scored ${player.totalScore} in Math Quest! Level ${player.level}\nJoin: ${friendCode}\n#MathQuest`;
    if (navigator.share) {
      navigator.share({ title: 'Math Quest', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const handleEquipRocket = (rocket: RocketItem) => {
    playSound.click();
    if (player.coins >= rocket.cost) {
       setPlayer(prev => ({ ...prev, equippedRocket: rocket.icon }));
    }
  };

  // --- Render ---

  if (!isLoaded) return null; // Prevent flash of default state

  if (screen === 'splash') {
    return (
      <SplashScreen 
        playerName={player.name} 
        setPlayerName={(name) => setPlayer(p => ({ ...p, name }))}
        onStart={() => navigate('dashboard')}
      />
    );
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        player={player}
        dailyStreak={dailyStreak}
        friendCode={friendCode}
        onStartGame={startGame}
        onNavigate={(s) => navigate(s)}
        onShare={handleShare}
      />
    );
  }

  if (screen === 'game' && question) {
    return (
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
      />
    );
  }

  if (screen === 'complete') {
    return (
      <CompletionScreen
        score={score}
        difficulty={difficulty}
        onPlayAgain={() => startGame(difficulty)}
        onDashboard={() => navigate('dashboard')}
        onShare={handleShare}
      />
    );
  }

  if (screen === 'leaderboard') {
    return (
      <Leaderboard
        playerName={player.name}
        totalScore={player.totalScore}
        level={player.level}
        onClose={() => navigate('dashboard')}
      />
    );
  }

  if (screen === 'achievements') {
    return (
      <Achievements
        unlockedAchievements={player.achievements}
        achievementsList={ACHIEVEMENTS_LIST}
        onClose={() => navigate('dashboard')}
      />
    );
  }

  if (screen === 'shop') {
    return (
      <Shop
        coins={player.coins}
        equippedRocket={player.equippedRocket}
        rockets={ROCKETS}
        onEquip={handleEquipRocket}
        onClose={() => navigate('dashboard')}
      />
    );
  }

  return null;
};

export default App;
