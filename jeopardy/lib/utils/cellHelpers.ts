import type { Cell } from "@/lib/types";

export const createEmptyCell = (): Cell => ({
  question: { text: null, imageUrl: null, videoUrl: null },
  answer: { text: null, imageUrl: null, videoUrl: null },
  isFilled: false,
});

export const isCellFilled = (cell: Cell): boolean => {
  const question = cell.question.text?.trim();
  const answer = cell.answer.text?.trim();
  const hasQuestion = Boolean(question || cell.question.imageUrl || cell.question.videoUrl);
  const hasAnswer = Boolean(answer || cell.answer.imageUrl || cell.answer.videoUrl);
  return hasQuestion && hasAnswer;
};

export const getCellKey = (row: number, col: number): string => `${row}-${col}`;

export const buildEmptyCells = (rows: number, cols: number): Record<string, Cell> => {
  const cells: Record<string, Cell> = {};
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells[getCellKey(row, col)] = createEmptyCell();
    }
  }
  return cells;
};

export const isBoardComplete = (
  cells: Record<string, Cell>,
  rows: number,
  cols: number
): boolean => {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = cells[getCellKey(row, col)];
      if (!cell || !isCellFilled(cell)) {
        return false;
      }
    }
  }
  return true;
};
