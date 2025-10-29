import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import pick from "../../helpers/pick";

/**
 * 🧑‍⚕️ DoctorController
 * -----------------------------------------------------
 * Handles all HTTP requests related to Doctor management.
 * Supports CRUD operations, AI suggestions, and data filtering.
 */

/**
 * 📋 Get All Doctors
 * -----------------------------------------------------
 * Fetches a paginated list of doctors with optional filtering and sorting.
 *
 * Query Params:
 *  - page, limit, sortBy, sortOrder
 *  - other fields defined in `doctorFilterableFields`
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const fillters = pick(req.query, doctorFilterableFields);

  const result = await DoctorService.getAllFromDB(fillters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * ✏️ Update Doctor
 * -----------------------------------------------------
 * Updates doctor details by ID.
 *
 * @param id - Doctor ID (from request params)
 * @body - Updated doctor data
 */
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DoctorService.updateIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully!",
    data: result,
  });
});

/**
 * 🔍 Get Doctor by ID
 * -----------------------------------------------------
 * Retrieves a single doctor’s details based on their ID.
 */
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully!",
    data: result,
  });
});

/**
 * ❌ Delete Doctor (Hard Delete)
 * -----------------------------------------------------
 * Permanently removes a doctor record from the database.
 */
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.deleteFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully!",
    data: result,
  });
});

/**
 * 🗑️ Soft Delete Doctor
 * -----------------------------------------------------
 * Marks a doctor as deleted without removing them from the database.
 * Useful for preserving historical or relational data.
 */
const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.softDelete(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor soft deleted successfully!",
    data: result,
  });
});

/**
 * 🤖 Get AI Suggestions
 * -----------------------------------------------------
 * Uses AI to generate recommendations or suggestions
 * based on the provided request data.
 */
const getAISuggestions = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAISuggestions(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI suggestions fetched successfully!",
    data: result,
  });
});

/**
 * 📦 Export DoctorController
 * -----------------------------------------------------
 * Provides all Doctor-related controller methods for use in routing.
 */
export const DoctorController = {
  getAllFromDB,
  updateIntoDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
  getAISuggestions,
};
