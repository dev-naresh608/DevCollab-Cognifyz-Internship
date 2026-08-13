import api from "../configs/api.config.js";

export const memberApi = {
  getMembers: async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/members`);
    return data;
  },

  addMember: async (workspaceId, payload) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/members`, payload);
    return data;
  },

  updateMemberRole: async (workspaceId, userId, roleId) => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, {
      roleId,
    });
    return data;
  },

  removeMember: async (workspaceId, userId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return data;
  },
};
