import api from "../configs/api.config.js";

export const organizationApi = {
  getOrganizations: async () => {
    const { data } = await api.get("/organizations");
    return data;
  },

  getInactiveOrganizations: async () => {
    const { data } = await api.get("/organizations/inactive");
    return data;
  },

  getOrganizationById: async (id) => {
    const { data } = await api.get(`/organizations/${id}`);
    return data;
  },

  createOrganization: async (orgData) => {
    const { data } = await api.post("/organizations", orgData);
    return data;
  },

  updateOrganization: async (id, payload) => {
    const { data } = await api.patch(`/organizations/${id}`, payload);
    return data;
  },

  deactivateOrganization: async (id) => {
    const { data } = await api.delete(`/organizations/${id}`);
    return data;
  },

  restoreOrganization: async (id) => {
    const { data } = await api.post(`/organizations/${id}/restore`);
    return data;
  },
};
