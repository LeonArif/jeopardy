"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost" | "danger" | "soft";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn btn-primary",
  ghost: "btn btn-ghost",
  danger: "btn btn-danger",
  soft: "btn btn-soft",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "btn-sm",
  md: "btn-md",
};

const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    />
  );
};

export default Button;
