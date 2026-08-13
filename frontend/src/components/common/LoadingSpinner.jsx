import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ label = "Loading...", fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
