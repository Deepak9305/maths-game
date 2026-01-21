import { Difficulty, Question } from '../types';

export const generateQuestion = (diff: Difficulty): Question => {
  let num1: number, num2: number, operation: string, answer: number, display: string;
  let visualAid: number | null = null;

  if (diff === 'easy') {
    num1 = Math.floor(Math.random() * 20) + 1;
    num2 = Math.floor(Math.random() * 20) + 1;
    operation = Math.random() > 0.5 ? '+' : '-';
    if (operation === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    answer = operation === '+' ? num1 + num2 : num1 - num2;
    display = `${num1} ${operation} ${num2}`;
    visualAid = num1; 
  } else if (diff === 'medium') {
    num1 = Math.floor(Math.random() * 12) + 1;
    num2 = Math.floor(Math.random() * 12) + 1;
    operation = Math.random() > 0.5 ? '×' : '÷';
    if (operation === '÷') {
      answer = num1;
      num1 = num1 * num2;
    } else {
      answer = num1 * num2;
    }
    display = `${num1} ${operation} ${num2}`;
  } else {
    // Hard
    num1 = Math.floor(Math.random() * 30) + 10;
    num2 = Math.floor(Math.random() * 20) + 5;
    const ops = ['+', '-', '×'];
    operation = ops[Math.floor(Math.random() * ops.length)];
    if (operation === '+') answer = num1 + num2;
    else if (operation === '-') answer = num1 - num2;
    else answer = num1 * num2;
    display = `${num1} ${operation} ${num2}`;
  }

  return { display, answer, visualAid };
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, { name: string; time: number | null; questions: number; color: string; xp: number }> = {
  easy: { name: 'Easy Explorer', time: null, questions: 10, color: 'bg-green-500', xp: 1 },
  medium: { name: 'Space Cadet', time: 20, questions: 10, color: 'bg-blue-500', xp: 1.5 },
  hard: { name: 'Galaxy Master', time: 10, questions: 10, color: 'bg-purple-500', xp: 2 }
};
