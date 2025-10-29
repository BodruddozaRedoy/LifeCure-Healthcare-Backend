import express from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * 🧩 Doctor Routes
 * -----------------------------------------------------
 * Defines all endpoints related to doctor management.
 * Includes public doctor listing and admin-protected CRUD operations.
 *
 * Base path: /api/v1/doctors
 */

/**
 * 📋 GET /api/v1/doctors
 * -----------------------------------------------------
 * Retrieves all doctors with pagination, filtering, and sorting.
 * Access: Public
 */
router.get("/", DoctorController.getAllFromDB);

/**
 * 🤖 POST /api/v1/doctors/suggestion
 * -----------------------------------------------------
 * Generates AI-based doctor recommendations or suggestions.
 * Access: Public
 */
router.post("/suggestion", DoctorController.getAISuggestions);

/**
 * 🔍 GET /api/v1/doctors/:id
 * -----------------------------------------------------
 * Retrieves details of a specific doctor by ID.
 * Access: Public
 */
router.get("/:id", DoctorController.getByIdFromDB);

/**
 * ✏️ PATCH /api/v1/doctors/:id
 * -----------------------------------------------------
 * Updates doctor information by ID.
 * Access: Admin and Doctor roles only
 */
router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  DoctorController.updateIntoDB
);

/**
 * ❌ DELETE /api/v1/doctors/:id
 * -----------------------------------------------------
 * Permanently deletes a doctor record from the database.
 * Access: Admin only
 */
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  DoctorController.deleteFromDB
);

/**
 * 🗑️ DELETE /api/v1/doctors/soft/:id
 * -----------------------------------------------------
 * Soft deletes a doctor (marks as deleted but keeps the record).
 * Access: Admin only
 */
router.delete(
  "/soft/:id",
  auth(UserRole.ADMIN),
  DoctorController.softDelete
);

/**
 * 📦 Export Doctor Routes
 * -----------------------------------------------------
 * Makes all doctor-related routes available for use
 * in the main application routing module.
 */
export const DoctorRoutes = router;
