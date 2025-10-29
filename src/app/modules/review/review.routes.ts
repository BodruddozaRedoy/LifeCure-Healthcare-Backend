import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * ⭐ Review Routes
 * -----------------------------------------------------
 * Defines endpoints for managing doctor reviews.
 * Includes routes for creating new reviews and fetching all reviews.
 *
 * Base path: /api/v1/reviews
 */

/**
 * 📋 GET /api/v1/reviews
 * -----------------------------------------------------
 * Retrieves all reviews with optional filtering, sorting, and pagination.
 * Access: Public
 */
router.get("/", ReviewController.getAllFromDB);

/**
 * 📝 POST /api/v1/reviews
 * -----------------------------------------------------
 * Allows an authenticated patient to submit a review for a doctor.
 * Access: Patient only
 */
router.post("/", auth(UserRole.PATIENT), ReviewController.insertIntoDB);

/**
 * 📦 Export Review Routes
 * -----------------------------------------------------
 * Makes review-related routes available to the main router.
 */
export const ReviewRoutes = router;
