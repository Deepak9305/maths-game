export type ScreenState = 'splash' | 'dashboard' | 'game' | 'complete' | 'achievements' | 'shop' | 'privacy' | 'map' | 'pet';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'survival';

export type GameMode = 'quick-calc' | 'square-sprint' | 'log-lab' | 'mini-sudoku' | 'target-puzzle' | 'survival';

export type ModeDifficulty = 'beginner' | 'standard' | 'expert';

export type SudokuSize = 4 | 9;

export interface DifficultySetting {
  name: string;
  time: number | null;
  questions: number;
  color: string;
  xp: number;
  lives: number | null; // null represents unlimited lives
}

export interface ModeSessionConfig extends DifficultySetting {
  mode: GameMode;
  difficulty: ModeDifficulty;
  description: string;
}

export interface ModeStats {
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
  bestTime?: number;
}

export interface Question {
  display: string;
  answer: number;
  visualAid: number | null;
  choices?: string[];
  correctLabel?: string;
}

export interface SudokuPuzzle {
  size: SudokuSize;
  puzzle: number[][];
  solution: number[][];
  given: boolean[][];
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
  description: string;
}

export type ChallengeType = 'total_score' | 'high_streak' | 'total_answers' | 'survival_wave';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface PetState {
  id: string;
  name: string;
  happiness: number;
  hunger: number;
  level: number;
  xp: number;
  lastInteractionTime: number;
  lastFedTime?: number;
  lastPlayedTime?: number;
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
  
  // Daily Challenges
  dailyChallenges: DailyChallenge[];
  lastChallengeDate: string | null;

  // Pet
  pet?: PetState; // Legacy
  pets?: Record<string, PetState>;
  activePetId?: string;
  showAnimations?: boolean;

  // Per-mode personal bests. Optional for backwards compatibility with v1 saves.
  modeStats?: Partial<Record<GameMode, ModeStats>>;

  // Independent Galaxy Map progression for each primary mode. Optional for backwards compatibility.
  modeProgress?: Partial<Record<Exclude<GameMode, 'survival'>, number>>;
}
