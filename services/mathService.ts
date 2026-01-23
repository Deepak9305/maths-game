import { Difficulty, Question, DifficultySetting, DailyChallenge } from '../types';

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySetting> = {
  easy: { name: 'Rookie', time: null, questions: 10, color: 'bg-green-500', xp: 1, lives: null },
  medium: { name: 'Pilot', time: 15, questions: 15, color: 'bg-blue-500', xp: 2, lives: 3 },
  hard: { name: 'Commander', time: 10, questions: 20, color: 'bg-purple-600', xp: 3, lives: 3 },
  survival: { name: 'Survival', time: 10, questions: 9999, color: 'bg-red-600', xp: 5, lives: 1 }
};

// Simple seeded random number generator (Mulberry32)
export const createSeededRandom = (seedStr: string) => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
    seed |= 0;
  }
  
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

export const generateQuestion = (diff: Difficulty, rng: () => number = Math.random, wave: number = 1): Question => {
  let num1: number, num2: number, operation: string, answer: number, display: string;
  let visualAid: number | null = null;

  // Helper to get random integer between min and max (inclusive) using provided RNG
  const randomInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  // Determine effective difficulty parameters based on Mode and Wave
  let mode = diff;
  let maxNum = 10;
  
  if (diff === 'survival') {
    // INFINITE SCALING LOGIC
    // Base difficulty increases with waves
    if (wave <= 2) {
      mode = 'easy';
      maxNum = 10 + wave;
    } else if (wave <= 5) {
      mode = 'medium';
      maxNum = 15 + wave; 
    } else {
      mode = 'hard';
      // Continuously increase number range as waves progress
      maxNum = 20 + (wave * 2);
    }
  } else {
    // Standard Scaling
    maxNum = diff === 'easy' ? 12 : diff === 'medium' ? 20 : 50;
  }

  const ops = [];
  if (mode === 'easy') ops.push('+', '-');
  else if (mode === 'medium') ops.push('*', '/');
  else ops.push('+', '-', '*', '/'); // Hard mode includes all

  // In very high waves (15+), remove easy operations to force difficulty
  if (diff === 'survival' && wave > 15) {
     const easyIndex = ops.indexOf('+');
     if (easyIndex > -1) ops.splice(easyIndex, 1);
     const minusIndex = ops.indexOf('-');
     if (minusIndex > -1) ops.splice(minusIndex, 1);
  }

  operation = ops[randomInt(0, ops.length - 1)];

  switch (operation) {
    case '+':
      num1 = randomInt(Math.floor(maxNum/2), maxNum);
      num2 = randomInt(1, maxNum);
      answer = num1 + num2;
      display = `${num1} + ${num2}`;
      if (mode === 'easy' && num1 + num2 <= 10) visualAid = num1 + num2; 
      break;
    case '-':
      num1 = randomInt(1, maxNum);
      num2 = randomInt(1, num1); // Ensure positive result
      answer = num1 - num2;
      display = `${num1} - ${num2}`;
      break;
    case '*':
      if (mode === 'medium') {
        num1 = randomInt(2, 9);
        num2 = randomInt(2, 9);
      } else {
        // Harder multiplication scaling with wave
        const limit = diff === 'survival' ? Math.min(12 + Math.floor(wave/2), 30) : 12;
        num1 = randomInt(3, limit);
        num2 = randomInt(3, limit);
      }
      answer = num1 * num2;
      display = `${num1} × ${num2}`;
      break;
    case '/':
      // Generate multiplication first to ensure clean division
      const divLimit = diff === 'survival' ? Math.min(12 + Math.floor(wave/2), 30) : 12;
      num2 = randomInt(2, mode === 'medium' ? 9 : divLimit);
      answer = randomInt(2, mode === 'medium' ? 9 : divLimit);
      num1 = num2 * answer;
      display = `${num1} ÷ ${num2}`;
      break;
    default:
      num1 = 1; num2 = 1; answer = 2; display = '1 + 1';
  }

  return { display, answer, visualAid };
};

export const generateDailyChallenges = (): DailyChallenge[] => {
  const challenges: DailyChallenge[] = [];
  const rng = Math.random; // Could seed this with date if we wanted identical challenges for all users

  // Challenge 1: Score/Accumulation
  const scoreTarget = [500, 1000, 2000][Math.floor(rng() * 3)];
  challenges.push({
    id: `score_${Date.now()}_1`,
    type: 'total_score',
    description: `Earn ${scoreTarget} Total Points`,
    target: scoreTarget,
    current: 0,
    reward: Math.floor(scoreTarget / 10),
    completed: false,
    claimed: false,
    icon: '⭐'
  });

  // Challenge 2: Precision/Streak
  const streakTarget = [5, 10, 15, 20][Math.floor(rng() * 4)];
  challenges.push({
    id: `streak_${Date.now()}_2`,
    type: 'high_streak',
    description: `Get a streak of ${streakTarget}`,
    target: streakTarget,
    current: 0,
    reward: streakTarget * 10,
    completed: false,
    claimed: false,
    icon: '🔥'
  });

  // Challenge 3: Volume
  const answerTarget = [20, 40, 60][Math.floor(rng() * 3)];
  challenges.push({
    id: `answers_${Date.now()}_3`,
    type: 'total_answers',
    description: `Answer ${answerTarget} Questions Correctly`,
    target: answerTarget,
    current: 0,
    reward: 100 + (answerTarget * 2),
    completed: false,
    claimed: false,
    icon: '📝'
  });

  return challenges;
};
