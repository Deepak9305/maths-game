export type ScreenState = 'splash' | 'dashboard' | 'game' | 'complete' | 'leaderboard' | 'achievements' | 'shop';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySetting {
  name: string;
  time: number | null;
  questions: number;
  color: string;
  xp: number;
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
  powerUps: {
    hint: number;
    timeFreeze: number;
  };
}
