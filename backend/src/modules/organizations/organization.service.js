import { organizationRepository } from "./organization.repository.js";

const createOrganizationSvc = async ({ userId, name, slug }) => {
  const organization = await organizationRepository.create({
    userId,
    name,
    slug,
  });

  return {
    success: true,
    message: "Organization created successfully.",
    organization,
  };
};

const getOrganizationsSvc = async (userId) => {
  const organizations = await organizationRepository.getAll(userId);

  return {
    success: true,
    organizations,
  };
};

const getOrganizationByIdSvc = async ({ userId, organizationId }) => {
  const organization = await organizationRepository.findById({
    userId,
    organizationId,
  });

  if (!organization) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  return {
    success: true,
    organization,
  };
};

const updateOrganizationByIdSvc = async ({
  userId,
  organizationId,
  name,
  slug,
  isActive,
}) => {
  const organization = await organizationRepository.updateById({
    userId,
    organizationId,
    name,
    slug,
    isActive,
  });

  if (!organization) {
    return {
      success: false,
      message: "Organization not found or you are not the owner.",
    };
  }

  return {
    success: true,
    message: "Organization updated successfully.",
    organization,
  };
};

const deleteOrganizationByIdSvc = async ({ userId, organizationId }) => {
  const organization = await organizationRepository.deleteById({
    userId,
    organizationId,
  });

  if (!organization) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  return {
    success: true,
    message: "Organization deleted successfully.",
  };
};

const getInactiveOrganizationsSvc = async (userId) => {
  const organizations =
    await organizationRepository.getInactiveOrganizations(userId);

  return {
    success: true,
    organizations,
  };
};

const restoreOrganizationSvc = async ({
  userId,
  organizationId,
}) => {
  const organization =
    await organizationRepository.restoreById({
      userId,
      organizationId,
    });

  if (!organization) {
    return {
      success: false,
      message: "Organization not found or you are not the owner.",
    };
  }

  return {
    success: true,
    message: "Organization restored successfully.",
    organization,
  };
};

export const organizationServices = {
  createOrganizationSvc,
  getOrganizationsSvc,
  getOrganizationByIdSvc,
  updateOrganizationByIdSvc,
  deleteOrganizationByIdSvc,
  getInactiveOrganizationsSvc,
  restoreOrganizationSvc
};
