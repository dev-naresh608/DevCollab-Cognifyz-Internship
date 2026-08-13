import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button.jsx";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-800 rounded-lg bg-gray-900/40 my-4">
      <div className="p-3 bg-gray-800/80 text-gray-400 rounded-full mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-gray-200">{title}</h4>
      {description && (
        <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
