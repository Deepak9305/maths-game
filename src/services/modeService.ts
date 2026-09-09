import {
  Difficulty,
  GameMode,
  ModeDifficulty,
  ModeSessionConfig,
  Question,
  SudokuPuzzle,
  SudokuSize
} from '../types';
import { generateQuestion } from './mathService';

export const PRIMARY_GAME_MODES: Exclude<GameMode, 'survival'>[] = [
  'quick-calc',
  'square-sprint',
  'log-lab',
  'mini-sudoku',
  'target-puzzle'
];

export const GAME_MODE_DEFINITIONS: Record<GameMode, { name: string; description: string; statLabel: string }> = {
  'quick-calc': {
    name: 'Quick Calc',
    description: 'Solve math problems fast and build your streak.',
    statLabel: 'Best score'
  },
  'square-sprint': {
    name: 'Square Sprint',
    description: 'Race through squares and roots before the clock catches you.',
    statLabel: 'Best score'
  },
  'log-lab': {
    name: 'Log Lab',
    description: 'Crack logarithms, powers, and patterns across the galaxy.',
    statLabel: 'Best score'
  },
  'mini-sudoku': {
    name: 'Mini Sudoku',
    description: 'Fill the grid, spot the pattern, and clear the sector.',
    statLabel: 'Best score'
  },
  'target-puzzle': {
    name: 'Target Puzzle',
    description: 'Pick the equation that hits the target exactly.',
    statLabel: 'Best score'
  },
  survival: {
    name: 'Survival',
    description: 'Keep solving as the waves get faster and tougher.',
    statLabel: 'Best wave'
  }
};

const makeConfig = (
  mode: GameMode,
  difficulty: ModeDifficulty,
  time: number | null,
  questions: number,
  xp: number,
  lives: number | null,
  description: string
): ModeSessionConfig => ({
  mode,
  difficulty,
  name: difficulty[0].toUpperCase() + difficulty.slice(1),
  description,
  time,
  questions,
  color: mode === 'survival' ? 'bg-red-600' : mode === 'log-lab' ? 'bg-emerald-600' : mode === 'target-puzzle' ? 'bg-orange-500' : 'bg-blue-600',
  xp,
  lives
});

export const MODE_DIFFICULTY_CONFIGS: Record<GameMode, Record<ModeDifficulty, ModeSessionConfig>> = {
  'quick-calc': {
    beginner: makeConfig('quick-calc', 'beginner', null, 10, 1, null, 'Warm up with addition and subtraction.'),
    standard: makeConfig('quick-calc', 'standard', 15, 15, 2, 3, 'Mix multiplication and division under pressure.'),
    expert: makeConfig('quick-calc', 'expert', 10, 20, 3, 3, 'Master three-step combos at top speed.')
  },
  'square-sprint': {
    beginner: makeConfig('square-sprint', 'beginner', 20, 10, 2, 3, 'Learn perfect squares and friendly roots.'),
    standard: makeConfig('square-sprint', 'standard', 14, 15, 3, 3, 'Switch between squares and roots quickly.'),
    expert: makeConfig('square-sprint', 'expert', 9, 20, 4, 2, 'Handle big squares before the timer burns out.')
  },
  'log-lab': {
    beginner: makeConfig('log-lab', 'beginner', 25, 10, 2, 3, 'Start with clean powers and familiar bases.'),
    standard: makeConfig('log-lab', 'standard', 16, 15, 3, 3, 'Solve mixed-base logarithms at pace.'),
    expert: makeConfig('log-lab', 'expert', 11, 20, 5, 2, 'Decode tougher powers with no wasted moves.')
  },
  'mini-sudoku': {
    beginner: makeConfig('mini-sudoku', 'beginner', null, 1, 4, null, 'A gentle pattern hunt to get started.'),
    standard: makeConfig('mini-sudoku', 'standard', null, 1, 5, null, 'Balance speed and accuracy in the grid.'),
    expert: makeConfig('mini-sudoku', 'expert', null, 1, 7, null, 'Clear a dense grid with perfect focus.')
  },
  'target-puzzle': {
    beginner: makeConfig('target-puzzle', 'beginner', 25, 10, 2, 3, 'Find the friendly equation that reaches the goal.'),
    standard: makeConfig('target-puzzle', 'standard', 17, 15, 3, 3, 'Compare expressions and trust your instincts.'),
    expert: makeConfig('target-puzzle', 'expert', 12, 20, 5, 2, 'Spot the exact target among clever decoys.')
  },
  survival: {
    beginner: makeConfig('survival', 'beginner', 10, 9999, 5, 1, 'Endless waves with escalating arithmetic.'),
    standard: makeConfig('survival', 'standard', 10, 9999, 5, 1, 'Endless waves with escalating arithmetic.'),
    expert: makeConfig('survival', 'expert', 10, 9999, 5, 1, 'Endless waves with escalating arithmetic.')
  }
};

export const MODE_DIFFICULTY_LABELS: Record<ModeDifficulty, string> = {
  beginner: 'Beginner',
  standard: 'Standard',
  expert: 'Expert'
};

export const getModeConfig = (mode: GameMode, difficulty: ModeDifficulty): ModeSessionConfig =>
  MODE_DIFFICULTY_CONFIGS[mode][difficulty];

