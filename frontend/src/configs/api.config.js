import axios from "axios";

let inMemoryAccessToken = null;
let onTokenRefreshedCallback = null;

export const setInMemoryAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getInMemoryAccessToken = () => inMemoryAccessToken;

export const setOnTokenRefreshed = (callback) => {
  onTokenRefreshedCallback = callback;
};

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 and attempt refresh token exchange if not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        if (data.success && data.accessToken) {
          setInMemoryAccessToken(data.accessToken);
          if (onTokenRefreshedCallback) {
            onTokenRefreshedCallback(data.accessToken);
          }
          api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          return api(originalRequest);
        } else {
          setInMemoryAccessToken(null);
          if (onTokenRefreshedCallback) {
            onTokenRefreshedCallback(null);
          }
          processQueue(new Error("Refresh failed"), null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        setInMemoryAccessToken(null);
        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback(null);
        }
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
