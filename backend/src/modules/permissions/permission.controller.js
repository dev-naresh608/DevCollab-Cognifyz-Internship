import { permissionService } from "./permission.service.js";

const getPermissions = async (req, res) => {
  try {
    const response = await permissionService.getAllPermissionsSvc();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions.",
    });
  }
};

export const permissionController = {
  getPermissions,
};
