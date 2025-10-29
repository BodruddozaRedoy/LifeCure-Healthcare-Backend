import { Request, Response } from "express";
import { MetaService } from "./meta.service";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";

/**
 * 📊 MetaController
 * -----------------------------------------------------
 * Handles all requests related to system metadata,
 * such as dashboard statistics and summarized metrics.
 */

/**
 * 📈 Fetch Dashboard Meta Data
 * -----------------------------------------------------
 * Retrieves dynamic metadata and statistics for the user's dashboard.
 * Behavior and data may vary based on user role (e.g., Admin, Doctor, Patient).
 *
 * @param req.user - Authenticated user from JWT
 * @returns Aggregated metadata for dashboard visualization
 */
const fetchDashboardMetaData = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(user as IJWTPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta data retrieved successfully!",
      data: result,
    });
  }
);

/**
 * 📦 Export MetaController
 * -----------------------------------------------------
 * Provides controller methods for metadata-related routes.
 */
export const MetaController = {
  fetchDashboardMetaData,
};
