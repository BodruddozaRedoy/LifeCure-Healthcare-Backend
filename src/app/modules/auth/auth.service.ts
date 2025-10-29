import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { Secret } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import config from "../../../config";
import emailSender from "./emailSender";
import { jwtHelper } from "../../helpers/jwtHelper";

/**
 * 🔐 AuthService
 * -----------------------------------------------------
 * Handles all authentication-related logic:
 * - Login and token generation
 * - Password changes and reset
 * - Session validation (getMe)
 */

/**
 * 🧑‍💻 Login
 * -----------------------------------------------------
 * Authenticates a user by verifying email and password.
 * Generates access and refresh tokens if credentials are valid.
 *
 * @param payload - Object containing email and password
 * @returns Access token, refresh token, and password change flag
 */
const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  // 🧾 Compare password
  const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect!");
  }

  // 🔑 Generate tokens
  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_secret as Secret,
    "1h"
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.refresh_token_secret as Secret,
    "90d"
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

/**
 * ♻️ Refresh Token
 * -----------------------------------------------------
 * Verifies a refresh token and issues a new access token.
 *
 * @param token - The refresh token
 * @returns New access token and password change flag
 */
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelper.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: decodedData.email, status: UserStatus.ACTIVE },
  });

  const accessToken = jwtHelper.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

/**
 * 🔑 Change Password
 * -----------------------------------------------------
 * Allows a logged-in user to change their password.
 * Verifies the old password before updating to the new one.
 *
 * @param user - Authenticated user (from JWT)
 * @param payload - Object containing oldPassword and newPassword
 * @returns Success message
 */
const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user.email, status: UserStatus.ACTIVE },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_round)
  );

  await prisma.user.update({
    where: { email: userData.email },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return { message: "Password changed successfully!" };
};

/**
 * 📧 Forgot Password
 * -----------------------------------------------------
 * Sends a password reset link to the user's email.
 * Generates a short-lived token and embeds it in the reset URL.
 *
 * @param payload - Object containing the user’s email
 */
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  // 🔑 Generate reset password token
  const resetPassToken = jwtHelper.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  // ✉️ Send reset link email
  await emailSender(
    userData.email,
    `
      <div>
        <p>Dear User,</p>
        <p>Your password reset link:
          <a href=${resetPassLink}>
            <button>Reset Password</button>
          </a>
        </p>
      </div>
    `
  );
};

/**
 * 🔁 Reset Password
 * -----------------------------------------------------
 * Resets the user's password using a valid reset token.
 *
 * @param token - Reset token (JWT)
 * @param payload - Object containing user ID and new password
 */
const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { id: payload.id, status: UserStatus.ACTIVE },
  });

  // 🧩 Verify token validity
  const isValidToken = jwtHelper.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // 🔒 Hash new password and update database
  const password = await bcrypt.hash(payload.password, Number(config.salt_round));

  await prisma.user.update({
    where: { id: payload.id },
    data: { password },
  });
};

/**
 * 👤 Get Logged-in User
 * -----------------------------------------------------
 * Verifies user session and retrieves basic user info.
 *
 * @param session - Session cookies containing accessToken
 * @returns Authenticated user details
 */
const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: decodedData.email, status: UserStatus.ACTIVE },
  });

  const { id, email, role, needPasswordChange, status } = userData;

  return { id, email, role, needPasswordChange, status };
};

/**
 * 📦 Export AuthService
 * -----------------------------------------------------
 * Provides all authentication-related business logic.
 */
export const AuthService = {
  login,
  changePassword,
  forgotPassword,
  refreshToken,
  resetPassword,
  getMe,
};
