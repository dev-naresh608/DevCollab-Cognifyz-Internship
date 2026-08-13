import { workspaceServices } from "./workspace.service.js";

const createWorkspace = async (req, res) => {
  try {
    const response = await workspaceServices.createWorkspaceSvc({
      userId: req.user.id,
      ...req.validatedData.body,
    });

    if (!response.success) {
      return res.status(403).json(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A workspace with this slug already exists in the organization.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create workspace.",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const response = await workspaceServices.getWorkspacesSvc({
      userId: req.user.id,
      organizationId: req.validatedData.query.organizationId,
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces.",
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const response = await workspaceServices.getWorkspaceByIdSvc({
      userId: req.user.id,
      workspaceId: req.validatedData.params.id,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace.",
    });
  }
};

const updateWorkspaceById = async (req, res) => {
  try {
    const response = await workspaceServices.updateWorkspaceByIdSvc({
      userId: req.user.id,
      workspaceId: req.validatedData.params.id,
      ...req.validatedData.body,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A workspace with this slug already exists in the organization.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update workspace.",
    });
  }
};

const deleteWorkspaceById = async (req, res) => {
  try {
    const response = await workspaceServices.deleteWorkspaceByIdSvc({
      userId: req.user.id,
      workspaceId: req.validatedData.params.id,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate workspace.",
    });
  }
};

const getInactiveWorkspaces = async (req, res) => {
  try {
    const response = await workspaceServices.getInactiveWorkspacesSvc({
      userId: req.user.id,
      organizationId: req.validatedData.query.organizationId,
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inactive workspaces.",
    });
  }
};

const restoreWorkspace = async (req, res) => {
  try {
    const response = await workspaceServices.restoreWorkspaceSvc({
      userId: req.user.id,
      workspaceId: req.validatedData.params.id,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to restore workspace.",
    });
  }
};

const getMyAccess = async (req, res) => {
  try {
    const workspaceId = req.validatedData.params.workspaceId || req.validatedData.params.id;
    const response = await workspaceServices.getMyAccessSvc({
      userId: req.user.id,
      workspaceId,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace access context.",
    });
  }
};

export const workspaceController = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspaceById,
  deleteWorkspaceById,
  getInactiveWorkspaces,
  restoreWorkspace,
  getMyAccess,
};