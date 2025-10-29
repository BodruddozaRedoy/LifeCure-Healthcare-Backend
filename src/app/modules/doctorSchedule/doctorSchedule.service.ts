import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 🗓️ DoctorScheduleService
 * -----------------------------------------------------
 * Handles all database logic for managing doctor schedules,
 * including creation, retrieval, filtering, and deletion.
 */

/**
 * 🆕 Insert Doctor Schedules
 * -----------------------------------------------------
 * Allows a doctor to create multiple schedule slots at once.
 * Maps provided schedule IDs to the authenticated doctor.
 *
 * @param user - Authenticated doctor from JWT
 * @param payload - Object containing an array of scheduleIds
 */
const insertIntoDB = async (
  user: IJWTPayload,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  return await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
};

/**
 * 📅 Get My Schedule
 * -----------------------------------------------------
 * Retrieves schedules for the authenticated doctor.
 * Supports filtering by date range, booking status, and pagination.
 *
 * @param filters - Query filters (startDate, endDate, isBooked, etc.)
 * @param options - Pagination and sorting options
 * @param user - Authenticated doctor from JWT
 */
const getMySchedule = async (
  filters: any,
  options: IOptions,
  user: IJWTPayload
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { startDate, endDate, ...filterData } = filters;
  const andConditions = [];

  // 🗓️ Filter by date range
  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: { gte: startDate },
          },
        },
        {
          schedule: {
            endDateTime: { lte: endDate },
          },
        },
      ],
    });
  }

  // ⚙️ Handle booking status and other filters
  if (Object.keys(filterData).length > 0) {
    if (typeof filterData.isBooked === "string") {
      filterData.isBooked = filterData.isBooked === "true";
    }

    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch schedules
  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {},
  });

  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * ❌ Delete Doctor Schedule
 * -----------------------------------------------------
 * Deletes a schedule belonging to the authenticated doctor.
 * Prevents deletion if the schedule is already booked.
 *
 * @param user - Authenticated doctor from JWT
 * @param scheduleId - Schedule ID to delete
 */
const deleteFromDB = async (user: IJWTPayload, scheduleId: string) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  // 🚫 Prevent deletion if the schedule is already booked
  const isBookedSchedule = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: doctorData.id,
      scheduleId,
      isBooked: true,
    },
  });

  if (isBookedSchedule) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot delete this schedule because it is already booked!"
    );
  }

  // 🗑️ Delete unbooked schedule
  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId,
      },
    },
  });

  return result;
};

/**
 * 📋 Get All Doctor Schedules (Admin/Doctor/Patient)
 * -----------------------------------------------------
 * Retrieves all doctor schedules in the system.
 * Supports filtering by doctor name, booking status, and pagination.
 *
 * @param filters - Filtering options
 * @param options - Pagination and sorting options
 */
const getAllFromDB = async (filters: any, options: IOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  // 🔍 Search by doctor name
  if (searchTerm) {
    andConditions.push({
      doctor: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    });
  }

  // ⚙️ Apply other filters (e.g., isBooked)
  if (Object.keys(filterData).length > 0) {
    if (typeof filterData.isBooked === "string") {
      filterData.isBooked = filterData.isBooked === "true";
    }

    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: any =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch all schedules
  const result = await prisma.doctorSchedules.findMany({
    include: {
      doctor: true,
      schedule: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {},
  });

  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * 📦 Export DoctorScheduleService
 * -----------------------------------------------------
 * Provides a clean service interface for doctor schedule operations.
 */
export const DoctorScheduleService = {
  insertIntoDB,
  getAllFromDB,
  getMySchedule,
  deleteFromDB,
};
