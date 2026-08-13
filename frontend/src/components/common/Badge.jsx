import React from "react";

export const Badge = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    indigo: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    danger: "bg-rose-950/80 text-rose-300 border-rose-800/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
