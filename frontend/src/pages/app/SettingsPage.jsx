import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Settings, FolderGit2, AlertTriangle, Archive, Save } from "lucide-react";
import { workspaceApi } from "../../services/workspace.api.js";
import { fetchWorkspaces } from "../../store/slices/workspaceSlice.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const { selectedOrg, selectedWorkspace } = useSelector(
    (state) => state.workspace
  );
  const { hasPermission } = usePermissions();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedWorkspace) {
      setName(selectedWorkspace.name);
      setSlug(selectedWorkspace.slug);
    }
  }, [selectedWorkspace?.id]);

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const res = await workspaceApi.updateWorkspace(selectedWorkspace.id, {
        name,
        slug,
      });

      if (res.success) {
        await dispatch(fetchWorkspaces(selectedOrg.id));
        setMessage({ type: "success", text: "Workspace updated successfully." });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update workspace." });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Permission denied / server error updating workspace.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate this workspace?")) return;
    try {
      const res = await workspaceApi.deactivateWorkspace(selectedWorkspace.id);
      if (res.success) {
        await dispatch(fetchWorkspaces(selectedOrg.id));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate workspace.");
    }
  };

  if (!selectedWorkspace) {
    return (
      <EmptyState
        icon={Settings}
        title="No Workspace Selected"
        description="Select a workspace from the sidebar to manage settings."
      />
    );
  }

  return (
    <div className="max-w-3xl space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" /> Workspace Settings
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure attributes for workspace "{selectedWorkspace.name}".
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-md border text-xs ${
            message.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
              : "bg-rose-950/80 border-rose-800 text-rose-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" /> General Attributes
          </h3>
          <Badge variant="indigo">Workspace ID: {selectedWorkspace.id}</Badge>
        </div>

        <form onSubmit={handleUpdateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            value={name}
            required
            disabled={!hasPermission("workspace:update")}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Workspace Slug"
            value={slug}
            required
            disabled={!hasPermission("workspace:update")}
            onChange={(e) => setSlug(e.target.value)}
            helperText="Unique identifier within organization."
          />

          {hasPermission("workspace:update") && (
            <div className="pt-2 flex justify-end">
              <Button type="submit" loading={loading}>
                <Save className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      {hasPermission("workspace:delete") && (
        <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Danger Zone
          </h3>
          <p className="text-xs text-gray-400">
            Deactivating this workspace will soft-delete it (`is_active = false`). Only users with `workspace:restore` capability will be able to restore it.
          </p>

          <div className="pt-2 flex justify-end">
            <Button variant="danger" onClick={handleDeactivate}>
              <Archive className="w-4 h-4 mr-1" /> Deactivate Workspace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
