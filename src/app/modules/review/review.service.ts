import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * ⭐ ReviewService
 * -----------------------------------------------------
 * Handles all business logic for creating and retrieving reviews.
 * Includes review creation, validation, and aggregated rating updates.
 */

/**
 * 📝 Insert Review
 * -----------------------------------------------------
 * Allows a patient to leave a review for a doctor after an appointment.
 *
 * Steps:
 * 1. Validates that the appointment belongs to the logged-in patient.
 * 2. Creates the review record with rating and comment.
 * 3. Recalculates the doctor’s average rating based on all reviews.
 *
 * @param user - Authenticated patient info (from JWT)
 * @param payload - Review data (appointmentId, rating, comment)
 * @returns Created review record
 */
const insertIntoDB = async (user: IJWTPayload, payload: any) => {
  // ✅ Ensure the patient exists
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  // ✅ Ensure the appointment exists
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
  });

  // 🚫 Validate that the patient owns the appointment
  if (patientData.id !== appointmentData.patientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment!");
  }

  // 🧾 Create review and update doctor's average rating atomically
  return await prisma.$transaction(async (tnx) => {
    // 🩺 Create review record
    const result = await tnx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    // 📊 Calculate updated average rating for the doctor
    const avgRating = await tnx.review.aggregate({
      _avg: { rating: true },
      where: { doctorId: appointmentData.doctorId },
    });

    // 🔄 Update doctor’s average rating
    await tnx.doctor.update({
      where: { id: appointmentData.doctorId },
      data: {
        averageRating: avgRating._avg.rating as number,
      },
    });

    return result;
  });
};

/**
 * 📋 Get All Reviews
 * -----------------------------------------------------
 * Retrieves all reviews from the database with filtering,
 * sorting, and pagination options.
 *
 * Filters supported:
 * - `patientEmail`: Get reviews by specific patient
 * - `doctorEmail`: Get reviews for specific doctor
 *
 * @param filters - Filtering options
 * @param options - Pagination and sorting options
 * @returns Paginated review list with doctor and patient info
 */
const getAllFromDB = async (filters: any, options: IOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { patientEmail, doctorEmail } = filters;
  const andConditions = [];

  // 🧍 Filter by patient email
  if (patientEmail) {
    andConditions.push({
      patient: { email: patientEmail },
    });
  }

  // 🩺 Filter by doctor email
  if (doctorEmail) {
    andConditions.push({
      doctor: { email: doctorEmail },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Retrieve reviews with related doctor and patient data
  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      // appointment: true, // uncomment if needed
    },
  });

  // 📊 Count total matching records for pagination
  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * 📦 Export ReviewService
 * -----------------------------------------------------
 * Provides review-related business logic methods.
 */
export const ReviewService = {
  insertIntoDB,
  getAllFromDB,
};
