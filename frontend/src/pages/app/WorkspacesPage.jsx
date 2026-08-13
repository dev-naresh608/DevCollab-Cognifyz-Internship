import React, { useState, useEffect } from "react";
import { FolderGit2, Edit2, Archive, RefreshCw, Plus } from "lucide-react";
import { workspaceApi } from "../../services/workspace.api.js";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export const WorkspacesPage = () => {
  const {
    selectedOrg,
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    refreshWorkspaces,
  } = useWorkspaceContext();

  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState("active");
  const [inactiveWorkspaces, setInactiveWorkspaces] = useState([]);
  const [loadingInactive, setLoadingInactive] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWs, setEditingWs] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchInactiveWorkspaces = async () => {
    if (!selectedOrg?.id) return;
    setLoadingInactive(true);
    try {
      const res = await workspaceApi.getInactiveWorkspaces(selectedOrg.id);
      if (res.success && res.workspaces) {
        setInactiveWorkspaces(res.workspaces);
      }
    } catch (err) {
      console.error("Failed to fetch inactive workspaces", err);
    } finally {
      setLoadingInactive(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inactive") {
      fetchInactiveWorkspaces();
    }
  }, [activeTab, selectedOrg?.id]);

  const handleOpenEdit = (ws) => {
    setEditingWs(ws);
    setEditName(ws.name);
    setEditSlug(ws.slug);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      const res = await workspaceApi.updateWorkspace(editingWs.id, {
        name: editName,
        slug: editSlug,
      });

      if (res.success) {
        await refreshWorkspaces();
        setEditModalOpen(false);
      } else {
        setEditError(res.message || "Failed to update workspace.");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "Error updating workspace.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this workspace?")) return;
    try {
      const res = await workspaceApi.deactivateWorkspace(id);
      if (res.success) {
        await refreshWorkspaces();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Permission denied / error deactivating workspace.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await workspaceApi.restoreWorkspace(id);
      if (res.success) {
        await refreshWorkspaces();
        await fetchInactiveWorkspaces();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore workspace.");
    }
  };

  if (!selectedOrg) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No Organization Selected"
        description="Select an organization from the sidebar to view its workspaces."
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" /> Workspaces in {selectedOrg.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Isolated team workspaces with role-based access control.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "active" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Active ({workspaces.length})
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "inactive" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Archived / Inactive
          </button>
        </div>
      </div>

      {/* Active Workspaces */}
      {activeTab === "active" && (
        <>
          {workspaces.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No Active Workspaces"
              description={`There are no active workspaces in ${selectedOrg.name}. Organization owners can create a new workspace.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws) => {
                const isSelected = selectedWorkspace?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    className={`bg-gray-900 border rounded-xl p-5 space-y-4 transition-all ${
                      isSelected
                        ? "border-indigo-500 shadow-indigo-950/30 shadow-lg"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-100">{ws.name}</h3>
                        <span className="text-xs font-mono text-indigo-400">slug: {ws.slug}</span>
                      </div>
                      <Badge variant={isSelected ? "indigo" : "default"}>
                        {isSelected ? "Active Context" : "Active"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-400">
                      Created: {new Date(ws.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      {!isSelected && (
                        <Button size="sm" variant="outline" onClick={() => selectWorkspace(ws)}>
                          Select
                        </Button>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        {hasPermission("workspace:update") && (
                          <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(ws)}>
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                        )}
                        {hasPermission("workspace:delete") && (
                          <Button size="sm" variant="ghost" onClick={() => handleDeactivate(ws.id)}>
                            <Archive className="w-3.5 h-3.5 text-rose-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inactive Workspaces */}
      {activeTab === "inactive" && (
        <>
          {loadingInactive ? (
            <LoadingSpinner label="Loading archived workspaces..." />
          ) : inactiveWorkspaces.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No Inactive Workspaces"
              description="There are no deactivated workspaces in this organization."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveWorkspaces.map((ws) => (
                <div key={ws.id} className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-300">{ws.name}</h3>
                      <span className="text-xs font-mono text-gray-500">slug: {ws.slug}</span>
                    </div>
                    <Badge variant="warning">Inactive</Badge>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-gray-800">
                    {hasPermission("workspace:restore") && (
                      <Button size="sm" variant="secondary" onClick={() => handleRestore(ws.id)}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Workspace Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Workspace"
        description="Update workspace attributes."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {editError}
            </div>
          )}
          <Input
            label="Workspace Name"
            value={editName}
            required
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Workspace Slug"
            value={editSlug}
            required
            onChange={(e) => setEditSlug(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
