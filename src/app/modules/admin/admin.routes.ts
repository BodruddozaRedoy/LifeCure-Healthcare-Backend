import express from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { adminValidationSchemas } from './admin.validations';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * 🧩 Admin Routes
 * -----------------------------------------------------
 * Defines all REST API endpoints related to the Admin module.
 * Each route is protected with authentication and role-based access control.
 *
 * Base path: /api/v1/admin
 */

/**
 * 📄 GET /api/v1/admin
 * -----------------------------------------------------
 * Retrieves a list of all admins with filtering, sorting, and pagination.
 * Accessible only to users with the `ADMIN` role.
 */
router.get(
  '/',
  auth(UserRole.ADMIN),
  AdminController.getAllFromDB
);

/**
 * 🔍 GET /api/v1/admin/:id
 * -----------------------------------------------------
 * Fetches details of a single admin by their unique ID.
 * Accessible only to users with the `ADMIN` role.
 */
router.get(
  '/:id',
  auth(UserRole.ADMIN),
  AdminController.getByIdFromDB
);

/**
 * ✏️ PATCH /api/v1/admin/:id
 * -----------------------------------------------------
 * Updates an admin’s details by their ID.
 * - Validates request body using Zod schema before processing.
 * - Accessible only to users with the `ADMIN` role.
 */
router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(adminValidationSchemas.update),
  AdminController.updateIntoDB
);

/**
 * ❌ DELETE /api/v1/admin/:id
 * -----------------------------------------------------
 * Permanently deletes an admin record from the database.
 * Accessible only to users with the `ADMIN` role.
 */
router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  AdminController.deleteFromDB
);

/**
 * 🗑️ DELETE /api/v1/admin/soft/:id
 * -----------------------------------------------------
 * Soft-deletes an admin (marks as deleted but does not remove the record).
 * Accessible only to users with the `ADMIN` role.
 */
router.delete(
  '/soft/:id',
  auth(UserRole.ADMIN),
  AdminController.softDeleteFromDB
);

/**
 * 📦 Export Admin Routes
 * -----------------------------------------------------
 * Exports the configured router to be used in the main application routes.
 */
export const AdminRoutes = router;
