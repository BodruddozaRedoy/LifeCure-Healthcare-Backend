import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * 🧩 Appointment Routes
 * -----------------------------------------------------
 * Defines all endpoints related to appointment management.
 * Includes creation, retrieval, and status updates.
 *
 * Base path: /api/v1/appointments
 */

/**
 * 📂 GET /api/v1/appointments
 * -----------------------------------------------------
 * Retrieves all appointments with filtering, sorting, and pagination.
 * Access: Admin only
 */
router.get(
  "/",
  auth(UserRole.ADMIN),
  AppointmentController.getAllFromDB
);

/**
 * 📋 GET /api/v1/appointments/my-appointments
 * -----------------------------------------------------
 * Fetches all appointments for the currently authenticated user.
 * Access: Patient or Doctor
 */
router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointment
);

/**
 * 🆕 POST /api/v1/appointments
 * -----------------------------------------------------
 * Creates a new appointment for the authenticated patient.
 * Access: Patient only
 */
router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment
);

/**
 * 🔄 PATCH /api/v1/appointments/status/:id
 * -----------------------------------------------------
 * Updates the status of a specific appointment (e.g., confirm, cancel, complete).
 * Access: Admin or Doctor
 */
router.patch(
  "/status/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentController.updateAppointmentStatus
);

/**
 * 📦 Export Appointment Routes
 * -----------------------------------------------------
 * Exports the router to be used in the main application routing.
 */
export const AppointmentRoutes = router;
