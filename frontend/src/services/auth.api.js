import api, { setStoredAccessToken } from "../configs/api.config.js";

export const authApi = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    if (data.success && data.accessToken) {
      setStoredAccessToken(data.accessToken);
    }
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/get-me");
    return data;
  },

  refresh: async () => {
    const { data } = await api.post("/auth/refresh");
    if (data.success && data.accessToken) {
      setStoredAccessToken(data.accessToken);
    }
    return data;
  },

  logout: async () => {
    try {
      const { data } = await api.post("/auth/logout");
      return data;
    } finally {
      setStoredAccessToken(null);
    }
  },
};
