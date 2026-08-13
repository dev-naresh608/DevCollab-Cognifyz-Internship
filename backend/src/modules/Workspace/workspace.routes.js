import { Router } from "express";
import { workspaceController } from "./workspace.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizePermission } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import roleRouter from "../roles/role.routes.js";
import workspaceMemberRouter from "../workspace-members/workspace-member.routes.js";
import {
  createWorkspaceSchema,
  getWorkspacesSchema,
  getWorkspaceByIdSchema,
  updateWorkspaceByIdSchema,
  deleteWorkspaceByIdSchema,
  getInactiveWorkspacesSchema,
  restoreWorkspaceSchema,
  getWorkspaceMeSchema,
} from "./workspace.validation.js";

const workspaceRouter = Router();

workspaceRouter.use(authMiddleware.authenticateAccessToken);

// Mount nested sub-modules
workspaceRouter.use("/:workspaceId/roles", roleRouter);
workspaceRouter.use("/:workspaceId/members", workspaceMemberRouter);

// Current User's Workspace Access Context (does NOT require member:read)
workspaceRouter
  .route("/:workspaceId/me")
  .get(
    validate(getWorkspaceMeSchema),
    workspaceController.getMyAccess,
  );

// Get inactive workspaces in organization
workspaceRouter
  .route("/inactive")
  .get(
    validate(getInactiveWorkspacesSchema),
    workspaceController.getInactiveWorkspaces,
  );

// Restore workspace
workspaceRouter
  .route("/:id/restore")
  .post(
    validate(restoreWorkspaceSchema),
    authorizePermission("workspace:restore"),
    workspaceController.restoreWorkspace,
  );

// Workspace collection (GET list active, POST create)
workspaceRouter
  .route("/")
  .get(
    validate(getWorkspacesSchema),
    workspaceController.getWorkspaces,
  )
  .post(
    validate(createWorkspaceSchema),
    workspaceController.createWorkspace,
  );

// Workspace by ID (GET read, PATCH update, DELETE deactivate)
workspaceRouter
  .route("/:id")
  .get(
    validate(getWorkspaceByIdSchema),
    authorizePermission("workspace:read"),
    workspaceController.getWorkspaceById,
  )
  .patch(
    validate(updateWorkspaceByIdSchema),
    authorizePermission("workspace:update"),
    workspaceController.updateWorkspaceById,
  )
  .delete(
    validate(deleteWorkspaceByIdSchema),
    authorizePermission("workspace:delete"),
    workspaceController.deleteWorkspaceById,
  );

export default workspaceRouter;