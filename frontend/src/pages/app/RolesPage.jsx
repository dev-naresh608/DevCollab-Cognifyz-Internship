import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldAlert, Plus, Edit2, Trash2, Key, Check, ShieldCheck } from "lucide-react";
import { roleApi } from "../../services/role.api.js";
import { permissionApi } from "../../services/permission.api.js";
import { fetchWorkspacePermissions } from "../../store/slices/workspaceSlice.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export const RolesPage = () => {
  const dispatch = useDispatch();
  const { selectedWorkspace } = useSelector((state) => state.workspace);
  const { hasPermission } = usePermissions();

  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create Role Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Role Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Permission Matrix Modal
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [matrixRole, setMatrixRole] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [matrixError, setMatrixError] = useState("");
  const [matrixLoading, setMatrixLoading] = useState(false);

  const fetchRolesAndPermissions = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.getRoles(selectedWorkspace.id),
        permissionApi.getPermissions(),
      ]);

      if (rolesRes.success && rolesRes.roles) {
        setRoles(rolesRes.roles);
      }
      if (permsRes.success && permsRes.permissions) {
        setAllPermissions(permsRes.permissions);
      }
    } catch (err) {
      console.error("Failed to load roles/permissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, [selectedWorkspace?.id]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);

    try {
      const res = await roleApi.createRole(selectedWorkspace.id, {
        name: roleName,
        description: roleDesc,
      });

      if (res.success) {
        await fetchRolesAndPermissions();
        setCreateModalOpen(false);
        setRoleName("");
        setRoleDesc("");
      } else {
        setCreateError(res.message || "Failed to create role.");
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Error creating role.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      const res = await roleApi.updateRole(selectedWorkspace.id, editingRole.id, {
        name: editName,
        description: editDesc,
      });

      if (res.success) {
        await fetchRolesAndPermissions();
        setEditModalOpen(false);
      } else {
        setEditError(res.message || "Failed to update role.");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "Error updating role.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteRole = async (roleId, name) => {
    if (name === "Admin") {
      alert("The default Admin role is system-protected and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role "${name}"?`)) return;
    try {
      const res = await roleApi.deleteRole(selectedWorkspace.id, roleId);
      if (res.success) {
        await fetchRolesAndPermissions();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleOpenPermissions = async (role) => {
    setMatrixRole(role);
    setMatrixError("");
    try {
      const res = await roleApi.getRolePermissions(selectedWorkspace.id, role.id);
      if (res.success && res.permissions) {
        setSelectedPermIds(res.permissions.map((p) => p.id));
      } else {
        setSelectedPermIds([]);
      }
      setMatrixModalOpen(true);
    } catch (err) {
      alert("Failed to load role permissions.");
    }
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    setMatrixError("");
    setMatrixLoading(true);

    try {
      const res = await roleApi.updateRolePermissions(
        selectedWorkspace.id,
        matrixRole.id,
        selectedPermIds
      );

      if (res.success) {
        await fetchRolesAndPermissions();
        await dispatch(fetchWorkspacePermissions(selectedWorkspace.id));
        setMatrixModalOpen(false);
      } else {
        setMatrixError(res.message || "Failed to update permissions.");
      }
    } catch (err) {
      setMatrixError(err.response?.data?.message || "Error saving permissions.");
    } finally {
      setMatrixLoading(false);
    }
  };

  const togglePermId = (id) => {
    if (matrixRole?.name === "Admin") return; // Admin permissions cannot be unchecked
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Group permissions by category (Workspace, Member, Role, etc.)
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const category = perm.name.split(":")[0].toUpperCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  if (!selectedWorkspace) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No Workspace Selected"
        description="Select a workspace from the sidebar to manage its roles."
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" /> Roles & Permissions in {selectedWorkspace.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Workspace-specific roles and fixed backend permissions.
          </p>
        </div>

        {hasPermission("role:create") && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Role
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading workspace roles..." />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Roles Found"
          description="There are no roles defined in this workspace."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isAdminRole = role.name === "Admin";
            return (
              <div key={role.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-100 flex items-center gap-1.5">
                      {role.name} {isAdminRole && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{role.description || "No description provided."}</p>
                  </div>
                  {isAdminRole ? (
                    <Badge variant="emerald">System Admin</Badge>
                  ) : (
                    <Badge variant="indigo">Custom Role</Badge>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                  {hasPermission("role:update") && (
                    <Button size="sm" variant="outline" onClick={() => handleOpenPermissions(role)}>
                      <Key className="w-3.5 h-3.5 mr-1" /> {isAdminRole ? "View Permissions" : "Permissions"}
                    </Button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {hasPermission("role:update") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingRole(role);
                          setEditName(role.name);
                          setEditDesc(role.description || "");
                          setEditError("");
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {hasPermission("role:delete") && !isAdminRole && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteRole(role.id, role.name)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Role */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Workspace Role"
        description="Role names are unique within this workspace."
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {createError}
            </div>
          )}
          <Input
            label="Role Name"
            placeholder="e.g. Lead Reviewer"
            value={roleName}
            required
            onChange={(e) => setRoleName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Optional description"
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Role */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Workspace Role"
        description="Update role attributes."
      >
        <form onSubmit={handleEditRole} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {editError}
            </div>
          )}
          <Input
            label="Role Name"
            value={editName}
            required
            disabled={editingRole?.name === "Admin"}
            onChange={(e) => setEditName(e.target.value)}
            helperText={editingRole?.name === "Admin" ? "Default Admin role name cannot be changed." : ""}
          />
          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
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

      {/* Modal: Manage Permissions Matrix */}
      <Modal
        isOpen={matrixModalOpen}
        onClose={() => setMatrixModalOpen(false)}
        title={`Permissions Matrix for ${matrixRole?.name}`}
        description={
          matrixRole?.name === "Admin"
            ? "The default Admin role is system-protected and retains full workspace permissions."
            : "Check permissions to assign to this custom role."
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePermissions} className="space-y-6">
          {matrixError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {matrixError}
            </div>
          )}

          {matrixRole?.name === "Admin" && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-md flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              The default Admin role automatically retains all workspace permissions to prevent lockouts.
            </div>
          )}

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {Object.keys(groupedPermissions).map((category) => (
              <div key={category} className="border border-gray-800 rounded-lg p-4 bg-gray-950/40">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  {category} PERMISSIONS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {groupedPermissions[category].map((perm) => {
                    const isChecked = matrixRole?.name === "Admin" || selectedPermIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        onClick={() => togglePermId(perm.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-md border select-none transition-colors ${
                          matrixRole?.name === "Admin"
                            ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200 cursor-not-allowed"
                            : isChecked
                            ? "bg-indigo-950/60 border-indigo-800/80 text-indigo-200 cursor-pointer"
                            : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "border-gray-700 bg-gray-900"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{perm.name}</div>
                          <div className="text-[11px] text-gray-400">{perm.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setMatrixModalOpen(false)}>
              Close
            </Button>
            {matrixRole?.name !== "Admin" && (
              <Button type="submit" loading={matrixLoading}>
                Save Permissions
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
