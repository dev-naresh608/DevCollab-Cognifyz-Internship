import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { Modal } from "../common/Modal.jsx";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";
import { workspaceApi } from "../../services/workspace.api.js";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    selectedOrg,
    refreshWorkspaces,
    selectWorkspace,
  } = useWorkspaceContext();

  // Create Workspace Modal state
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsSlug, setWsSlug] = useState("");
  const [wsError, setWsError] = useState("");
  const [wsLoading, setWsLoading] = useState(false);

  // Handle Workspace Creation
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setWsError("");
    setWsLoading(true);

    if (!selectedOrg?.id) {
      setWsError("Please select an organization first.");
      setWsLoading(false);
      return;
    }

    try {
      const res = await workspaceApi.createWorkspace({
        organizationId: selectedOrg.id,
        name: wsName,
        slug: wsSlug,
      });

      if (res.success && res.workspace) {
        await refreshWorkspaces();
        selectWorkspace(res.workspace);
        setCreateWsOpen(false);
        setWsName("");
        setWsSlug("");
      } else {
        setWsError(res.message || "Failed to create workspace.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setWsError(err.response.data.message);
      } else {
        setWsError("Server error. Note: Only Organization Owners can create workspaces.");
      }
    } finally {
      setWsLoading(false);
    }
  };

  // Helper slug generator
  const autoSlug = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onOpenCreateWs={() => setCreateWsOpen(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modal: Create Workspace */}
      <Modal
        isOpen={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
        title="Create Workspace"
        description={`New workspace in ${selectedOrg?.name || "selected organization"}. Only organization owners can create workspaces.`}
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          {wsError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {wsError}
            </div>
          )}
          <Input
            label="Workspace Name"
            placeholder="e.g. Backend Team"
            value={wsName}
            required
            onChange={(e) => {
              setWsName(e.target.value);
              setWsSlug(autoSlug(e.target.value));
            }}
          />
          <Input
            label="Workspace Slug"
            placeholder="e.g. backend-team"
            value={wsSlug}
            required
            onChange={(e) => setWsSlug(e.target.value)}
            helperText="Unique within organization."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setCreateWsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={wsLoading}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
