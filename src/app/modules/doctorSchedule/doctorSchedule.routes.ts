import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = express.Router();

/**
 * 🗓️ Doctor Schedule Routes
 * -----------------------------------------------------
 * Handles all endpoints related to doctor schedules.
 * Includes schedule creation, retrieval, and deletion.
 *
 * Base path: /api/v1/doctor-schedules
 */

/**
 * 📋 GET /api/v1/doctor-schedules
 * -----------------------------------------------------
 * Retrieves all schedules in the system.
 * Accessible by Admin, Doctor, and Patient roles.
 */
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  DoctorScheduleController.getAllFromDB
);

/**
 * 📅 GET /api/v1/doctor-schedules/my-schedule
 * -----------------------------------------------------
 * Retrieves the logged-in doctor’s schedules.
 * Access: Doctor only
 */
router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getMySchedule
);

/**
 * 🆕 POST /api/v1/doctor-schedules
 * -----------------------------------------------------
 * Creates a new doctor schedule.
 * - Validates input using Zod schema before saving.
 * Access: Doctor only
 */
router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(DoctorScheduleValidation.createDoctorScheduleValidationSchema),
  DoctorScheduleController.insertIntoDB
);

/**
 * ❌ DELETE /api/v1/doctor-schedules/:id
 * -----------------------------------------------------
 * Deletes a specific schedule belonging to the logged-in doctor.
 * Access: Doctor only
 */
router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteFromDB
);

/**
 * 📦 Export Doctor Schedule Routes
 * -----------------------------------------------------
 * Exports the configured router to be used in the main app routes.
 */
export const doctorScheduleRoutes = router;
