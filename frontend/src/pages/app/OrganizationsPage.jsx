import React, { useState, useEffect } from "react";
import { Building2, Edit2, Archive, RefreshCw } from "lucide-react";
import { organizationApi } from "../../services/organization.api.js";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export const OrganizationsPage = () => {
  const { organizations, selectedOrg, selectOrganization, refreshOrganizations } =
    useWorkspaceContext();

  const [activeTab, setActiveTab] = useState("active"); // "active" or "inactive"
  const [inactiveOrgs, setInactiveOrgs] = useState([]);
  const [loadingInactive, setLoadingInactive] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Fetch Inactive Orgs when switching tabs
  const fetchInactive = async () => {
    setLoadingInactive(true);
    try {
      const res = await organizationApi.getInactiveOrganizations();
      if (res.success && res.organizations) {
        setInactiveOrgs(res.organizations);
      }
    } catch (err) {
      console.error("Failed to fetch inactive orgs", err);
    } finally {
      setLoadingInactive(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inactive") {
      fetchInactive();
    }
  }, [activeTab]);

  const handleOpenEdit = (org) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditSlug(org.slug);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      const res = await organizationApi.updateOrganization(editingOrg.id, {
        name: editName,
        slug: editSlug,
      });

      if (res.success) {
        await refreshOrganizations();
        setEditModalOpen(false);
      } else {
        setEditError(res.message || "Failed to update organization.");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "Error updating organization.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this organization?")) return;
    try {
      const res = await organizationApi.deactivateOrganization(id);
      if (res.success) {
        await refreshOrganizations();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate organization.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await organizationApi.restoreOrganization(id);
      if (res.success) {
        await refreshOrganizations();
        await fetchInactive();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore organization.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" /> Organizations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Top-level business boundary for your developer workspaces.
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
            Active ({organizations.length})
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

      {/* Active Tab */}
      {activeTab === "active" && (
        <>
          {organizations.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Active Organizations"
              description="You belong to no active organizations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map((org) => {
                const isSelected = selectedOrg?.id === org.id;
                return (
                  <div
                    key={org.id}
                    className={`bg-gray-900 border rounded-xl p-5 space-y-4 transition-all ${
                      isSelected
                        ? "border-indigo-500 shadow-indigo-950/30 shadow-lg"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-100">{org.name}</h3>
                        <span className="text-xs font-mono text-indigo-400">slug: {org.slug}</span>
                      </div>
                      <Badge variant={isSelected ? "indigo" : "default"}>
                        {isSelected ? "Active Context" : "Active"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-400">
                      Created: {new Date(org.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      {!isSelected && (
                        <Button size="sm" variant="outline" onClick={() => selectOrganization(org)}>
                          Select
                        </Button>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(org)}>
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeactivate(org.id)}>
                          <Archive className="w-3.5 h-3.5 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Inactive Tab */}
      {activeTab === "inactive" && (
        <>
          {loadingInactive ? (
            <LoadingSpinner label="Loading archived organizations..." />
          ) : inactiveOrgs.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No Inactive Organizations"
              description="There are no deactivated organizations owned by you."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveOrgs.map((org) => (
                <div key={org.id} className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-300">{org.name}</h3>
                      <span className="text-xs font-mono text-gray-500">slug: {org.slug}</span>
                    </div>
                    <Badge variant="warning">Inactive</Badge>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-gray-800">
                    <Button size="sm" variant="secondary" onClick={() => handleRestore(org.id)}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Org Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Organization"
        description="Update organization details."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {editError}
            </div>
          )}
          <Input
            label="Organization Name"
            value={editName}
            required
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Organization Slug"
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
