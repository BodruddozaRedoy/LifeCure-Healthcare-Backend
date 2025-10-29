import express from 'express';
import { userRoutes } from "../modules/user/user.routes";
import { ScheduleRoutes } from "../modules/schedule/schedule.routes";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.routes";
import { SpecialtiesRoutes } from "../modules/specialties/specialties.routes";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";
import { AppointmentRoutes } from "../modules/appointment/appointment.routes";
import { PrescriptionRoutes } from "../modules/prescription/prescription.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { MetaRoutes } from "../modules/meta/meta.routes";
import { authRoutes } from "../modules/auth/auth.route";

const router = express.Router();

/**
 * 🧭 API Route Index
 * -----------------------------------------------------
 * Centralized routing file that maps module-level routes
 * to their base API paths.
 *
 * Each module (User, Doctor, Appointment, etc.) exports
 * its own router, which is registered here under a unique prefix.
 *
 * Base API path example:
 *   - /api/v1/user → userRoutes
 *   - /api/v1/doctor → DoctorRoutes
 *   - /api/v1/auth → authRoutes
 */

const moduleRoutes = [
  // 👤 User & Auth
  { path: "/user", route: userRoutes },
  { path: "/auth", route: authRoutes },

  // 🕒 Schedule Management
  { path: "/schedule", route: ScheduleRoutes },
  { path: "/doctor-schedule", route: doctorScheduleRoutes },

  // 🩺 Medical Specialties
  { path: "/specialties", route: SpecialtiesRoutes },

  // 👨‍⚕️ Doctor & Patient Management
  { path: "/doctor", route: DoctorRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/patient", route: PatientRoutes },

  // 📅 Appointments & Prescriptions
  { path: "/appointment", route: AppointmentRoutes },
  { path: "/prescription", route: PrescriptionRoutes },

  // ⭐ Reviews
  { path: "/review", route: ReviewRoutes },

  // 📊 Dashboard Metadata
  { path: "/metadata", route: MetaRoutes },
];

/**
 * Dynamically registers all module routes.
 * Example: router.use("/user", userRoutes)
 */
moduleRoutes.forEach((route) => router.use(route.path, route.route));

/**
 * 📦 Export Main Router
 * -----------------------------------------------------
 * Exported and mounted at `/api/v1` in the main app file.
 */
export default router;
