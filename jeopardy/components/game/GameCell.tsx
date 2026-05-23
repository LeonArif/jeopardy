"use client";

import type { Cell, CellState } from "@/lib/types";

type GameCellProps = {
  cell: Cell;
  state: CellState;
  label: string;
  onClick?: () => void;
};

const GameCell = ({ cell, state, label, onClick }: GameCellProps) => {
  const renderBody = () => {
    if (state === "hidden") {
      return <span>{label}</span>;
    }
    const data = state === "question" ? cell.question : cell.answer;
    const text = data.text || (state === "question" ? "(No question)" : "(No answer)");
    return (
      <div>
        <div>{text}</div>
        {data.imageUrl ? (
          <img className="cell-media" src={data.imageUrl} alt="media" />
        ) : null}
        {data.videoUrl ? (
          <a className="cell-media-link" href={data.videoUrl} target="_blank" rel="noreferrer">
            Open video
          </a>
        ) : null}
      </div>
    );
  };

  return (
    <button
      type="button"
      className={`game-cell state-${state}`}
      onClick={onClick}
      disabled={!onClick}
    >
      {renderBody()}
    </button>
  );
};

export default GameCell;
