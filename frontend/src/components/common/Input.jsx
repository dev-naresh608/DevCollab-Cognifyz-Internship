import React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-gray-900 border ${
            error ? "border-rose-500 focus:ring-rose-500" : "border-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
          } rounded-md px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
