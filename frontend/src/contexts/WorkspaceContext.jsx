import React, { createContext, useState, useEffect, useContext } from "react";
import { organizationApi } from "../services/organization.api.js";
import { workspaceApi } from "../services/workspace.api.js";
import { AuthContext } from "./AuthContext.jsx";

export const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  // Fetch Organizations on user login
  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setSelectedOrg(null);
      return;
    }
    setLoadingOrgs(true);
    try {
      const res = await organizationApi.getOrganizations();
      if (res.success && res.organizations) {
        setOrganizations(res.organizations);
        if (res.organizations.length > 0) {
          const currentId = selectedOrg?.id;
          const found = res.organizations.find((o) => o.id === currentId);
          setSelectedOrg(found || res.organizations[0]);
        } else {
          setSelectedOrg(null);
        }
      }
    } catch (err) {
      console.error("Failed to load organizations", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user?.id]);

  // Fetch Workspaces when selectedOrg changes
  const fetchWorkspaces = async (orgId) => {
    if (!orgId) {
      setWorkspaces([]);
      setSelectedWorkspace(null);
      return;
    }
    setLoadingWorkspaces(true);
    try {
      const res = await workspaceApi.getWorkspaces(orgId);
      if (res.success && res.workspaces) {
        setWorkspaces(res.workspaces);
        if (res.workspaces.length > 0) {
          const currentWsId = selectedWorkspace?.id;
          const found = res.workspaces.find((w) => w.id === currentWsId);
          setSelectedWorkspace(found || res.workspaces[0]);
        } else {
          setSelectedWorkspace(null);
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces", err);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    if (selectedOrg?.id) {
      fetchWorkspaces(selectedOrg.id);
    } else {
      setWorkspaces([]);
      setSelectedWorkspace(null);
    }
  }, [selectedOrg?.id]);

  // Fetch member role & permissions for selected Workspace via GET /api/workspaces/:workspaceId/me
  const fetchWorkspacePermissions = async (wsId) => {
    if (!wsId || !user?.id) {
      setUserRole(null);
      setUserPermissions([]);
      return;
    }
    try {
      const res = await workspaceApi.getMyWorkspaceAccess(wsId);
      if (res.success && res.member) {
        setUserRole(res.member.role);
        setUserPermissions(res.member.permissions || []);
      } else {
        setUserRole(null);
        setUserPermissions([]);
      }
    } catch (err) {
      setUserRole(null);
      setUserPermissions([]);
    }
  };

  useEffect(() => {
    if (selectedWorkspace?.id) {
      fetchWorkspacePermissions(selectedWorkspace.id);
    } else {
      setUserRole(null);
      setUserPermissions([]);
    }
  }, [selectedWorkspace?.id, user?.id]);

  const selectOrganization = (org) => {
    setSelectedOrg(org);
    setSelectedWorkspace(null);
  };

  const selectWorkspace = (ws) => {
    setSelectedWorkspace(ws);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        organizations,
        selectedOrg,
        selectOrganization,
        refreshOrganizations: fetchOrganizations,
        loadingOrgs,

        workspaces,
        selectedWorkspace,
        selectWorkspace,
        refreshWorkspaces: () => fetchWorkspaces(selectedOrg?.id),
        loadingWorkspaces,

        userRole,
        userPermissions,
        refreshPermissions: () => fetchWorkspacePermissions(selectedWorkspace?.id),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
