// src/components/ui/Button.jsx
import React from "react";

const variants = {
  primary:
    "bg-blue-600 text-white shadow-md hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
  secondary:
    "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide transition-all duration-150 outline-none cursor-pointer select-none",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}