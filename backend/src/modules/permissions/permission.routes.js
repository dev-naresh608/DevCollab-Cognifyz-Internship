import { Router } from "express";
import { permissionController } from "./permission.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

const permissionRouter = Router();

permissionRouter.get(
  "/",
  authMiddleware.authenticateAccessToken,
  permissionController.getPermissions,
);

export default permissionRouter;
