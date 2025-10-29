import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { PrescriptionController } from './prescription.controller';

const router = express.Router();

/**
 * 💊 Prescription Routes
 * -----------------------------------------------------
 * Defines endpoints for managing prescriptions.
 * Includes creation by doctors and viewing by patients.
 *
 * Base path: /api/v1/prescriptions
 */

/**
 * 📋 GET /api/v1/prescriptions/my-prescription
 * -----------------------------------------------------
 * Retrieves all prescriptions belonging to the authenticated patient.
 * - Supports pagination and sorting.
 * Access: Patient only
 */
router.get(
  "/my-prescription",
  auth(UserRole.PATIENT),
  PrescriptionController.patientPrescription
);

/**
 * 🩺 POST /api/v1/prescriptions
 * -----------------------------------------------------
 * Allows an authenticated doctor to create a new prescription
 * for a specific patient or appointment.
 * Access: Doctor only
 */
router.post(
  "/",
  auth(UserRole.DOCTOR),
  PrescriptionController.createPrescription
);

/**
 * 📦 Export Prescription Routes
 * -----------------------------------------------------
 * Makes the prescription routes available to the main router.
 */
export const PrescriptionRoutes = router;
