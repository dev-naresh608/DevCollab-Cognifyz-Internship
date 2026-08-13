import bcrypt from "bcrypt";
import { env } from "../../configs/env.config.js";
import jwt from "jsonwebtoken";
import { userRepository } from "../users/user.repository.js";

const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
  );
};

const handleLoginSvc = async ({ email, password }) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  if (!user.is_active) {
    return {
      success: false,
      message: "Account is deactivated or suspended.",
    };
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordMatch) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    success: true,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const getMeSvc = async (userId) => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  if (!user.is_active) {
    return {
      success: false,
      message: "Account is deactivated or suspended.",
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    },
  };
};

const refreshSvc = async (userId) => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  if (!user.is_active) {
    return {
      success: false,
      message: "Account is deactivated or suspended.",
    };
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    success: true,
    message: "Token refreshed successfully.",
    accessToken,
    refreshToken,
  };
};

export const authService = {
  handleLoginSvc,
  getMeSvc,
  refreshSvc,
};
