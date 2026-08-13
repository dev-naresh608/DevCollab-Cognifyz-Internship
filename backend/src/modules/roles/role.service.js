import { roleRepository } from "./role.repository.js";

const createRoleSvc = async ({ workspaceId, name, description }) => {
  const role = await roleRepository.create({
    workspaceId,
    name,
    description,
  });

  return {
    success: true,
    message: "Role created successfully.",
    role,
  };
};

const getRolesSvc = async (workspaceId) => {
  const roles = await roleRepository.getAll(workspaceId);

  return {
    success: true,
    roles,
  };
};

const getRoleByIdSvc = async ({ workspaceId, roleId }) => {
  const role = await roleRepository.findById({ workspaceId, roleId });

  if (!role) {
    return {
      success: false,
      message: "Role not found.",
    };
  }

  return {
    success: true,
    role,
  };
};

const updateRoleSvc = async ({ workspaceId, roleId, name, description }) => {
  const existingRole = await roleRepository.findById({ workspaceId, roleId });
  if (!existingRole) {
    return {
      success: false,
      message: "Role not found in this workspace.",
    };
  }

  if (existingRole.name === "Admin" && name && name !== "Admin") {
    return {
      success: false,
      message: "The default Admin role cannot be renamed.",
    };
  }

  const role = await roleRepository.update({
    workspaceId,
    roleId,
    name,
    description,
  });

  return {
    success: true,
    message: "Role updated successfully.",
    role,
  };
};

const deleteRoleSvc = async ({ workspaceId, roleId }) => {
  const existingRole = await roleRepository.findById({ workspaceId, roleId });
  if (!existingRole) {
    return {
      success: false,
      message: "Role not found in this workspace.",
    };
  }

  if (existingRole.name === "Admin") {
    return {
      success: false,
      message: "The default Admin role is system-protected and cannot be deleted.",
    };
  }

  const role = await roleRepository.deleteRole({ workspaceId, roleId });

  if (!role) {
    return {
      success: false,
      message: "Role not found in this workspace.",
    };
  }

  return {
    success: true,
    message: "Role deleted successfully.",
  };
};

const getRolePermissionsSvc = async ({ workspaceId, roleId }) => {
  const role = await roleRepository.findById({ workspaceId, roleId });
  if (!role) {
    return {
      success: false,
      message: "Role not found in this workspace.",
    };
  }

  const permissions = await roleRepository.getRolePermissions({
    workspaceId,
    roleId,
  });

  return {
    success: true,
    permissions,
  };
};

const updateRolePermissionsSvc = async ({
  workspaceId,
  roleId,
  permissionIds,
}) => {
  const existingRole = await roleRepository.findById({ workspaceId, roleId });
  if (!existingRole) {
    return {
      success: false,
      message: "Role not found in this workspace.",
    };
  }

  if (existingRole.name === "Admin") {
    return {
      success: false,
      message: "The default Admin role permissions are system-protected to prevent workspace lockout.",
    };
  }

  const result = await roleRepository.updateRolePermissions({
    workspaceId,
    roleId,
    permissionIds,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  return {
    success: true,
    message: "Role permissions updated successfully.",
    permissions: result.permissions,
  };
};

export const roleService = {
  createRoleSvc,
  getRolesSvc,
  getRoleByIdSvc,
  updateRoleSvc,
  deleteRoleSvc,
  getRolePermissionsSvc,
  updateRolePermissionsSvc,
};
