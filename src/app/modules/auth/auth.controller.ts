import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import httpStatus from "http-status";

/**
 * 🔐 AuthController
 * -----------------------------------------------------
 * Handles all authentication and user session operations,
 * including login, token refresh, password reset, and profile retrieval.
 */

/**
 * 🧑‍💻 Login User
 * -----------------------------------------------------
 * Authenticates a user using provided credentials.
 * - Generates access and refresh tokens.
 * - Stores them as secure, HTTP-only cookies.
 *
 * @body { email, password }
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  const { accessToken, refreshToken, needPasswordChange } = result;

  // 🧩 Set authentication cookies
  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90, // 90 days
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User logged in successfully!",
    data: { needPasswordChange },
  });
});

/**
 * ♻️ Refresh Access Token
 * -----------------------------------------------------
 * Generates a new access token using the refresh token
 * stored in cookies when the old one expires.
 */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  // 🔄 Update access token cookie
  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: { message: "Access token generated successfully!" },
  });
});

/**
 * 🔑 Change Password
 * -----------------------------------------------------
 * Allows an authenticated user to change their password.
 * Requires the user’s current password and a new password.
 */
const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;

    const result = await AuthService.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);

/**
 * 📧 Forgot Password
 * -----------------------------------------------------
 * Sends a password reset link or token to the user's email.
 * Used when a user forgets their password.
 */
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your email!",
    data: null,
  });
});

/**
 * 🔁 Reset Password
 * -----------------------------------------------------
 * Resets a user's password using a valid reset token.
 * The token is usually included in the email sent by `forgotPassword`.
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthService.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
    data: null,
  });
});

/**
 * 👤 Get Current User
 * -----------------------------------------------------
 * Retrieves the logged-in user's profile based on the
 * session stored in cookies.
 */
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthService.getMe(userSession);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

/**
 * 📦 Export AuthController
 * -----------------------------------------------------
 * Provides all authentication-related controller methods.
 */
export const AuthController = {
  login,
  refreshToken,
  changePassword,
  resetPassword,
  forgotPassword,
  getMe,
};
