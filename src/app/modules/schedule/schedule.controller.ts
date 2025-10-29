import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import { IJWTPayload } from "../../types/common";
import pick from "../../helpers/pick";

/**
 * 🗓️ ScheduleController
 * -----------------------------------------------------
 * Handles all HTTP requests related to schedule management.
 * Includes creating, fetching, and deleting schedules.
 */

/**
 * 🆕 Create Schedule
 * -----------------------------------------------------
 * Creates a new schedule record.
 *
 * @param req.body - Schedule details (startDateTime, endDateTime, etc.)
 * @returns The newly created schedule
 */
const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

/**
 * 📋 Get Doctor Schedules
 * -----------------------------------------------------
 * Retrieves available schedules for a specific doctor.
 * Supports pagination, sorting, and optional date range filtering.
 *
 * @param req.user - Authenticated doctor information (from JWT)
 * @param req.query - Filters and pagination options
 * @returns List of schedules with pagination metadata
 */
const schedulesForDoctor = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);
    const user = req.user;

    const result = await ScheduleService.schedulesForDoctor(
      user as IJWTPayload,
      filters,
      options
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

/**
 * ❌ Delete Schedule
 * -----------------------------------------------------
 * Deletes a specific schedule by ID.
 *
 * @param req.params.id - Schedule ID to delete
 * @returns Deleted schedule information
 */
const deleteScheduleFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.deleteScheduleFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully!",
    data: result,
  });
});

/**
 * 📦 Export ScheduleController
 * -----------------------------------------------------
 * Provides controller methods for schedule-related routes.
 */
export const ScheduleController = {
  insertIntoDB,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
