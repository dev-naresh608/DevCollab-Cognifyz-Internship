import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-sm border border-indigo-500/30",
    secondary:
      "bg-gray-800 hover:bg-gray-700 text-gray-200 focus:ring-gray-600 border border-gray-700",
    outline:
      "bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700 focus:ring-gray-600",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-sm border border-rose-500/30",
    ghost:
      "bg-transparent hover:bg-gray-800/60 text-gray-400 hover:text-gray-200 focus:ring-gray-700",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
