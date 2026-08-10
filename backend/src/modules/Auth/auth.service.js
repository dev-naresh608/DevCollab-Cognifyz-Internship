import { User } from "../../models/user.js";
import bcrypt from "bcrypt";
import { env } from "../../configs/env.config.js";
import jwt from "jsonwebtoken";

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

const handleRegisterSvc = async (payload) => {
  const { fullName, username, email, password } = payload;

  const isExist = await User.exists({
    $or: [{ email }, { username }],
  });

  if (isExist) {
    return {
      success: false,
      message: "Email or username already exists.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName,
    username,
    email,
    password: hashedPassword,
  });

  return {
    success: true,
  };
};

const handleLoginSvc = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};
export const authService = {
  handleRegisterSvc,
  handleLoginSvc,
};
