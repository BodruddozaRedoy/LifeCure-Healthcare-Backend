import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { userFilterableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";
import pick from "../../helpers/pick";

/**
 * 👤 UserController
 * -----------------------------------------------------
 * Handles all user-related HTTP requests, including:
 * - Creating users (Patient, Admin, Doctor)
 * - Fetching all users
 * - Managing and updating profiles
 */

/**
 * 🧑‍⚕️ createPatient
 * -----------------------------------------------------
 * Creates a new patient user.
 *
 * @param req - Express request containing patient details
 * @returns Created patient record
 */
const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created successfully!",
    data: result,
  });
});

/**
 * 🧑‍💼 createAdmin
 * -----------------------------------------------------
 * Creates a new admin user.
 *
 * @param req - Express request containing admin details
 * @returns Created admin record
 */
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});

/**
 * 👨‍⚕️ createDoctor
 * -----------------------------------------------------
 * Creates a new doctor user.
 *
 * @param req - Express request containing doctor details
 * @returns Created doctor record
 */
const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createDoctor(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created successfully!",
    data: result,
  });
});

/**
 * 📋 getAllFromDB
 * -----------------------------------------------------
 * Fetches all users from the database with filtering, searching,
 * pagination, and sorting support.
 *
 * @query page, limit, sortBy, sortOrder, searchTerm
 * @returns Paginated list of users
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await UserService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 🙋‍♂️ getMyProfile
 * -----------------------------------------------------
 * Retrieves the profile of the currently logged-in user.
 *
 * @param req.user - Extracted from JWT after authentication
 * @returns Current user profile data
 */
const getMyProfile = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;

    const result = await UserService.getMyProfile(user as IJWTPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data fetched successfully!",
      data: result,
    });
  }
);

/**
 * 🔄 changeProfileStatus
 * -----------------------------------------------------
 * Changes the account status (e.g., active, suspended, deleted)
 * of a specific user by ID.
 *
 * @param req.params.id - User ID
 * @param req.body.status - New status to apply
 * @returns Updated user status
 */
const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.changeProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile status changed successfully!",
    data: result,
  });
});

/**
 * ✏️ updateMyProfile
 * -----------------------------------------------------
 * Updates the logged-in user's own profile information.
 *
 * @param req.user - Authenticated user's data
 * @param req - Express request containing updated profile fields
 * @returns Updated user profile
 */
const updateMyProfie = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;

    const result = await UserService.updateMyProfie(user as IJWTPayload, req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile updated successfully!",
      data: result,
    });
  }
);

/**
 * 📦 Export UserController
 * -----------------------------------------------------
 * Exposes controller methods for user-related endpoints.
 */
export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
  getMyProfile,
  changeProfileStatus,
  updateMyProfie,
};
