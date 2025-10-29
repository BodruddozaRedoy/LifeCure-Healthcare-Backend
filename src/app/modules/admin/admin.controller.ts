import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AdminService } from './admin.service';
import { adminFilterableFields } from './admin.constant';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from "../../helpers/pick";

/**
 * 🧩 AdminController
 * -----------------------------------------------------
 * Handles all CRUD operations for the Admin module.
 * Uses the service layer for database logic and shared utilities
 * for clean response and error handling.
 */

/**
 * 📄 Get All Admins
 * -----------------------------------------------------
 * Fetches a paginated list of admins from the database with optional filters.
 *
 * Query Params:
 *  - limit, page, sortBy, sortOrder (for pagination/sorting)
 *  - any filterable fields defined in `adminFilterableFields`
 */
const getAllFromDB: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, adminFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await AdminService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched!",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 🔍 Get Admin by ID
 * -----------------------------------------------------
 * Fetches a single admin record from the database using its ID.
 *
 * @param id - Admin ID (from URL params)
 */
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data fetched by id!",
    data: result,
  });
});

/**
 * ✏️ Update Admin
 * -----------------------------------------------------
 * Updates an existing admin record by ID.
 *
 * @param id - Admin ID (from URL params)
 * @body - Fields to update (in request body)
 */
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.updateIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data updated!",
    data: result,
  });
});

/**
 * ❌ Delete Admin (Hard Delete)
 * -----------------------------------------------------
 * Permanently deletes an admin record from the database.
 *
 * @param id - Admin ID (from URL params)
 */
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data deleted!",
    data: result,
  });
});

/**
 * 🗑️ Soft Delete Admin
 * -----------------------------------------------------
 * Marks an admin record as deleted without removing it from the database.
 * (Typically sets a flag like `isDeleted: true`.)
 *
 * @param id - Admin ID (from URL params)
 */
const softDeleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.softDeleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin data deleted!",
    data: result,
  });
});

/**
 * 📦 Export Controller
 * -----------------------------------------------------
 * Exports all admin-related controller methods for routing.
 */
export const AdminController = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDeleteFromDB,
};
