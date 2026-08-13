import React from "react";
import { Menu, Building2, FolderGit2, Shield } from "lucide-react";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";
import { Badge } from "../common/Badge.jsx";

export const Topbar = ({ onToggleMobile }) => {
  const { selectedOrg, selectedWorkspace, userRole } = useWorkspaceContext();

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur-xs border-b border-gray-800 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-1.5 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Context */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-gray-200 font-semibold">{selectedOrg?.name || "No Organization"}</span>
          </div>
          <span className="text-gray-600">/</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 font-semibold">
              {selectedWorkspace ? selectedWorkspace.name : "Select Workspace"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userRole && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/80 border border-gray-700/60 rounded-md text-xs">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-400">Role:</span>
            <span className="text-gray-100 font-medium">{userRole.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};
