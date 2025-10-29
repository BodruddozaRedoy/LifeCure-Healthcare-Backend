import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status';
import { scheduleFilterableFields } from "./doctorSchedule.constant";
import pick from "../../helpers/pick";

/**
 * 🗓️ DoctorScheduleController
 * -----------------------------------------------------
 * Handles HTTP requests for managing doctor schedules.
 * Includes CRUD operations for schedules and personal schedule retrieval.
 */

/**
 * 🆕 Create Doctor Schedule
 * -----------------------------------------------------
 * Allows a doctor to create a new schedule slot.
 *
 * @param req.user - Authenticated doctor from JWT payload
 * @param req.body - Schedule details (date, time, etc.)
 */
const insertIntoDB = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.insertIntoDB(
      user as IJWTPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor Schedule created successfully!",
      data: result,
    });
  }
);

/**
 * 📅 Get My Schedule
 * -----------------------------------------------------
 * Fetches all schedules belonging to the logged-in doctor.
 * Supports filtering by date range and booking status.
 *
 * Query Params:
 *  - startDate, endDate, isBooked
 *  - page, limit, sortBy, sortOrder
 */
const getMySchedule = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;

    const result = await DoctorScheduleService.getMySchedule(
      filters,
      options,
      user as IJWTPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule fetched successfully!",
      data: result,
    });
  }
);

/**
 * ❌ Delete My Schedule
 * -----------------------------------------------------
 * Deletes a specific schedule belonging to the logged-in doctor.
 *
 * @param req.params.id - Schedule ID
 */
const deleteFromDB = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteFromDB(
      user as IJWTPayload,
      id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule deleted successfully!",
      data: result,
    });
  }
);

/**
 * 📋 Get All Doctor Schedules (Admin)
 * -----------------------------------------------------
 * Retrieves all schedules from the system with optional
 * filtering, sorting, and pagination. Typically used by admins.
 *
 * Query Params:
 *  - Filters from `scheduleFilterableFields`
 *  - Pagination and sorting options
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorScheduleService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Schedule retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 📦 Export DoctorScheduleController
 * -----------------------------------------------------
 * Exposes all doctor schedule-related controllers for routing.
 */
export const DoctorScheduleController = {
  insertIntoDB,
  getAllFromDB,
  getMySchedule,
  deleteFromDB,
};
