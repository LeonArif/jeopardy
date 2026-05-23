"use client";

import type { ChangeEvent } from "react";

type CategoryInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const CategoryInput = ({ value, onChange }: CategoryInputProps) => {
  return (
    <input
      className="input input-compact"
      placeholder="Category"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
    />
  );
};

export default CategoryInput;
