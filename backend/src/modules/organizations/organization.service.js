import { organizationRepository } from "./organization.repository.js";

const createOrganizationSvc = async ({
  userId,
  name,
  slug,
}) => {
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
  const organizations =
    await organizationRepository.getAll(userId);

  return {
    success: true,
    organizations,
  };
};

const getOrganizationByIdSvc = async ({
  userId,
  organizationId,
}) => {
  const organization =
    await organizationRepository.findById({
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
}) => {
  const organization =
    await organizationRepository.updateById({
      userId,
      organizationId,
      name,
      slug,
    });

  if (!organization) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  return {
    success: true,
    message: "Organization updated successfully.",
    organization,
  };
};

const deleteOrganizationByIdSvc = async ({
  userId,
  organizationId,
}) => {
  const organization =
    await organizationRepository.deleteById({
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

export const organizationServices = {
  createOrganizationSvc,
  getOrganizationsSvc,
  getOrganizationByIdSvc,
  updateOrganizationByIdSvc,
  deleteOrganizationByIdSvc,
};