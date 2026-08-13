import api from "../configs/api.config.js";

export const platformAdminApi = {
  checkStatus: async () => {
    const { data } = await api.get("/platform-admin/status");
    return data;
  },

  bootstrap: async (bootstrapSecret, payload) => {
    const { data } = await api.post("/platform-admin/bootstrap", payload, {
      headers: {
        "X-Platform-Bootstrap-Secret": bootstrapSecret,
      },
    });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/platform-admin/me");
    return data;
  },

  getUsers: async () => {
    const { data } = await api.get("/platform-admin/users");
    return data;
  },

  getOrganizations: async () => {
    const { data } = await api.get("/platform-admin/organizations");
    return data;
  },

  createOrganizationAndOwner: async (payload) => {
    const { data } = await api.post("/platform-admin/organizations", payload);
    return data;
  },
};
