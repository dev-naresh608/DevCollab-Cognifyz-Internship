import { authService } from "./auth.service.js";
import { env } from "../../configs/env.config.js";

const showLoginPage = async (req, res) => {
  res.render("auth/views/login");
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

const getMe = async (req, res) => {
  try {
    const response = await authService.getMeSvc(req.user.id);
    if (!response.success) {
      return res.status(404).json({
        success: false,
        message: response.message,
      });
    }

    return res.status(200).json({
      success: true,
      user: response.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const response = await authService.refreshSvc(req.user.id);

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
      message: response.message,
      accessToken: response.accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  showLoginPage,
  login,
  getMe,
  refresh,
  logout,
};
