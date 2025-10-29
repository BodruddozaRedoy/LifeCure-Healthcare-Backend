import express from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * 🔐 Auth Routes
 * -----------------------------------------------------
 * Defines all routes related to user authentication,
 * password management, and session handling.
 *
 * Base path: /api/v1/auth
 */

/**
 * 👤 GET /api/v1/auth/me
 * -----------------------------------------------------
 * Retrieves the currently authenticated user's information.
 * Uses session cookies to identify the logged-in user.
 */
router.get("/me", AuthController.getMe);

/**
 * 🧑‍💻 POST /api/v1/auth/login
 * -----------------------------------------------------
 * Authenticates a user with email and password.
 * Returns access and refresh tokens via HTTP-only cookies.
 */
router.post("/login", AuthController.login);

/**
 * ♻️ POST /api/v1/auth/refresh-token
 * -----------------------------------------------------
 * Refreshes the access token using the refresh token
 * stored in cookies. Helps maintain a persistent session.
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * 🔑 POST /api/v1/auth/change-password
 * -----------------------------------------------------
 * Allows an authenticated user to change their password.
 * Accessible by Admin, Doctor, and Patient roles.
 */
router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword
);

/**
 * 📧 POST /api/v1/auth/forgot-password
 * -----------------------------------------------------
 * Initiates the password reset process by sending
 * a reset token or link to the user’s email.
 */
router.post("/forgot-password", AuthController.forgotPassword);

/**
 * 🔁 POST /api/v1/auth/reset-password
 * -----------------------------------------------------
 * Resets the user's password using a valid reset token
 * received via email.
 */
router.post("/reset-password", AuthController.resetPassword);

/**
 * 📦 Export Auth Routes
 * -----------------------------------------------------
 * Exports the configured authentication routes
 * for use in the main application router.
 */
export const authRoutes = router;
