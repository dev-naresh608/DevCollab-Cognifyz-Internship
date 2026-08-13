import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2, Edit3, ShieldCheck } from "lucide-react";
import { memberApi } from "../../services/member.api.js";
import { roleApi } from "../../services/role.api.js";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { Avatar } from "../../components/common/Avatar.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export const MembersPage = () => {
  const { selectedWorkspace } = useWorkspaceContext();
  const { hasPermission } = usePermissions();

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Change Role Modal
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [changeRoleError, setChangeRoleError] = useState("");
  const [changeRoleLoading, setChangeRoleLoading] = useState(false);

  const fetchMembersAndRoles = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        memberApi.getMembers(selectedWorkspace.id),
        roleApi.getRoles(selectedWorkspace.id),
      ]);

      if (membersRes.success && membersRes.members) {
        setMembers(membersRes.members);
      }
      if (rolesRes.success && rolesRes.roles) {
        setRoles(rolesRes.roles);
      }
    } catch (err) {
      console.error("Failed to load workspace members/roles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndRoles();
  }, [selectedWorkspace?.id]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteLoading(true);

    try {
      const res = await memberApi.addMember(selectedWorkspace.id, {
        userId: inviteUserId,
        roleId: inviteRoleId,
      });

      if (res.success) {
        await fetchMembersAndRoles();
        setInviteModalOpen(false);
        setInviteUserId("");
        setInviteRoleId("");
      } else {
        setInviteError(res.message || "Failed to add member to workspace.");
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || "Failed to add workspace member.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleChangeRoleSubmit = async (e) => {
    e.preventDefault();
    setChangeRoleError("");
    setChangeRoleLoading(true);

    try {
      const res = await memberApi.updateMemberRole(
        selectedWorkspace.id,
        selectedMember.user_id,
        newRoleId
      );

      if (res.success) {
        await fetchMembersAndRoles();
        setChangeRoleModalOpen(false);
      } else {
        setChangeRoleError(res.message || "Failed to update role.");
      }
    } catch (err) {
      setChangeRoleError(err.response?.data?.message || "Error updating role.");
    } finally {
      setChangeRoleLoading(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      const res = await memberApi.removeMember(selectedWorkspace.id, userId);
      if (res.success) {
        await fetchMembersAndRoles();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove workspace member.");
    }
  };

  if (!selectedWorkspace) {
    return (
      <EmptyState
        icon={Users}
        title="No Workspace Selected"
        description="Select a workspace from the sidebar to view its members."
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Members of {selectedWorkspace.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage workspace access and assign role capabilities.
          </p>
        </div>

        {hasPermission("member:invite") && (
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading workspace members..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Members Found"
          description="This workspace has no members assigned."
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950/80 text-gray-400 font-mono uppercase tracking-wider text-[10px] border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {members.map((member) => {
                  const fullName = `${member.first_name || ""} ${member.last_name || ""}`;
                  const isOrgOwner = member.is_owner;
                  return (
                    <tr key={member.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} size="sm" />
                          <div>
                            <div className="font-semibold text-gray-100 flex items-center gap-1.5">
                              {fullName} {isOrgOwner && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <div className="text-gray-400 text-[11px]">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-gray-400">@{member.username}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="indigo">
                            <Shield className="w-3 h-3 mr-1" /> {member.role_name || "No Role"}
                          </Badge>
                          {isOrgOwner && <Badge variant="emerald">Org Owner</Badge>}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-400">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOrgOwner ? (
                            <span className="text-[11px] text-gray-400 italic">Protected Owner</span>
                          ) : (
                            <>
                              {hasPermission("member:update") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setNewRoleId(member.role_id || "");
                                    setChangeRoleError("");
                                    setChangeRoleModalOpen(true);
                                  }}
                                >
                                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Change Role
                                </Button>
                              )}

                              {hasPermission("member:remove") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(member.user_id, fullName)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Invite/Add Member */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Add Workspace Member"
        description="User must already belong to the organization before joining this workspace."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          {inviteError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {inviteError}
            </div>
          )}

          <Input
            label="User UUID"
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            value={inviteUserId}
            required
            onChange={(e) => setInviteUserId(e.target.value)}
            helperText="Enter the UUID of the registered user."
          />

          <Select
            label="Workspace Role"
            value={inviteRoleId}
            required
            onChange={(e) => setInviteRoleId(e.target.value)}
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
            placeholder="Select a role"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviteLoading}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Role */}
      <Modal
        isOpen={changeRoleModalOpen}
        onClose={() => setChangeRoleModalOpen(false)}
        title="Change Member Role"
        description={`Update workspace role for ${selectedMember?.first_name} ${selectedMember?.last_name}.`}
      >
        <form onSubmit={handleChangeRoleSubmit} className="space-y-4">
          {changeRoleError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {changeRoleError}
            </div>
          )}

          <Select
            label="Workspace Role"
            value={newRoleId}
            required
            onChange={(e) => setNewRoleId(e.target.value)}
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setChangeRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={changeRoleLoading}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
