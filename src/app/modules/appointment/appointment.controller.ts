import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { appointmentFilterableFields } from "./appointment.constant";
import httpStatus from "http-status";
import { IJWTPayload } from "../../types/common";
import { AppointmentService } from "./appointment.service";
import pick from "../../helpers/pick";

/**
 * 🩺 AppointmentController
 * -----------------------------------------------------
 * Handles all request logic for the Appointment module.
 * Includes appointment creation, fetching, updating status,
 * and retrieving all appointments (admin or system-level).
 */

/**
 * 🆕 Create Appointment
 * -----------------------------------------------------
 * Creates a new appointment for the authenticated user.
 *
 * @param req.user - JWT payload of the authenticated user
 * @param req.body - Appointment details
 */
const createAppointment = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(
      user as IJWTPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appointment created successfully!",
      data: result,
    });
  }
);

/**
 * 📋 Get My Appointments
 * -----------------------------------------------------
 * Fetches appointments for the currently authenticated user.
 * Supports pagination, sorting, and optional filtering
 * by status or paymentStatus.
 *
 * Query params:
 *  - page, limit, sortBy, sortOrder
 *  - status, paymentStatus
 */
const getMyAppointment = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, ["status", "paymentStatus"]);
    const user = req.user;

    const result = await AppointmentService.getMyAppointment(
      user as IJWTPayload,
      fillters,
      options
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment fetched successfully!",
      data: result,
    });
  }
);

/**
 * 🔄 Update Appointment Status
 * -----------------------------------------------------
 * Updates the status of a specific appointment by ID.
 * Accessible only to authorized users (e.g., admin or doctor).
 *
 * @param id - Appointment ID (from route params)
 * @param status - New appointment status (from body)
 */
const updateAppointmentStatus = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppointmentService.updateAppointmentStatus(
      id,
      status,
      user as IJWTPayload
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment updated successfully!",
      data: result,
    });
  }
);

/**
 * 📂 Get All Appointments (Admin)
 * -----------------------------------------------------
 * Retrieves all appointments with optional filtering,
 * sorting, and pagination. Typically for admin use.
 *
 * Query params:
 *  - limit, page, sortBy, sortOrder
 *  - any filterable fields defined in appointmentFilterableFields
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AppointmentService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 📦 Export AppointmentController
 * -----------------------------------------------------
 * Provides all appointment-related controller methods for routing.
 */
export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllFromDB,
};
