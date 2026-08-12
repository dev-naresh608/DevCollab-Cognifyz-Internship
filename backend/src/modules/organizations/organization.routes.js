import { Router } from "express";

import { organizationController } from "./organization.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  createOrganizationSchema,
  getOrganizationByIdSchema,
  updateOrganizationByIdSchema,
  deleteOrganizationByIdSchema,
} from "./organization.validation.js";

const organizationRouter = Router();

organizationRouter
  .route("/")
  .get(
    authMiddleware.authenticateAccessToken,
    organizationController.getOrganizations,
  )
  .post(
    authMiddleware.authenticateAccessToken,
    validate(createOrganizationSchema),
    organizationController.createOrganization,
  );

organizationRouter
  .route("/:id")
  .get(
    authMiddleware.authenticateAccessToken,
    validate(getOrganizationByIdSchema),
    organizationController.getOrganizationById,
  )
  .patch(
    authMiddleware.authenticateAccessToken,
    validate(updateOrganizationByIdSchema),
    organizationController.updateOrganizationById,
  )
  .delete(
    authMiddleware.authenticateAccessToken,
    validate(deleteOrganizationByIdSchema),
    organizationController.deleteOrganizationById,
  );

export default organizationRouter;
