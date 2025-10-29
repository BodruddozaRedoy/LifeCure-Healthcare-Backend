import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import { patientFilterableFields } from './patient.constant';
import { PatientService } from './patient.service';
import sendResponse from '../../shared/sendResponse';
import { IJWTPayload } from '../../types/common';
import pick from '../../helpers/pick';

/**
 * 🧑‍⚕️ PatientController
 * -----------------------------------------------------
 * Handles all patient-related HTTP requests such as fetching,
 * updating, and soft deleting patient data.
 */

/**
 * 📋 GET /api/v1/patients
 * -----------------------------------------------------
 * Retrieves a paginated list of all patients.
 * Supports filtering and sorting.
 *
 * Access: Admin
 */
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await PatientService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient data retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 🔍 GET /api/v1/patients/:id
 * -----------------------------------------------------
 * Retrieves details of a single patient by ID.
 *
 * Access: Admin
 */
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient retrieved successfully',
    data: result,
  });
});

/**
 * 🗑️ DELETE /api/v1/patients/soft/:id
 * -----------------------------------------------------
 * Soft deletes a patient by marking them as deleted
 * instead of permanently removing from the database.
 *
 * Access: Admin
 */
const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.softDelete(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient soft deleted successfully',
    data: result,
  });
});

/**
 * ✏️ PATCH /api/v1/patients/me
 * -----------------------------------------------------
 * Updates profile information for the authenticated patient.
 *
 * Access: Patient (self-update only)
 */
const updateIntoDB = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await PatientService.updateIntoDB(user as IJWTPayload, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Patient updated successfully',
      data: result,
    });
  }
);

/**
 * 📦 Export PatientController
 * -----------------------------------------------------
 * Exposes controller methods for patient-related routes.
 */
export const PatientController = {
  getAllFromDB,
  getByIdFromDB,
  softDelete,
  updateIntoDB,
};
