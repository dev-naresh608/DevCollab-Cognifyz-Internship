import api from "../configs/api.config.js";

export const workspaceApi = {
  getWorkspaces: async (organizationId) => {
    const { data } = await api.get(`/workspaces?organizationId=${organizationId}`);
    return data;
  },

  getInactiveWorkspaces: async (organizationId) => {
    const { data } = await api.get(`/workspaces/inactive?organizationId=${organizationId}`);
    return data;
  },

  getWorkspaceById: async (id) => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data;
  },

  createWorkspace: async (workspaceData) => {
    const { data } = await api.post("/workspaces", workspaceData);
    return data;
  },

  updateWorkspace: async (id, payload) => {
    const { data } = await api.patch(`/workspaces/${id}`, payload);
    return data;
  },

  deactivateWorkspace: async (id) => {
    const { data } = await api.delete(`/workspaces/${id}`);
    return data;
  },

  restoreWorkspace: async (id) => {
    const { data } = await api.post(`/workspaces/${id}/restore`);
    return data;
  },

  getMyWorkspaceAccess: async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/me`);
    return data;
  },
};
