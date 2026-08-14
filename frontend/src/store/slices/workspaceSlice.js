import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { organizationApi } from "../../services/organization.api.js";
import { workspaceApi } from "../../services/workspace.api.js";

const initialState = {
  organizations: [],
  selectedOrg: null,

  workspaces: [],
  selectedWorkspace: null,

  userRole: null,
  userPermissions: [],

  loadingOrgs: false,
  loadingWorkspaces: false,
  loadingPermissions: false,

  organizationsError: null,
  workspacesError: null,
  permissionsError: null,
};

export const fetchOrganizations = createAsyncThunk(
  "workspace/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await organizationApi.getOrganizations();
      return res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }
);

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (orgId, { rejectWithValue }) => {
    if (!orgId) {
      return { success: true, workspaces: [] };
    }
    try {
      const res = await workspaceApi.getWorkspaces(orgId);
      return res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workspaces"
      );
    }
  }
);

export const fetchWorkspacePermissions = createAsyncThunk(
  "workspace/fetchWorkspacePermissions",
  async (workspaceId, { rejectWithValue }) => {
    if (!workspaceId) {
      return { success: false, member: null };
    }
    try {
      const res = await workspaceApi.getMyWorkspaceAccess(workspaceId);
      return res;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workspace permissions"
      );
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    selectOrganization: (state, action) => {
      state.selectedOrg = action.payload;
      state.selectedWorkspace = null;
      state.workspaces = [];
      state.userRole = null;
      state.userPermissions = [];
    },
    selectWorkspace: (state, action) => {
      state.selectedWorkspace = action.payload;
      state.userRole = null;
      state.userPermissions = [];
    },
    clearWorkspace: (state) => {
      state.organizations = [];
      state.selectedOrg = null;
      state.workspaces = [];
      state.selectedWorkspace = null;
      state.userRole = null;
      state.userPermissions = [];
      state.organizationsError = null;
      state.workspacesError = null;
      state.permissionsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrganizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loadingOrgs = true;
        state.organizationsError = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loadingOrgs = false;
        if (action.payload.success && action.payload.organizations) {
          const orgs = action.payload.organizations;
          state.organizations = orgs;
          if (orgs.length > 0) {
            const currentId = state.selectedOrg?.id;
            const found = orgs.find((o) => o.id === currentId);
            state.selectedOrg = found || orgs[0];
          } else {
            state.selectedOrg = null;
            state.workspaces = [];
            state.selectedWorkspace = null;
            state.userRole = null;
            state.userPermissions = [];
          }
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loadingOrgs = false;
        state.organizationsError = action.payload;
      })
      // fetchWorkspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loadingWorkspaces = true;
        state.workspacesError = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loadingWorkspaces = false;
        if (action.payload.success && action.payload.workspaces) {
          const wss = action.payload.workspaces;
          state.workspaces = wss;
          if (wss.length > 0) {
            const currentWsId = state.selectedWorkspace?.id;
            const found = wss.find((w) => w.id === currentWsId);
            state.selectedWorkspace = found || wss[0];
          } else {
            state.selectedWorkspace = null;
            state.userRole = null;
            state.userPermissions = [];
          }
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loadingWorkspaces = false;
        state.workspacesError = action.payload;
      })
      // fetchWorkspacePermissions
      .addCase(fetchWorkspacePermissions.pending, (state) => {
        state.loadingPermissions = true;
        state.permissionsError = null;
      })
      .addCase(fetchWorkspacePermissions.fulfilled, (state, action) => {
        state.loadingPermissions = false;
        if (action.payload.success && action.payload.member) {
          state.userRole = action.payload.member.role;
          state.userPermissions = action.payload.member.permissions || [];
        } else {
          state.userRole = null;
          state.userPermissions = [];
        }
      })
      .addCase(fetchWorkspacePermissions.rejected, (state, action) => {
        state.loadingPermissions = false;
        state.userRole = null;
        state.userPermissions = [];
        state.permissionsError = action.payload;
      });
  },
});

export const { selectOrganization, selectWorkspace, clearWorkspace } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
