import express, { NextFunction, Request, Response } from 'express';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesValidtaion } from './specialties.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { fileUploader } from '../../helpers/fileUploader';

const router = express.Router();

/**
 * 🩺 Specialties Routes
 * -----------------------------------------------------
 * Handles routes for managing medical specialties.
 * Includes fetching all specialties, adding new ones (with file upload),
 * and deleting specialties by ID.
 *
 * Base path: /api/v1/specialties
 */

/**
 * 📋 GET /api/v1/specialties
 * -----------------------------------------------------
 * Retrieves all available specialties from the database.
 * Returns an array of specialties in JSON format.
 * Access: Public
 */
router.get('/', SpecialtiesController.getAllFromDB);

/**
 * 🆕 POST /api/v1/specialties
 * -----------------------------------------------------
 * Creates a new specialty record with optional image upload.
 * - Accepts multipart/form-data with a `file` and `data` payload.
 * - Validates request body before passing to controller.
 *
 * Access: Admin only (can be added if needed)
 */
router.post(
  '/',
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    // ✅ Validate request body using Zod schema
    req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.inserIntoDB(req, res, next);
  }
);

/**
 * ❌ DELETE /api/v1/specialties/:id
 * -----------------------------------------------------
 * Deletes a specialty by its ID.
 * Requires admin authorization.
 *
 * Access: Admin
 */
router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteFromDB
);

/**
 * 📦 Export Specialties Routes
 * -----------------------------------------------------
 * Exposes specialties-related routes to the main app router.
 */
export const SpecialtiesRoutes = router;
