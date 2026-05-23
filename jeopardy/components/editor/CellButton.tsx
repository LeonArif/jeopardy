"use client";

import type { Cell } from "@/lib/types";

type CellButtonProps = {
  cell: Cell;
  label: string;
  onClick: () => void;
};

const CellButton = ({ cell, label, onClick }: CellButtonProps) => {
  return (
    <button
      type="button"
      className={`cell-btn ${cell.isFilled ? "cell-filled" : "cell-empty"}`}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
};

export default CellButton;
