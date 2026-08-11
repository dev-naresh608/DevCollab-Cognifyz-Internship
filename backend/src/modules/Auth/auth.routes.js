import { Router } from "express";

import { authController } from "./auth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";

import { registerSchema, loginSchema } from "./auth.validation.js";

import { authMiddleware } from "./auth.middleware.js";

const authRouter = Router();

authRouter
  .route("/register")
  .get(authController.showRegisterPage)
  .post(validate(registerSchema), authController.register);

authRouter
  .route("/login")
  .get(authController.showLoginPage)
  .post(validate(loginSchema), authController.login);

authRouter.get("/get-me", authMiddleware.authenticateAccessToken, authController.getMe);

authRouter.post("/refresh", authMiddleware.authenticateRefreshToken, authController.refresh);

authRouter.post("/logout", authController.logout);

export default authRouter;
