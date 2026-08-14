import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../services/auth.api.js";

const initialState = {
  user: null,
  accessToken: null,
  authLoading: true,
  isAuthenticated: false,
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Attempt refresh session via httpOnly cookie on application startup
      const refreshRes = await authApi.refresh();
      if (refreshRes.success && refreshRes.accessToken) {
        const meRes = await authApi.getMe();
        if (meRes.success && meRes.user) {
          return { user: meRes.user, accessToken: refreshRes.accessToken };
        }
      }
      return null;
    } catch (_error) {
      return rejectWithValue(null);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      if (!res.success) {
        return rejectWithValue(res.message || "Login failed");
      }
      return res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to connect to authentication server."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await authApi.logout();
    } catch (_e) {
      // Ignore API errors during logout; local state must be cleared
    }
    return true;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      if (!action.payload) {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.authLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.authLoading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setAccessToken, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
