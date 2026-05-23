"use client";

import type { ChangeEvent } from "react";

type RowPointInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const RowPointInput = ({ value, onChange }: RowPointInputProps) => {
  return (
    <input
      className="input input-compact"
      type="number"
      min={0}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(Number(event.target.value))
      }
    />
  );
};

export default RowPointInput;
