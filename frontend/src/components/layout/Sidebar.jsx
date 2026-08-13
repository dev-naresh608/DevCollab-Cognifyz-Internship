import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Building2,
  Settings,
  Plus,
  FolderGit2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Avatar } from "../common/Avatar.jsx";
import { Badge } from "../common/Badge.jsx";

export const Sidebar = ({ onOpenCreateWs, mobileOpen, setMobileOpen }) => {
  const {
    organizations,
    selectedOrg,
    selectOrganization,
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    userRole,
  } = useWorkspaceContext();

  const { user, logout } = useAuth();

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/app" },
    { label: "Members", icon: Users, path: "/app/members" },
    { label: "Roles", icon: ShieldAlert, path: "/app/roles" },
    { label: "Organizations", icon: Building2, path: "/app/organizations" },
    { label: "Settings", icon: Settings, path: "/app/settings" },
  ];

  const content = (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full select-none text-left">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-100 leading-none">DevCollab</h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-wide">COLLABORATION SAAS</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Organization Switcher */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 block mb-1.5">
            Organization Context
          </label>
          <div className="relative">
            <select
              value={selectedOrg?.id || ""}
              onChange={(e) => {
                const found = organizations.find((o) => o.id === e.target.value);
                if (found) selectOrganization(found);
              }}
              className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
            >
              {organizations.length === 0 ? (
                <option value="">No organizations</option>
              ) : (
                organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Workspace Switcher */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Workspace Context
            </label>
            <button
              onClick={onOpenCreateWs}
              title="Create Workspace"
              className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="relative">
            <select
              value={selectedWorkspace?.id || ""}
              onChange={(e) => {
                const found = workspaces.find((w) => w.id === e.target.value);
                if (found) selectWorkspace(found);
              }}
              disabled={workspaces.length === 0}
              className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 appearance-none pr-8 disabled:opacity-50 cursor-pointer"
            >
              {workspaces.length === 0 ? (
                <option value="">No active workspaces</option>
              ) : (
                workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.slug})
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 block mb-1.5">
            Navigation
          </label>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/app"}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-950/70 text-indigo-300 border border-indigo-800/40"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-gray-800 bg-gray-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar name={`${user?.first_name || ""} ${user?.last_name || ""}`} size="sm" />
            <div className="truncate text-left">
              <div className="text-xs font-medium text-gray-200 truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-[10px] text-gray-400 truncate">@{user?.username}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-rose-400 rounded-md hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {userRole && (
          <div className="mt-2 pt-2 border-t border-gray-800/60 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Workspace Role:</span>
            <Badge variant="indigo">{userRole.name}</Badge>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">{content}</div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
