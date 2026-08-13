import { Router } from "express";
import { workspaceMemberController } from "./workspace-member.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizePermission } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  addWorkspaceMemberSchema,
  getWorkspaceMembersSchema,
  updateWorkspaceMemberRoleSchema,
  removeWorkspaceMemberSchema,
} from "./workspace-member.validation.js";

const workspaceMemberRouter = Router({ mergeParams: true });

workspaceMemberRouter.use(authMiddleware.authenticateAccessToken);

workspaceMemberRouter
  .route("/")
  .get(
    validate(getWorkspaceMembersSchema),
    authorizePermission("member:read"),
    workspaceMemberController.getMembers,
  )
  .post(
    validate(addWorkspaceMemberSchema),
    authorizePermission("member:invite"),
    workspaceMemberController.addMember,
  );

workspaceMemberRouter
  .route("/:userId")
  .patch(
    validate(updateWorkspaceMemberRoleSchema),
    authorizePermission("member:update"),
    workspaceMemberController.updateMemberRole,
  )
  .delete(
    validate(removeWorkspaceMemberSchema),
    authorizePermission("member:remove"),
    workspaceMemberController.removeMember,
  );

export default workspaceMemberRouter;
