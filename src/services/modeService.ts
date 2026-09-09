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
    name: 'Quick Math',
    description: 'Solve math problems fast and build your streak.',
    statLabel: 'Best score'
  },
  'square-sprint': {
    name: 'Squares & Roots',
    description: 'Race through squares and roots before the clock catches you.',
    statLabel: 'Best score'
  },
  'log-lab': {
    name: 'Powers & Logs',
    description: 'Crack logarithms, powers, and patterns across the galaxy.',
    statLabel: 'Best score'
  },
  'mini-sudoku': {
    name: 'Sudoku',
    description: 'Fill the grid, spot the pattern, and clear the sector.',
    statLabel: 'Best score'
  },
  'target-puzzle': {
    name: 'Equation Match',
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
    standard: makeConfig('quick-calc', 'standard', 12, 15, 2, 3, 'Solve larger multiplication and division problems under pressure.'),
    expert: makeConfig('quick-calc', 'expert', 8, 20, 3, 3, 'Master large three-step combos at top speed.')
  },
  'square-sprint': {
    beginner: makeConfig('square-sprint', 'beginner', 20, 10, 2, 3, 'Learn perfect squares and friendly roots.'),
    standard: makeConfig('square-sprint', 'standard', 12, 15, 3, 3, 'Switch between larger squares and roots quickly.'),
    expert: makeConfig('square-sprint', 'expert', 8, 20, 4, 2, 'Handle huge squares before the timer burns out.')
  },
  'log-lab': {
    beginner: makeConfig('log-lab', 'beginner', 25, 10, 2, 3, 'Start with clean powers and familiar bases.'),
    standard: makeConfig('log-lab', 'standard', 13, 15, 3, 3, 'Solve mixed-base logarithms with bigger powers.'),
    expert: makeConfig('log-lab', 'expert', 9, 20, 5, 2, 'Decode tougher powers with no wasted moves.')
  },
  'mini-sudoku': {
    beginner: makeConfig('mini-sudoku', 'beginner', null, 1, 4, null, 'A gentle pattern hunt to get started.'),
    standard: makeConfig('mini-sudoku', 'standard', null, 1, 5, null, 'Solve a sparser grid with fewer clues.'),
    expert: makeConfig('mini-sudoku', 'expert', null, 1, 7, null, 'Clear a dense, clue-starved grid with perfect focus.')
  },
  'target-puzzle': {
    beginner: makeConfig('target-puzzle', 'beginner', 25, 10, 2, 3, 'Find the friendly equation that reaches the goal.'),
    standard: makeConfig('target-puzzle', 'standard', 13, 15, 3, 3, 'Compare larger expressions and trust your instincts.'),
    expert: makeConfig('target-puzzle', 'expert', 9, 20, 5, 2, 'Spot the exact target among high-value decoys.')
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

export const getGalaxyMapDifficulty = (level: number): ModeDifficulty => {
  if (level <= 15) return 'standard';
  return 'expert';
};

export const getGalaxyMapDifficultyLabel = (level: number): string => {
  if (level <= 15) return 'Medium';
  if (level <= 35) return 'Hard';
  return 'Hardest';
};

export const getModeConfig = (mode: GameMode, difficulty: ModeDifficulty): ModeSessionConfig =>
  MODE_DIFFICULTY_CONFIGS[mode][difficulty];

export const getSurvivalConfig = (
  mode: GameMode,
  difficulty: ModeDifficulty,
  wave = 1
): ModeSessionConfig => {
  const baseMode: Exclude<GameMode, 'survival'> = mode === 'survival' ? 'quick-calc' : mode;
  const base = getModeConfig(baseMode, difficulty);
  const fasterBy = Math.min(6, Math.floor((wave - 1) / 3));
  const baseTime = base.time ?? (baseMode === 'mini-sudoku' ? null : 12);

  return {
    ...base,
    mode: baseMode,
    name: `${base.name} Survival`,
    time: baseTime === null ? null : Math.max(5, baseTime - fasterBy),
    questions: Number.POSITIVE_INFINITY,
    lives: 1,
    description: `Endless ${base.name} waves. Wave ${wave} gets tougher and faster.`
  };
};

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

const generateSquareQuestion = (difficulty: ModeDifficulty, rng: () => number, wave = 1, survival = false, routeLevel = 1): Question => {
  const startingMax = difficulty === 'beginner' ? 12 : difficulty === 'standard' ? 28 : 45;
  const routeBoost = !survival && routeLevel >= 36 ? Math.min(55, (routeLevel - 35) * 4) : 0;
  const maxBase = startingMax + (survival ? Math.min(80, (wave - 1) * 4) : routeBoost);
  const base = randomInt(2, maxBase, rng);
  const isRoot = rng() > 0.5;
  if (isRoot) {
    return { display: `√${base * base} = ?`, answer: base, visualAid: null };
  }
  return { display: `${base}² = ?`, answer: base * base, visualAid: null };
};

const generateLogQuestion = (difficulty: ModeDifficulty, rng: () => number, wave = 1, survival = false, routeLevel = 1): Question => {
  const baseSet = difficulty === 'beginner' ? [2, 10] : difficulty === 'standard' ? [2, 3, 5, 7, 10] : [2, 3, 4, 5, 7, 10];
  const bases = survival && wave >= 4 ? Array.from(new Set([...baseSet, 7])) : baseSet;
  const base = bases[randomInt(0, bases.length - 1, rng)];
  const startingExponent = difficulty === 'beginner' ? 3 : difficulty === 'standard' ? 6 : 7;
  const routeBoost = !survival && routeLevel >= 36 ? Math.min(4, Math.floor((routeLevel - 35) / 4)) : 0;
  const maxExponent = startingExponent + (survival ? Math.min(7, Math.floor((wave - 1) / 2)) : routeBoost);
  const exponent = randomInt(1, maxExponent, rng);
  return {
    display: `log${subscript(base)} ${base ** exponent} = ?`,
    answer: exponent,
    visualAid: null
  };
};

const generateTargetQuestion = (difficulty: ModeDifficulty, rng: () => number, wave = 1, survival = false, routeLevel = 1): Question => {
  const startingMax = difficulty === 'beginner' ? 6 : difficulty === 'standard' ? 13 : 18;
  const routeBoost = !survival && routeLevel >= 36 ? Math.min(24, (routeLevel - 35) * 2) : 0;
  const max = startingMax + (survival ? Math.min(30, (wave - 1) * 2) : routeBoost);
  const a = randomInt(2, max, rng);
  const b = randomInt(2, max, rng);
  const cStartingMax = difficulty === 'expert' ? 10 : difficulty === 'standard' ? 8 : 6;
  const c = randomInt(2, cStartingMax + (survival ? Math.min(18, wave - 1) : 0), rng);
  const target = a + b * c;
  const candidates = [
    { label: `${a} + ${b} × ${c}`, value: target },
    { label: `${a} × ${b} + ${c}`, value: a * b + c },
    { label: `(${a} + ${b}) × ${c}`, value: (a + b) * c },
    { label: `${a} + ${b + c}`, value: a + b + c },
    { label: `${a * b} - ${c}`, value: a * b - c },
    { label: `${a + c} × ${b}`, value: (a + c) * b }
  ];
  const byValue = new Map<number, { label: string; value: number }>();
  candidates.forEach(candidate => {
    if (!byValue.has(candidate.value)) byValue.set(candidate.value, candidate);
  });
  // Small ranges can make the static candidates collide. Add safe decoys until
  // the player always receives four different result values.
  for (let attempts = 0; byValue.size < 4 && attempts < 24; attempts += 1) {
    const x = randomInt(2, max + 3, rng);
    const y = randomInt(2, max + 3, rng);
    const z = randomInt(1, cStartingMax + 3, rng);
    const candidate = { label: `${x} × ${y} + ${z}`, value: x * y + z };
    if (candidate.value !== target) byValue.set(candidate.value, candidate);
  }
  for (let offset = 1; byValue.size < 4; offset += 1) {
    const value = target + offset;
    if (!byValue.has(value)) byValue.set(value, { label: `${value} + 0`, value });
  }
  const unique = [...byValue.values()];
  const correct = unique.find(candidate => candidate.value === target)!;
  const decoys = shuffle(unique.filter(candidate => candidate.value !== target), rng).slice(0, 3);
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
  wave = 1,
  survival = false,
  routeLevel = 1
): Question => {
  switch (mode) {
    case 'square-sprint':
      return generateSquareQuestion(difficulty, rng, wave, survival, routeLevel);
    case 'log-lab':
      return generateLogQuestion(difficulty, rng, wave, survival, routeLevel);
    case 'target-puzzle':
      return generateTargetQuestion(difficulty, rng, wave, survival, routeLevel);
    case 'survival':
      return generateQuestion('survival', rng, wave);
    case 'quick-calc':
    case 'mini-sudoku':
    default:
      return generateQuestion(survival ? 'survival' : modeDifficultyToLegacyDifficulty(difficulty), rng, wave, routeLevel);
  }
};

const createSudokuSolution = (size: SudokuSize, rng: () => number): number[][] => {
  const box = Math.sqrt(size);
  const numbers = shuffle(Array.from({ length: size }, (_, index) => index + 1), rng);
  const pattern = (row: number, column: number) => (row * box + Math.floor(row / box) + column) % size;
  const shuffledStructure = () => shuffle(Array.from({ length: box }, (_, index) => index), rng)
    .flatMap(group => shuffle(Array.from({ length: box }, (_, index) => group * box + index), rng));
  const rows = shuffledStructure();
  const columns = shuffledStructure();
  return rows.map(row => (
    columns.map(column => numbers[pattern(row, column)])
  ));
};

const countSudokuSolutions = (board: number[][], size: SudokuSize, limit = 2): number => {
  const box = Math.sqrt(size);
  let solutions = 0;

  const search = (): void => {
    if (solutions >= limit) return;
    let targetRow = -1;
    let targetColumn = -1;
    let targetCandidates: number[] | null = null;

    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        if (board[row][column] !== 0) continue;
        const used = new Set<number>();
        board[row].forEach(value => used.add(value));
        for (let index = 0; index < size; index += 1) used.add(board[index][column]);
        const rowStart = Math.floor(row / box) * box;
        const columnStart = Math.floor(column / box) * box;
        for (let r = rowStart; r < rowStart + box; r += 1) {
          for (let c = columnStart; c < columnStart + box; c += 1) used.add(board[r][c]);
        }
        const candidates = Array.from({ length: size }, (_, index) => index + 1).filter(value => !used.has(value));
        if (!candidates.length) return;
        if (!targetCandidates || candidates.length < targetCandidates.length) {
          targetRow = row;
          targetColumn = column;
          targetCandidates = candidates;
          if (candidates.length === 1) break;
        }
      }
      if (targetCandidates?.length === 1) break;
    }

    if (!targetCandidates) {
      solutions += 1;
      return;
    }
    targetCandidates.forEach(value => {
      if (solutions >= limit) return;
      board[targetRow][targetColumn] = value;
      search();
      board[targetRow][targetColumn] = 0;
    });
  };

  search();
  return solutions;
};

