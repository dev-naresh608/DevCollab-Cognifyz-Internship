import React from "react";

export const Avatar = ({ name = "User", size = "md" }) => {
  const getInitials = (str) => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-200 font-semibold flex items-center justify-center select-none`}
    >
      {getInitials(name)}
    </div>
  );
};
