"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

const Input = ({ label, hint, className = "", ...props }: InputProps) => {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <input className={`input ${className}`.trim()} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
};

export default Input;