export const generateSudokuPuzzle = (
  size: SudokuSize,
  difficulty: ModeDifficulty,
  rng: () => number = Math.random,
  wave = 1,
  survival = false,
  routeLevel = 1
): SudokuPuzzle => {
  const solution = createSudokuSolution(size, rng);
  const puzzle = solution.map(row => [...row]);
  const baseRemovalCount = size === 4
    ? difficulty === 'beginner' ? 5 : difficulty === 'standard' ? 9 : 11
    : difficulty === 'beginner' ? 34 : difficulty === 'standard' ? 50 : 60;
  const maxRemovals = size === 4 ? 12 : 64;
  const routeBoost = !survival && routeLevel >= 36 ? Math.min(3, Math.floor((routeLevel - 35) / 5)) : 0;
  const removalCount = Math.min(maxRemovals, baseRemovalCount + (survival ? Math.floor((wave - 1) * (size === 4 ? 1 : 2)) : routeBoost));

  const cells = shuffle(Array.from({ length: size * size }, (_, index) => index), rng);
  let removed = 0;
  // Keep each tentative removal only when the puzzle still has one solution.
  // The bounded pass avoids costly retry loops on sparse 9×9 expert boards.
  cells.slice(0, Math.min(cells.length, removalCount + (size === 9 ? 18 : 4))).forEach(index => {
    if (removed >= removalCount) return;
    const row = Math.floor(index / size);
    const column = index % size;
    const previous = puzzle[row][column];
    puzzle[row][column] = 0;
    if (countSudokuSolutions(puzzle, size, 2) === 1) {
      removed += 1;
    } else {
      puzzle[row][column] = previous;
    }
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
