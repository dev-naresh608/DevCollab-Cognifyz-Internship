import { workspaceRepository } from "./workspace.repository.js";

const createWorkspaceSvc = async ({
  userId,
  organizationId,
  name,
  slug,
}) => {
  const workspace = await workspaceRepository.create({
    userId,
    organizationId,
    name,
    slug,
  });

  if (!workspace) {
    return {
      success: false,
      message: "Organization not found or you are not the owner.",
    };
  }

  return {
    success: true,
    message: "Workspace created successfully.",
    workspace,
  };
};

const getWorkspacesSvc = async ({
  userId,
  organizationId,
}) => {
  const workspaces = await workspaceRepository.getAll({
    userId,
    organizationId,
  });

  return {
    success: true,
    workspaces,
  };
};

const getWorkspaceByIdSvc = async ({
  userId,
  workspaceId,
}) => {
  const workspace = await workspaceRepository.findById({
    userId,
    workspaceId,
  });

  if (!workspace) {
    return {
      success: false,
      message: "Workspace not found.",
    };
  }

  return {
    success: true,
    workspace,
  };
};

const updateWorkspaceByIdSvc = async ({
  userId,
  workspaceId,
  name,
  slug,
}) => {
  const workspace = await workspaceRepository.updateById({
    userId,
    workspaceId,
    name,
    slug,
  });

  if (!workspace) {
    return {
      success: false,
      message: "Workspace not found or you are not the organization owner.",
    };
  }

  return {
    success: true,
    message: "Workspace updated successfully.",
    workspace,
  };
};

const deleteWorkspaceByIdSvc = async ({
  userId,
  workspaceId,
}) => {
  const workspace = await workspaceRepository.deleteById({
    userId,
    workspaceId,
  });

  if (!workspace) {
    return {
      success: false,
      message: "Workspace not found or you are not the organization owner.",
    };
  }

  return {
    success: true,
    message: "Workspace deactivated successfully.",
    workspace,
  };
};

const getInactiveWorkspacesSvc = async ({
  userId,
  organizationId,
}) => {
  const workspaces =
    await workspaceRepository.getInactive({
      userId,
      organizationId,
    });

  return {
    success: true,
    workspaces,
  };
};

const restoreWorkspaceSvc = async ({
  userId,
  workspaceId,
}) => {
  const workspace = await workspaceRepository.restoreById({
    userId,
    workspaceId,
  });

  if (!workspace) {
    return {
      success: false,
      message: "Workspace not found or you are not the organization owner.",
    };
  }

  return {
    success: true,
    message: "Workspace restored successfully.",
    workspace,
  };
};

export const workspaceServices = {
  createWorkspaceSvc,
  getWorkspacesSvc,
  getWorkspaceByIdSvc,
  updateWorkspaceByIdSvc,
  deleteWorkspaceByIdSvc,
  getInactiveWorkspacesSvc,
  restoreWorkspaceSvc,
};