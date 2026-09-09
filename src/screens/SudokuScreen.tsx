import React from 'react';
import { CheckCircle2, Grid2X2, Pause, XCircle } from 'lucide-react';
import { SudokuSize } from '../types';

interface SudokuScreenProps {
  size: SudokuSize;
  board: number[][];
  given: boolean[][];
  selectedCell: { row: number; column: number } | null;
  mistakes: number;
  feedback: string;
  shake: boolean;
  showAnimations: boolean;
  currentWave?: number;
  isWaveTransition?: boolean;
  onSelectCell: (row: number, column: number) => void;
  onInput: (value: number) => void;
  onExit: () => void;
}

const SudokuScreen: React.FC<SudokuScreenProps> = ({
  size,
  board,
  given,
  selectedCell,
  mistakes,
  feedback,
  shake,
  showAnimations,
  currentWave,
  isWaveTransition,
  onSelectCell,
  onInput,
  onExit
}) => {
  const boxSize = Math.sqrt(size);
  const filledCells = board.reduce((total, row) => total + row.filter(Boolean).length, 0);
  const totalCells = size * size;

  const cellClass = (row: number, column: number) => {
    const isSelected = selectedCell?.row === row && selectedCell.column === column;
    const sharesSelection = selectedCell && (selectedCell.row === row || selectedCell.column === column);
    const isGiven = given[row]?.[column];
    const isLocked = isGiven || board[row]?.[column] !== 0;
    const borders = [
      row % boxSize === 0 ? 'border-t-2' : '',
      column % boxSize === 0 ? 'border-l-2' : '',
      row === size - 1 ? 'border-b-2' : '',
      column === size - 1 ? 'border-r-2' : ''
    ].filter(Boolean).join(' ');

    return `relative flex aspect-square items-center justify-center border-cyan-300/35 text-xl font-black transition sm:text-2xl ${borders} ${
      isSelected
        ? 'z-10 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.55)]'
        : sharesSelection
          ? 'bg-cyan-300/15 text-white'
          : isLocked
            ? 'bg-[#102c66] text-cyan-100'
            : 'bg-[#071b4b] text-orange-200 hover:bg-cyan-300/10'
      }`;
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#050d29] text-white font-['Lexend']">
      {isWaveTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-6 text-center animate-fade-in">
          <div>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-300/40 bg-red-400/15 text-red-200 shadow-[0_0_40px_rgba(248,113,113,.25)]">
              <Grid2X2 className="h-10 w-10 animate-pulse" />
            </div>
            <h2 className="font-['Press_Start_2P'] text-3xl text-red-200 sm:text-5xl">Wave {currentWave}</h2>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.28em] text-white/60">New puzzle incoming</p>
          </div>
        </div>
      )}
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 py-4 sm:px-6 sm:py-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={onExit} aria-label="Pause game" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0b1b48] text-cyan-100 transition hover:bg-cyan-400/15 active:scale-95">
            <Pause className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Grid2X2 className="h-5 w-5 text-orange-300" />
            <div>
              <p className="font-['Press_Start_2P'] text-sm text-white">Sudoku</p>
              <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-cyan-200/60">{size} × {size} grid{currentWave ? ` · Wave ${currentWave}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-black text-red-100">
            <XCircle className="h-4 w-4" /> {mistakes}
          </div>
        </header>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-cyan-200/70">Fill every square</p>
            <p className="mt-1 text-xs text-white/50">Tap a cell, then choose a number.</p>
          </div>
          <span className="text-sm font-black text-orange-200">{filledCells}/{totalCells}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-orange-400 transition-all duration-300" style={{ width: `${(filledCells / totalCells) * 100}%` }} />
        </div>

        <div className={`mx-auto mt-6 w-full max-w-[440px] rounded-3xl border-2 border-cyan-300/45 bg-[#0a2460]/80 p-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] ${shake ? 'animate-shake' : ''}`}>
          <div className="grid overflow-hidden rounded-2xl" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {board.map((row, rowIndex) => row.map((value, columnIndex) => (
              <button
                type="button"
                key={`${rowIndex}-${columnIndex}`}
                aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}${value ? `, value ${value}, locked` : ', empty'}`}
                aria-pressed={selectedCell?.row === rowIndex && selectedCell.column === columnIndex}
                disabled={Boolean(given[rowIndex]?.[columnIndex] || value)}
                onClick={() => onSelectCell(rowIndex, columnIndex)}
                className={`${cellClass(rowIndex, columnIndex)} disabled:cursor-default`}
              >
                {value || ''}
              </button>
            )))}
          </div>
        </div>

        <div aria-live="polite" className={`mt-4 min-h-6 text-center text-sm font-black ${feedback.includes('Try') ? 'text-red-300' : 'text-emerald-300'} ${showAnimations ? 'animate-fade-in' : ''}`}>
          {feedback}
        </div>

        <div className="mx-auto mt-4 grid w-full max-w-[440px] grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: size }, (_, index) => index + 1).map(value => (
            <button
              type="button"
              key={value}
              onClick={() => onInput(value)}
              className="flex min-h-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0b1b48] text-2xl font-black text-white shadow-lg transition hover:border-cyan-200/70 hover:bg-cyan-400/15 active:translate-y-0.5"
            >
              {value}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-white/45">
          <CheckCircle2 className="h-4 w-4 text-emerald-300/70" /> Correct cells lock as you solve them.
        </div>
      </div>
    </div>
  );
};

export default SudokuScreen;
