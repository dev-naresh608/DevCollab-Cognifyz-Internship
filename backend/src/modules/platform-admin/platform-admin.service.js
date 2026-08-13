import bcrypt from "bcrypt";
import { env } from "../../configs/env.config.js";
import { platformAdminRepository } from "./platform-admin.repository.js";

const getStatusSvc = async () => {
  const count = await platformAdminRepository.getAdminCount();
  return {
    success: true,
    isBootstrapped: count > 0,
  };
};

const bootstrapSvc = async ({ secretHeader, payload }) => {
  if (!secretHeader || secretHeader !== env.PLATFORM_ADMIN_BOOTSTRAP_SECRET) {
    return {
      success: false,
      code: "UNAUTHORIZED_SECRET",
      message: "Invalid or missing X-Platform-Bootstrap-Secret header.",
    };
  }

  const { firstName, lastName, username, email, password } = payload;

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await platformAdminRepository.bootstrapFirstAdmin({
    firstName,
    lastName,
    username,
    email,
    passwordHash,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    message: "Initial Platform Admin bootstrapped successfully.",
    platformAdmin: {
      id: result.platformAdmin.id,
      userId: result.user.id,
      firstName: result.user.first_name,
      lastName: result.user.last_name,
      username: result.user.username,
      email: result.user.email,
      createdAt: result.platformAdmin.created_at,
    },
  };
};

const createOrganizationAndOwnerSvc = async (payload) => {
  const result = await platformAdminRepository.createOrganizationAndOwner(payload);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    message: "Organization and Organization Owner created successfully.",
    organization: result.organization,
    owner: {
      id: result.owner.id,
      firstName: result.owner.first_name,
      lastName: result.owner.last_name,
      username: result.owner.username,
      email: result.owner.email,
    },
  };
};

const getAllUsersSvc = async () => {
  const users = await platformAdminRepository.getAllUsers();
  return {
    success: true,
    users,
  };
};

const getAllOrganizationsSvc = async () => {
  const organizations = await platformAdminRepository.getAllOrganizations();
  return {
    success: true,
    organizations,
  };
};

export const platformAdminService = {
  getStatusSvc,
  bootstrapSvc,
  createOrganizationAndOwnerSvc,
  getAllUsersSvc,
  getAllOrganizationsSvc,
};
