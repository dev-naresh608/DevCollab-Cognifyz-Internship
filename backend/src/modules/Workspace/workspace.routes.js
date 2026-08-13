import { Router } from "express";

import { workspaceController } from "./workspace.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  createWorkspaceSchema,
  getWorkspacesSchema,
  getWorkspaceByIdSchema,
  updateWorkspaceByIdSchema,
  deleteWorkspaceByIdSchema,
  getInactiveWorkspacesSchema,
  restoreWorkspaceSchema,
} from "./workspace.validation.js";

const workspaceRouter = Router();


// Get inactive workspaces
workspaceRouter
  .route("/inactive")
  .get(
    authMiddleware.authenticateAccessToken,
    validate(getInactiveWorkspacesSchema),
    workspaceController.getInactiveWorkspaces,
  );


// Restore workspace
workspaceRouter
  .route("/:id/restore")
  .post(
    authMiddleware.authenticateAccessToken,
    validate(restoreWorkspaceSchema),
    workspaceController.restoreWorkspace,
  );


// Workspace collection
workspaceRouter
  .route("/")
  .get(
    authMiddleware.authenticateAccessToken,
    validate(getWorkspacesSchema),
    workspaceController.getWorkspaces,
  )
  .post(
    authMiddleware.authenticateAccessToken,
    validate(createWorkspaceSchema),
    workspaceController.createWorkspace,
  );


// Workspace by ID
workspaceRouter
  .route("/:id")
  .get(
    authMiddleware.authenticateAccessToken,
    validate(getWorkspaceByIdSchema),
    workspaceController.getWorkspaceById,
  )
  .patch(
    authMiddleware.authenticateAccessToken,
    validate(updateWorkspaceByIdSchema),
    workspaceController.updateWorkspaceById,
  )
  .delete(
    authMiddleware.authenticateAccessToken,
    validate(deleteWorkspaceByIdSchema),
    workspaceController.deleteWorkspaceById,
  );

export default workspaceRouter;