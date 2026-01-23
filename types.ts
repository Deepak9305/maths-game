export type ScreenState = 'splash' | 'dashboard' | 'game' | 'complete' | 'leaderboard' | 'achievements' | 'shop' | 'privacy';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'survival';

export interface DifficultySetting {
  name: string;
  time: number | null;
  questions: number;
  color: string;
  xp: number;
  lives: number | null; // null represents unlimited lives
}

export interface Question {
  display: string;
  answer: number;
  visualAid: number | null;
}

export interface RocketItem {
  icon: string;
  name: string;
  cost: number;
  perk: string;
}

export interface AchievementItem {
  id: string;
  name: string;
  icon: string;
  reward: number;
}

export interface PlayerState {
  name: string;
  coins: number;
  level: number;
  xp: number;
  totalScore: number;
  achievements: string[];
  equippedRocket: string;
  ownedRockets: string[]; // Track which rockets the player has purchased
  powerUps: {
    hint: number;
    timeFreeze: number;
  };
  lastRewardDate: string | null; // Tracks the last date a daily bonus was claimed
}