"use client";

import type { Cell } from "@/lib/types";
import CategoryInput from "@/components/editor/CategoryInput";
import RowPointInput from "@/components/editor/RowPointInput";
import CellButton from "@/components/editor/CellButton";
import { createEmptyCell, getCellKey } from "@/lib/utils/cellHelpers";

type BoardGridProps = {
  categories: string[];
  pointValues: number[];
  cells: Record<string, Cell>;
  rows: number;
  cols: number;
  onCategoryChange: (col: number, value: string) => void;
  onPointChange: (row: number, value: number) => void;
  onCellClick: (row: number, col: number) => void;
};

const BoardGrid = ({
  categories,
  pointValues,
  cells,
  rows,
  cols,
  onCategoryChange,
  onPointChange,
  onCellClick,
}: BoardGridProps) => {
  const rowIndexes = Array.from({ length: rows }, (_, idx) => idx);
  const colIndexes = Array.from({ length: cols }, (_, idx) => idx);
  const gridTemplate = `120px repeat(${cols}, minmax(150px, 1fr))`;
  return (
    <div className="board-editor">
      <div className="board-row board-header" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="board-corner" />
        {colIndexes.map((col) => (
          <div className="board-header-cell" key={`cat-${col}`}>
            <CategoryInput
              value={categories[col] ?? ""}
              onChange={(value) => onCategoryChange(col, value)}
            />
          </div>
        ))}
      </div>
      {rowIndexes.map((rowIdx) => (
        <div
          className="board-row"
          key={`row-${rowIdx}`}
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <RowPointInput
            value={pointValues[rowIdx] ?? 0}
            onChange={(value) => onPointChange(rowIdx, value)}
          />
          {colIndexes.map((colIdx) => {
            const cell = cells[getCellKey(rowIdx, colIdx)] ?? createEmptyCell();
            return (
              <CellButton
                key={`cell-${rowIdx}-${colIdx}`}
                cell={cell}
                label={`$${pointValues[rowIdx] ?? 0}`}
                onClick={() => onCellClick(rowIdx, colIdx)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BoardGrid;
