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
    let t = seed = (seed + 0x6D2B79F5) | 0;
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
      maxNum = 20 + (wave * 2);
    } else if (wave <= 5) {
      mode = 'medium';
      maxNum = 30 + (wave * 3); 
    } else {
      mode = 'hard';
      // Continuously increase number range as waves progress
      maxNum = 50 + (wave * 5);
    }
  } else {
    // Standard Scaling
    maxNum = diff === 'easy' ? 20 : diff === 'medium' ? 50 : 100;
  }

  if (mode === 'hard') {
    // 3-Number Logic for Hard Mode
    const op1 = ['+', '-', '*'][randomInt(0, 2)];
    const op2 = ['+', '-'][randomInt(0, 1)];
    
    let part1Result = 0;
    let displayPart1 = '';
    
    if (op1 === '+') {
      num1 = randomInt(Math.floor(maxNum/4), Math.floor(maxNum/2));
      num2 = randomInt(1, Math.floor(maxNum/2));
      part1Result = num1 + num2;
      displayPart1 = `${num1} + ${num2}`;
    } else if (op1 === '-') {
      num1 = randomInt(Math.floor(maxNum/2), maxNum);
      num2 = randomInt(1, num1 - 1);
      part1Result = num1 - num2;
      displayPart1 = `${num1} - ${num2}`;
    } else { // '*'
      const limit = diff === 'survival' ? Math.min(10 + Math.floor(wave/2), 25) : 15;
      num1 = randomInt(3, limit);
      num2 = randomInt(3, limit);
      part1Result = num1 * num2;
      displayPart1 = `${num1} × ${num2}`;
    }
    
    // If part1Result is too small for a positive subtraction result, force addition
    const effectiveOp2 = (op2 === '-' && part1Result <= 1) ? '+' : op2;
    let num3 = 0;
    if (effectiveOp2 === '+') {
      num3 = randomInt(1, Math.floor(maxNum/2));
      answer = part1Result + num3;
      display = `${displayPart1} + ${num3}`;
    } else { // '-'
      num3 = randomInt(1, part1Result - 1);
      answer = part1Result - num3;
      display = `${displayPart1} - ${num3}`;
    }
    
    return { display, answer, visualAid: null };
  }

  // 2-Number Logic for Easy/Medium
  const ops = [];
  if (mode === 'easy') ops.push('+', '-');
  else ops.push('*', '/'); // Medium mode

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
      num1 = randomInt(Math.floor(maxNum/3), maxNum); // Made harder by increasing the floor
      num2 = randomInt(1, num1); // Ensure positive result
      answer = num1 - num2;
      display = `${num1} - ${num2}`;
      break;
    case '*':
      num1 = randomInt(3, 15); // Increased from 2-9
      num2 = randomInt(3, 15); // Increased from 2-9
      answer = num1 * num2;
      display = `${num1} × ${num2}`;
      break;
    case '/':
      num2 = randomInt(3, 15); // Increased from 2-9
      answer = randomInt(3, 15); // Increased from 2-9
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
  // Seed with today's date so challenges are stable across sessions on the same day
  const todayStr = new Date().toDateString();
  const rng = createSeededRandom(todayStr);

  // Challenge 1: Score/Accumulation
  const scoreTarget = [500, 1000, 2000][Math.floor(rng() * 3)];
  challenges.push({
    id: `score_${todayStr}_1`,
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
    id: `streak_${todayStr}_2`,
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
    id: `answers_${todayStr}_3`,
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
