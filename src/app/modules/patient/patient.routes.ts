import express from 'express';
import { PatientController } from './patient.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * 🧑‍⚕️ Patient Routes
 * -----------------------------------------------------
 * Defines all endpoints related to patient management.
 *
 * Base path: /api/v1/patients
 */

/**
 * 📋 GET /api/v1/patients
 * -----------------------------------------------------
 * Retrieves all patient records with pagination, filtering, and sorting.
 * Access: Public (can be restricted to Admin if needed)
 */
router.get('/', PatientController.getAllFromDB);

/**
 * 🔍 GET /api/v1/patients/:id
 * -----------------------------------------------------
 * Retrieves a single patient’s details by ID.
 * Access: Public (can be restricted to Admin if needed)
 */
router.get('/:id', PatientController.getByIdFromDB);

/**
 * ✏️ PATCH /api/v1/patients
 * -----------------------------------------------------
 * Updates the authenticated patient's profile information.
 * Access: Patient only
 */
router.patch('/', auth(UserRole.PATIENT), PatientController.updateIntoDB);

/**
 * 🗑️ DELETE /api/v1/patients/soft/:id
 * -----------------------------------------------------
 * Soft deletes a patient (marks them as deleted but keeps record in DB).
 * Access: Admin (or internal)
 */
router.delete('/soft/:id', PatientController.softDelete);

/**
 * 📦 Export Patient Routes
 * -----------------------------------------------------
 * Makes patient-related routes available to the main router.
 */
export const PatientRoutes = router;
