import { Request, Response } from "express";
import httpStatus from "http-status";
import { SpecialtiesService } from "./specialties.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

/**
 * 🎯 SpecialtiesController
 * -----------------------------------------------------
 * Handles all API requests related to doctor specialties,
 * including creating, retrieving, and deleting specialties.
 */

/**
 * 🆕 inserIntoDB
 * -----------------------------------------------------
 * Creates a new specialty record.
 *
 * @param req - Express request (may contain file upload or body data)
 * @returns Created specialty details
 */
const inserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.inserIntoDB(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created successfully!",
    data: result,
  });
});

/**
 * 📋 getAllFromDB
 * -----------------------------------------------------
 * Fetches all available specialties from the database.
 *
 * @returns List of all specialties
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.getAllFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully",
    data: result,
  });
});

/**
 * ❌ deleteFromDB
 * -----------------------------------------------------
 * Deletes a specific specialty by ID.
 *
 * @param req.params.id - Specialty ID to delete
 * @returns Deleted specialty information
 */
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtiesService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

/**
 * 📦 Export SpecialtiesController
 * -----------------------------------------------------
 * Provides controller methods for specialties-related routes.
 */
export const SpecialtiesController = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
