import { Router } from "express";

import { authController } from "./auth.controller.js";

const authRouter = Router();

authRouter
  .route("/register")
  .get(authController.showRegisterPage)
  .post(authController.register);

authRouter
  .route("/login")
  .get(authController.showLoginPage)
  .post(authController.login);

authRouter.route("/logout").post(authController.logout);

export default authRouter;
