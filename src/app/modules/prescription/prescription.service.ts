import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  UserRole,
} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 💊 PrescriptionService
 * -----------------------------------------------------
 * Handles all business logic related to prescriptions,
 * including creation by doctors and retrieval by patients.
 */

/**
 * 🩺 Create Prescription
 * -----------------------------------------------------
 * Allows a doctor to create a prescription for a completed and paid appointment.
 *
 * Steps:
 * 1. Validates that the appointment exists, is completed, and paid.
 * 2. Ensures the logged-in doctor is the one assigned to that appointment.
 * 3. Creates the prescription and links it to the appointment, doctor, and patient.
 *
 * @param user - Authenticated doctor information (from JWT)
 * @param payload - Prescription data (appointmentId, instructions, followUpDate, etc.)
 * @returns Created prescription record with patient details
 */
const createPrescription = async (
  user: IJWTPayload,
  payload: Partial<Prescription>
) => {
  // 🩹 Verify that appointment exists, is completed, and paid
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  // 🚫 Restrict access: Only the doctor assigned to this appointment can create a prescription
  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email))
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment"
      );
  }

  // 💾 Create prescription record
  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

/**
 * 📋 Get Patient Prescriptions
 * -----------------------------------------------------
 * Retrieves all prescriptions associated with the logged-in patient.
 * Supports pagination and sorting.
 *
 * @param user - Authenticated patient (from JWT)
 * @param options - Pagination and sorting configuration
 * @returns Paginated list of prescriptions with doctor, patient, and appointment data
 */
const patientPrescription = async (user: IJWTPayload, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // 📦 Fetch prescriptions for the current patient
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  // 📊 Get total count for pagination metadata
  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user.email,
      },
    },
  });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * 📦 Export PrescriptionService
 * -----------------------------------------------------
 * Provides business logic for creating and retrieving prescriptions.
 */
export const PrescriptionService = {
  createPrescription,
  patientPrescription,
};
