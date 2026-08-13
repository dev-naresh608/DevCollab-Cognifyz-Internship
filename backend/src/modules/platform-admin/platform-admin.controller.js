import { platformAdminService } from "./platform-admin.service.js";

const getStatus = async (req, res) => {
  try {
    const response = await platformAdminService.getStatusSvc();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check platform bootstrap status.",
    });
  }
};

const bootstrap = async (req, res) => {
  try {
    const secretHeader = req.headers["x-platform-bootstrap-secret"];
    const payload = req.validatedData.body;

    const response = await platformAdminService.bootstrapSvc({
      secretHeader,
      payload,
    });

    if (!response.success) {
      if (response.code === "UNAUTHORIZED_SECRET") {
        return res.status(401).json(response);
      }
      if (response.code === "ADMIN_EXISTS") {
        return res.status(409).json(response);
      }
      return res.status(400).json(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A user with this username or email address already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to bootstrap platform admin.",
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    isPlatformAdmin: true,
    user: req.user,
  });
};

const createOrganizationAndOwner = async (req, res) => {
  try {
    const response = await platformAdminService.createOrganizationAndOwnerSvc(
      req.validatedData.body
    );

    if (!response.success) {
      if (response.code === "DUPLICATE_SLUG" || response.code === "DUPLICATE_USER") {
        return res.status(409).json(response);
      }
      return res.status(400).json(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Organization slug or owner email/username is already taken.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create organization and owner.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const response = await platformAdminService.getAllUsersSvc();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform users.",
    });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const response = await platformAdminService.getAllOrganizationsSvc();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform organizations.",
    });
  }
};

export const platformAdminController = {
  getStatus,
  bootstrap,
  getMe,
  createOrganizationAndOwner,
  getUsers,
  getOrganizations,
};
