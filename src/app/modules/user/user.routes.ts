import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../helpers/fileUploader";

const router = express.Router();

/**
 * 👤 User Routes
 * -----------------------------------------------------
 * Defines all endpoints for managing users, including:
 * - User creation (Admin, Doctor, Patient)
 * - Profile management
 * - Role-based access control
 *
 * Base path: /api/v1/users
 */

/**
 * 📋 GET /api/v1/users
 * -----------------------------------------------------
 * Fetches all users with filtering, pagination, and sorting.
 * Access: Admin only.
 */
router.get("/", auth(UserRole.ADMIN), UserController.getAllFromDB);

/**
 * 🙋‍♂️ GET /api/v1/users/me
 * -----------------------------------------------------
 * Retrieves the authenticated user's profile.
 * Access: Admin, Doctor, and Patient.
 */
router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMyProfile
);

/**
 * 🏥 POST /api/v1/users/create-patient
 * -----------------------------------------------------
 * Creates a new patient profile.
 * - Accepts multipart/form-data with an optional profile image.
 * - Validates input using Zod schema.
 * Access: Public (no auth required).
 */
router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createPatientValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createPatient(req, res, next);
  }
);

/**
 * 🧑‍💼 POST /api/v1/users/create-admin
 * -----------------------------------------------------
 * Creates a new admin user.
 * - Requires authentication.
 * - Validates input data.
 * Access: Admin only.
 */
router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createAdmin(req, res, next);
  }
);

/**
 * 👨‍⚕️ POST /api/v1/users/create-doctor
 * -----------------------------------------------------
 * Creates a new doctor profile.
 * - Requires admin authorization.
 * - Supports image upload and validation.
 * Access: Admin only.
 */
router.post(
  "/create-doctor",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(JSON.parse(req.body.data));
    req.body = UserValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createDoctor(req, res, next);
  }
);

/**
 * 🔄 PATCH /api/v1/users/:id/status
 * -----------------------------------------------------
 * Updates a user’s account status (e.g., active, suspended).
 * Access: Admin only.
 */
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  UserController.changeProfileStatus
);

/**
 * ✏️ PATCH /api/v1/users/update-my-profile
 * -----------------------------------------------------
 * Allows logged-in users to update their own profile.
 * - Supports file upload.
 * - Works for Admin, Doctor, and Patient roles.
 */
router.patch(
  "/update-my-profile",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return UserController.updateMyProfie(req, res, next);
  }
);

/**
 * 📦 Export User Routes
 * -----------------------------------------------------
 * Exports the configured user routes for main application use.
 */
export const userRoutes = router;
