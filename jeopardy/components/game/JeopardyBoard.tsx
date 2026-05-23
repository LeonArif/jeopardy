"use client";

import type { GameTemplate, Session } from "@/lib/types";
import GameCell from "@/components/game/GameCell";
import { createEmptyCell, getCellKey } from "@/lib/utils/cellHelpers";

type JeopardyBoardProps = {
  template: GameTemplate;
  session: Session;
  onCellClick?: (row: number, col: number, currentState: string) => void;
};

const JeopardyBoard = ({ template, session, onCellClick }: JeopardyBoardProps) => {
  const rowIndexes = Array.from({ length: template.rows }, (_, idx) => idx);
  const colIndexes = Array.from({ length: template.cols }, (_, idx) => idx);
  const gridTemplate = `120px repeat(${template.cols}, minmax(150px, 1fr))`;
  return (
    <div className="board-live">
      <div className="board-row board-header" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="board-corner" />
        {colIndexes.map((col) => (
          <div className="board-header-cell" key={`cat-${col}`}>
            {template.categories[col] || "Untitled"}
          </div>
        ))}
      </div>
      {rowIndexes.map((rowIdx) => (
        <div
          className="board-row"
          key={`row-${rowIdx}`}
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="board-point">${template.pointValues[rowIdx] ?? 0}</div>
          {colIndexes.map((colIdx) => {
            const key = getCellKey(rowIdx, colIdx);
            const cell = template.cells[key] ?? createEmptyCell();
            const state = session.cellStates[key] ?? "hidden";
            return (
              <GameCell
                key={key}
                cell={cell}
                state={state}
                label={`$${template.pointValues[rowIdx] ?? 0}`}
                onClick={
                  onCellClick
                    ? () => onCellClick(rowIdx, colIdx, state)
                    : undefined
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default JeopardyBoard;
