import { Router } from "express";

import { authController } from "./auth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";

import { registerSchema, loginSchema } from "./auth.validation.js";

const authRouter = Router();

authRouter
  .route("/register")
  .get(authController.showRegisterPage)
  .post(validate(registerSchema), authController.register);

authRouter
  .route("/login")
  .get(authController.showLoginPage)
  .post(validate(loginSchema), authController.login);

authRouter.route("/logout").post(authController.logout);

export default authRouter;
