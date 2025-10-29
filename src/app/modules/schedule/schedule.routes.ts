import express from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * 🗓️ Schedule Routes
 * -----------------------------------------------------
 * Manages routes for creating, fetching, and deleting schedules.
 * Includes role-based access control for doctors and admins.
 *
 * Base path: /api/v1/schedules
 */

/**
 * 📋 GET /api/v1/schedules
 * -----------------------------------------------------
 * Fetches all schedules for the authenticated doctor.
 * Access: Doctor only
 */
router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.DOCTOR),
  ScheduleController.schedulesForDoctor
);

/**
 * 🆕 POST /api/v1/schedules
 * -----------------------------------------------------
 * Creates a new schedule record.
 * Access: Admin only
 */
router.post("/", auth(UserRole.ADMIN), ScheduleController.insertIntoDB);

/**
 * ❌ DELETE /api/v1/schedules/:id
 * -----------------------------------------------------
 * Deletes a specific schedule by ID.
 * Access: Admin only
 */
router.delete("/:id", auth(UserRole.ADMIN), ScheduleController.deleteScheduleFromDB);

/**
 * 📦 Export Schedule Routes
 * -----------------------------------------------------
 * Makes schedule endpoints available to the main application router.
 */
export const ScheduleRoutes = router;
