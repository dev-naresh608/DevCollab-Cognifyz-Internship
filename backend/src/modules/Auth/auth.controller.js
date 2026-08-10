import { authService } from "./auth.service.js";
import { env } from "../../configs/env.config.js";

const showRegisterPage = async (req, res) => {
  res.render("auth/views/register");
};
const showLoginPage = async (req, res) => {
  res.render("auth/views/login");
};

const register = async (req, res) => {
  try {
    const response = await authService.handleRegisterSvc(
      req.validatedData.body,
    );

    if (!response.success) {
      return res.status(409).json({
        success: false,
        message: response.message,
      });
    }

    return res.render("auth/views/login")
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const response = await authService.handleLoginSvc(req.validatedData.body);

    if (!response.success) {
      return res.status(401).json({
        success: false,
        message: response.message,
      });
    }

    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User Logged In Successfully",
      user: response.user,
      accessToken: response.accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logout = async () => {};

export const authController = {
  showRegisterPage,
  showLoginPage,
  register,
  login,
  logout,
};
