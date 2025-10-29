import { addMinutes, addHours, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { Prisma } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 🗓️ ScheduleService
 * -----------------------------------------------------
 * Handles schedule management logic including:
 * - Creating schedules with time intervals
 * - Fetching available schedules for doctors
 * - Deleting schedules
 */

/**
 * 🆕 insertIntoDB
 * -----------------------------------------------------
 * Creates multiple schedule slots between given start and end dates/times.
 * Each slot has a 30-minute interval.
 *
 * Workflow:
 * 1. Loop through each date between startDate and endDate.
 * 2. For each date, generate time slots (e.g., 10:00 → 10:30 → 11:00).
 * 3. Check if a slot already exists before creating a new one.
 *
 * @param payload - Includes startDate, endDate, startTime, endTime
 * @returns List of newly created schedule slots
 */
const insertIntoDB = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;

  const intervalTime = 30; // 30-minute interval
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    // ⏰ Build full datetime for start and end of each day
    const startDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])),
        Number(endTime.split(":")[1])
      )
    );

    // 🔁 Generate 30-minute time slots within the range
    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      // ⚠️ Avoid duplicate schedule slots
      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({ data: scheduleData });
        schedules.push(result);
      }

      // Move to next slot
      slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime);
    }

    // Move to next date
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

/**
 * 👨‍⚕️ schedulesForDoctor
 * -----------------------------------------------------
 * Retrieves all available schedules that a doctor has not yet booked.
 * Supports filtering by date range and pagination.
 *
 * Workflow:
 * 1. Get all schedule IDs already assigned to the doctor.
 * 2. Return all remaining schedules not in that list.
 *
 * @param user - Authenticated doctor info (from JWT)
 * @param filters - Optional startDateTime and endDateTime filters
 * @param options - Pagination and sorting options
 * @returns Paginated list of available schedules
 */
const schedulesForDoctor = async (
  user: IJWTPayload,
  fillters: any,
  options: IOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } = fillters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  // 🕓 Filter by date range if provided
  if (filterStartDateTime && filterEndDateTime) {
    andConditions.push({
      AND: [
        { startDateTime: { gte: filterStartDateTime } },
        { endDateTime: { lte: filterEndDateTime } },
      ],
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 🧾 Fetch all schedule IDs already assigned to this doctor
  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: { doctor: { email: user.email } },
    select: { scheduleId: true },
  });

  const doctorScheduleIds = doctorSchedules.map((schedule) => schedule.scheduleId);

  // 🗓️ Fetch all unassigned schedules
  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: { notIn: doctorScheduleIds },
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

/**
 * ❌ deleteScheduleFromDB
 * -----------------------------------------------------
 * Deletes a specific schedule by ID.
 *
 * @param id - Schedule ID to delete
 * @returns Deleted schedule record
 */
const deleteScheduleFromDB = async (id: string) => {
  return await prisma.schedule.delete({
    where: { id },
  });
};

/**
 * 📦 Export ScheduleService
 * -----------------------------------------------------
 * Provides schedule management business logic for controllers.
 */
export const ScheduleService = {
  insertIntoDB,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
