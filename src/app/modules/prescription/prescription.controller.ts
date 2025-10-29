import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../helpers/pick";

/**
 * 💊 PrescriptionController
 * -----------------------------------------------------
 * Handles all HTTP requests related to prescriptions.
 * Includes creation by doctors and viewing by patients.
 */

/**
 * 🩺 Create Prescription
 * -----------------------------------------------------
 * Allows an authenticated doctor to create a prescription
 * for a specific patient and appointment.
 *
 * @param req.user - Authenticated doctor info (from JWT)
 * @param req.body - Prescription details (medications, notes, etc.)
 */
const createPrescription = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescription(
      user as IJWTPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Prescription created successfully!",
      data: result,
    });
  }
);

/**
 * 📋 Get Patient Prescriptions
 * -----------------------------------------------------
 * Retrieves all prescriptions associated with the
 * authenticated patient. Supports pagination and sorting.
 *
 * @param req.user - Authenticated patient info (from JWT)
 * @param req.query - Pagination and sorting options
 */
const patientPrescription = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PrescriptionService.patientPrescription(
      user as IJWTPayload,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescriptions fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

/**
 * 📦 Export PrescriptionController
 * -----------------------------------------------------
 * Exposes controller methods for prescription-related routes.
 */
export const PrescriptionController = {
  createPrescription,
  patientPrescription,
};
