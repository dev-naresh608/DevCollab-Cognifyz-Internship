import { organizationServices } from "./organization.service.js";

const createOrganization = async (req, res) => {
  try {
    const response = await organizationServices.createOrganizationSvc({
      userId: req.user.id,
      ...req.validatedData.body,
    });

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create organization.",
    });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const response = await organizationServices.getOrganizationsSvc(
      req.user.id,
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch organizations.",
    });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const response = await organizationServices.getOrganizationByIdSvc({
      userId: req.user.id,
      organizationId: req.validatedData.params.id,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch organization.",
    });
  }
};

const updateOrganizationById = async (req, res) => {
  try {
    const response = await organizationServices.updateOrganizationByIdSvc({
      userId: req.user.id,
      organizationId: req.validatedData.params.id,
      ...req.validatedData.body,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update organization.",
    });
  }
};

const deleteOrganizationById = async (req, res) => {
  try {
    const response = await organizationServices.deleteOrganizationByIdSvc({
      userId: req.user.id,
      organizationId: req.validatedData.params.id,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete organization.",
    });
  }
};

const getInactiveOrganizations = async (req, res) => {
  try {
    const response =
      await organizationServices.getInactiveOrganizationsSvc(
        req.user.id,
      );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inactive organizations.",
    });
  }
};


const restoreOrganization = async (req, res) => {
  try {
    const response =
      await organizationServices.restoreOrganizationSvc({
        userId: req.user.id,
        organizationId: req.validatedData.params.id,
      });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to restore organization.",
    });
  }
};

export const organizationController = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganizationById,
  deleteOrganizationById,
  getInactiveOrganizations,
  restoreOrganization,
};
