import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import { IJWTPayload } from "../../types/common";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helpers/pick";
import { reviewFilterableFields } from "./review.constant";

/**
 * ⭐ ReviewController
 * -----------------------------------------------------
 * Handles all HTTP requests related to doctor/patient reviews.
 * Provides endpoints for creating and retrieving reviews.
 */

/**
 * 📝 Insert Review
 * -----------------------------------------------------
 * Allows an authenticated patient to create a new review for a doctor.
 *
 * @param req.user - Authenticated patient (from JWT)
 * @param req.body - Review details (rating, comment, doctorId, etc.)
 */
const insertIntoDB = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.insertIntoDB(user as IJWTPayload, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

/**
 * 📋 Get All Reviews
 * -----------------------------------------------------
 * Retrieves all reviews with optional filtering, sorting, and pagination.
 * Useful for admin dashboards or doctor profile pages.
 *
 * @param req.query - Filters (doctorId, rating, etc.) and pagination options
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ReviewService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 📦 Export ReviewController
 * -----------------------------------------------------
 * Provides controller methods for review-related API routes.
 */
export const ReviewController = {
  insertIntoDB,
  getAllFromDB,
};
