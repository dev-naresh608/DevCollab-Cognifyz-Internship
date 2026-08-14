import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Building2,
  FolderGit2,
  ShieldCheck,
  Users,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions.js";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export const DashboardPage = () => {
  const { selectedOrg, selectedWorkspace, userRole } = useSelector(
    (state) => state.workspace
  );
  const { userPermissions, hasPermission } = usePermissions();

  if (!selectedOrg) {
    return (
      <EmptyState
        icon={Building2}
        title="No Organization Selected"
        description="Select an existing organization from the sidebar or create a new organization to get started."
      />
    );
  }

  if (!selectedWorkspace) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No Active Workspace Selected"
        description={`Organization "${selectedOrg.name}" has no active workspace selected. Select or create a workspace to view details.`}
      />
    );
  }

  const allSystemPermissions = [
    { name: "workspace:read", label: "Read Workspace Info" },
    { name: "workspace:update", label: "Update Workspace Settings" },
    { name: "workspace:delete", label: "Deactivate Workspace" },
    { name: "workspace:restore", label: "Restore Workspace" },
    { name: "member:read", label: "View Members" },
    { name: "member:invite", label: "Invite Members" },
    { name: "member:update", label: "Update Member Roles" },
    { name: "member:remove", label: "Remove Members" },
    { name: "role:read", label: "View Workspace Roles" },
    { name: "role:create", label: "Create Roles" },
    { name: "role:update", label: "Update Roles & Permissions" },
    { name: "role:delete", label: "Delete Roles" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Overview Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <Building2 className="w-3.5 h-3.5" /> {selectedOrg.name} ({selectedOrg.slug})
          </div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            {selectedWorkspace.name}
            <Badge variant="indigo">{selectedWorkspace.slug}</Badge>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Created on {new Date(selectedWorkspace.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-800">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Your Assigned Role</div>
            <div className="text-sm font-bold text-gray-100">{userRole?.name || "Member"}</div>
          </div>
        </div>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/app/members"
          className="p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200 mt-4">Workspace Members</h3>
          <p className="text-xs text-gray-400 mt-1">Manage team access and assign workspace roles.</p>
        </Link>

        <Link
          to="/app/roles"
          className="p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200 mt-4">Roles & Permissions</h3>
          <p className="text-xs text-gray-400 mt-1">Configure workspace RBAC rules and permissions.</p>
        </Link>

        <Link
          to="/app/settings"
          className="p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200 mt-4">Workspace Settings</h3>
          <p className="text-xs text-gray-400 mt-1">View and manage workspace status and attributes.</p>
        </Link>
      </div>

      {/* Granted Permissions Audit Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-100">Granted Workspace Permissions</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Effective permissions evaluated by the backend for role "{userRole?.name || "Member"}"
            </p>
          </div>
          <Badge variant="indigo">{userPermissions.length} Active Capabilities</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allSystemPermissions.map((perm) => {
            const isGranted = hasPermission(perm.name);
            return (
              <div
                key={perm.name}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  isGranted
                    ? "bg-indigo-950/40 border-indigo-800/40 text-indigo-200"
                    : "bg-gray-950/40 border-gray-800/60 text-gray-500 opacity-60"
                }`}
              >
                <div>
                  <div className="font-semibold">{perm.label}</div>
                  <div className="font-mono text-[10px] mt-0.5">{perm.name}</div>
                </div>
                {isGranted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
