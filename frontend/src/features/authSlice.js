import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../services/auth.api.js";
import { getStoredAccessToken } from "../configs/api.config.js";

const initialState = {
  user: null,
  authLoading: true,
  isAuthenticated: false,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",

  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);

      if (!res.success) {
        return rejectWithValue(res.message);
      }

      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",

  async (_, { rejectWithValue }) => {
    try {
      const storedToken = getStoredAccessToken();

      if (storedToken) {
        const res = await authApi.getMe();

        if (res.success && res.user) {
          return res.user;
        }
      }

      const refreshRes = await authApi.refresh();

      if (refreshRes.success) {
        const meRes = await authApi.getMe();

        if (meRes.success && meRes.user) {
          return meRes.user;
        }
      }

      return null;
    } catch (error) {
      return rejectWithValue(null);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",

  async () => {
    try {
      await authApi.logout();
    } finally {
      return true;
    }
  },
);

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })

      .addCase(loginUser.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.authLoading = true;
      })

      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
      })

      .addCase(initializeAuth.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
