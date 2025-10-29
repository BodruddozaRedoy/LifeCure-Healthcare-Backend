import express from 'express';
import { MetaController } from './meta.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * 📊 Meta Routes
 * -----------------------------------------------------
 * Handles all endpoints related to system metadata,
 * such as dashboard analytics or summarized statistics.
 *
 * Base path: /api/v1/meta
 */

/**
 * 📈 GET /api/v1/meta
 * -----------------------------------------------------
 * Retrieves dashboard metadata and statistics.
 * Accessible by Admin, Doctor, and Patient roles.
 */
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  MetaController.fetchDashboardMetaData
);

/**
 * 📦 Export Meta Routes
 * -----------------------------------------------------
 * Exports configured routes for use in the main router.
 */
export const MetaRoutes = router;
