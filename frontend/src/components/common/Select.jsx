import React from "react";

export const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      required = false,
      placeholder = "Select an option",
      className = "",
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-gray-900 border ${
            error ? "border-rose-500" : "border-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
          } rounded-md px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 transition-colors ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
