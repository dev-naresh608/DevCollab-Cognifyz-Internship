import api from "../configs/api.config.js";

export const permissionApi = {
  getPermissions: async () => {
    const { data } = await api.get("/permissions");
    return data;
  },
};
