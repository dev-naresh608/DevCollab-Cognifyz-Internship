import { Router } from "express";
import { roleController } from "./role.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizePermission } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createRoleSchema,
  getRolesSchema,
  getRoleByIdSchema,
  updateRoleSchema,
  deleteRoleSchema,
  getRolePermissionsSchema,
  updateRolePermissionsSchema,
} from "./role.validation.js";

const roleRouter = Router({ mergeParams: true });

roleRouter.use(authMiddleware.authenticateAccessToken);

roleRouter
  .route("/")
  .get(
    validate(getRolesSchema),
    authorizePermission("role:read"),
    roleController.getRoles,
  )
  .post(
    validate(createRoleSchema),
    authorizePermission("role:create"),
    roleController.createRole,
  );

roleRouter
  .route("/:roleId/permissions")
  .get(
    validate(getRolePermissionsSchema),
    authorizePermission("role:read"),
    roleController.getRolePermissions,
  )
  .put(
    validate(updateRolePermissionsSchema),
    authorizePermission("role:update"),
    roleController.updateRolePermissions,
  );

roleRouter
  .route("/:roleId")
  .get(
    validate(getRoleByIdSchema),
    authorizePermission("role:read"),
    roleController.getRoleById,
  )
  .patch(
    validate(updateRoleSchema),
    authorizePermission("role:update"),
    roleController.updateRole,
  )
  .delete(
    validate(deleteRoleSchema),
    authorizePermission("role:delete"),
    roleController.deleteRole,
  );

export default roleRouter;
