import { roleService } from "./role.service.js";

const createRole = async (req, res) => {
  try {
    const { workspaceId } = req.validatedData.params;
    const { name, description } = req.validatedData.body;

    const response = await roleService.createRoleSvc({
      workspaceId,
      name,
      description,
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A role with this name already exists in the workspace.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create role.",
    });
  }
};

const getRoles = async (req, res) => {
  try {
    const { workspaceId } = req.validatedData.params;
    const response = await roleService.getRolesSvc(workspaceId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { workspaceId, roleId } = req.validatedData.params;
    const response = await roleService.getRoleByIdSvc({ workspaceId, roleId });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role.",
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { workspaceId, roleId } = req.validatedData.params;
    const { name, description } = req.validatedData.body;

    const response = await roleService.updateRoleSvc({
      workspaceId,
      roleId,
      name,
      description,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A role with this name already exists in the workspace.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update role.",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { workspaceId, roleId } = req.validatedData.params;
    const response = await roleService.deleteRoleSvc({ workspaceId, roleId });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete role because it is currently assigned to one or more members.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete role.",
    });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { workspaceId, roleId } = req.validatedData.params;
    const response = await roleService.getRolePermissionsSvc({
      workspaceId,
      roleId,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role permissions.",
    });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { workspaceId, roleId } = req.validatedData.params;
    const { permissionIds } = req.validatedData.body;

    const response = await roleService.updateRolePermissionsSvc({
      workspaceId,
      roleId,
      permissionIds,
    });

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update role permissions.",
    });
  }
};

export const roleController = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
};
