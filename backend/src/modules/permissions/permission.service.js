import { permissionRepository } from "./permission.repository.js";

const getAllPermissionsSvc = async () => {
  const permissions = await permissionRepository.getAllPermissions();

  return {
    success: true,
    permissions,
  };
};

export const permissionService = {
  getAllPermissionsSvc,
};