export const modeDifficultyToLegacyDifficulty = (difficulty: ModeDifficulty): Difficulty => {
  if (difficulty === 'beginner') return 'easy';
  if (difficulty === 'expert') return 'hard';
  return 'medium';
};

const randomInt = (min: number, max: number, rng: () => number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const shuffle = <T,>(items: T[], rng: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const subscript = (value: number) => String(value).split('').map(char => (
  {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
    '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  }[char] || char
)).join('');

const generateSquareQuestion = (difficulty: ModeDifficulty, rng: () => number): Question => {
  const maxBase = difficulty === 'beginner' ? 12 : difficulty === 'standard' ? 20 : 35;
  const base = randomInt(2, maxBase, rng);
  const isRoot = rng() > 0.5;
  if (isRoot) {
    return { display: `√${base * base} = ?`, answer: base, visualAid: null };
  }
  return { display: `${base}² = ?`, answer: base * base, visualAid: null };
};

const generateLogQuestion = (difficulty: ModeDifficulty, rng: () => number): Question => {
  const bases = difficulty === 'beginner' ? [2, 10] : difficulty === 'standard' ? [2, 3, 5, 10] : [2, 3, 4, 5, 10];
  const base = bases[randomInt(0, bases.length - 1, rng)];
  const maxExponent = difficulty === 'beginner' ? 3 : difficulty === 'standard' ? 4 : 5;
  const exponent = randomInt(1, maxExponent, rng);
  return {
    display: `log${subscript(base)} ${base ** exponent} = ?`,
    answer: exponent,
    visualAid: null
  };
};

const generateTargetQuestion = (difficulty: ModeDifficulty, rng: () => number): Question => {
  const max = difficulty === 'beginner' ? 6 : difficulty === 'standard' ? 9 : 12;
  const a = randomInt(2, max, rng);
  const b = randomInt(2, max, rng);
  const c = randomInt(2, difficulty === 'expert' ? 8 : 6, rng);
  const target = a + b * c;
  const candidates = [
    { label: `${a} + ${b} × ${c}`, value: target },
    { label: `${a} × ${b} + ${c}`, value: a * b + c },
    { label: `(${a} + ${b}) × ${c}`, value: (a + b) * c },
    { label: `${a} + ${b + c}`, value: a + b + c },
    { label: `${a * b} - ${c}`, value: a * b - c },
    { label: `${a + c} × ${b}`, value: (a + c) * b }
  ];
  const unique = candidates.filter((candidate, index, list) => (
    list.findIndex(item => item.value === candidate.value) === index
  ));
  const correct = unique[0];
  const decoys = shuffle(unique.slice(1), rng).slice(0, 3);
  const choices = shuffle([correct, ...decoys], rng);
  return {
    display: `Which equation equals ${target}?`,
    answer: choices.findIndex(choice => choice.value === correct.value),
    visualAid: null,
    choices: choices.map(choice => choice.label),
    correctLabel: correct.label
  };
};

export const generateModeQuestion = (
  mode: GameMode,
  difficulty: ModeDifficulty,
  rng: () => number = Math.random,
  wave = 1
): Question => {
  switch (mode) {
    case 'square-sprint':
      return generateSquareQuestion(difficulty, rng);
    case 'log-lab':
      return generateLogQuestion(difficulty, rng);
    case 'target-puzzle':
      return generateTargetQuestion(difficulty, rng);
    case 'survival':
      return generateQuestion('survival', rng, wave);
    case 'quick-calc':
    case 'mini-sudoku':
    default:
      return generateQuestion(modeDifficultyToLegacyDifficulty(difficulty), rng, 1);
  }
};

const createSudokuSolution = (size: SudokuSize, rng: () => number): number[][] => {
  const box = Math.sqrt(size);
  const numbers = shuffle(Array.from({ length: size }, (_, index) => index + 1), rng);
  const pattern = (row: number, column: number) => (row * box + Math.floor(row / box) + column) % size;
  return Array.from({ length: size }, (_, row) => (
    Array.from({ length: size }, (_, column) => numbers[pattern(row, column)])
  ));
};

export const generateSudokuPuzzle = (
  size: SudokuSize,
  difficulty: ModeDifficulty,
  rng: () => number = Math.random
): SudokuPuzzle => {
  const solution = createSudokuSolution(size, rng);
  const puzzle = solution.map(row => [...row]);
  const removalCount = size === 4
    ? difficulty === 'beginner' ? 5 : difficulty === 'standard' ? 7 : 9
    : difficulty === 'beginner' ? 34 : difficulty === 'standard' ? 45 : 54;

  const cells = shuffle(Array.from({ length: size * size }, (_, index) => index), rng);
  cells.slice(0, removalCount).forEach(index => {
    const row = Math.floor(index / size);
    const column = index % size;
    puzzle[row][column] = 0;
  });

  return {
    size,
    puzzle,
    solution,
    given: puzzle.map(row => row.map(value => value !== 0))
  };
};

export const countFilledSudokuCells = (board: number[][]) =>
  board.reduce((total, row) => total + row.filter(Boolean).length, 0);
