import api from "../configs/api.config.js";

export const roleApi = {
  getRoles: async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/roles`);
    return data;
  },

  getRoleById: async (workspaceId, roleId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/roles/${roleId}`);
    return data;
  },

  createRole: async (workspaceId, roleData) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/roles`, roleData);
    return data;
  },

  updateRole: async (workspaceId, roleId, roleData) => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/roles/${roleId}`, roleData);
    return data;
  },

  deleteRole: async (workspaceId, roleId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/roles/${roleId}`);
    return data;
  },

  getRolePermissions: async (workspaceId, roleId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/roles/${roleId}/permissions`);
    return data;
  },

  updateRolePermissions: async (workspaceId, roleId, permissionIds) => {
    const { data } = await api.put(`/workspaces/${workspaceId}/roles/${roleId}/permissions`, {
      permissionIds,
    });
    return data;
  },
};
