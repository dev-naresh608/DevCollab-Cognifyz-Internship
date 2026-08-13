import { Router } from "express";
import { platformAdminController } from "./platform-admin.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { bootstrapAdminSchema, createPlatformAdminOrgSchema } from "./platform-admin.validation.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authenticatePlatformAdmin } from "./platform-admin.middleware.js";

const platformAdminRouter = Router();

// Public Platform Admin endpoints
platformAdminRouter.get("/status", platformAdminController.getStatus);
platformAdminRouter.get("/bootstrap-status", platformAdminController.getStatus);

platformAdminRouter.post(
  "/bootstrap",
  validate(bootstrapAdminSchema),
  platformAdminController.bootstrap,
);

// Protected Platform Admin endpoints
platformAdminRouter.use(authMiddleware.authenticateAccessToken);
platformAdminRouter.use(authenticatePlatformAdmin);

platformAdminRouter.get("/me", platformAdminController.getMe);
platformAdminRouter.get("/users", platformAdminController.getUsers);
platformAdminRouter.get("/organizations", platformAdminController.getOrganizations);
platformAdminRouter.post(
  "/organizations",
  validate(createPlatformAdminOrgSchema),
  platformAdminController.createOrganizationAndOwner
);

export default platformAdminRouter;
