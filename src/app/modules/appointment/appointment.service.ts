import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IJWTPayload } from "../../types/common";
import { stripe } from "../../helpers/stripe";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 🩺 AppointmentService
 * -----------------------------------------------------
 * Handles all business logic for appointments, including:
 * - Creating appointments and Stripe payment sessions
 * - Fetching appointments (user or admin)
 * - Updating appointment status
 * - Auto-canceling unpaid appointments via cron jobs
 */

/**
 * 🆕 Create Appointment
 * -----------------------------------------------------
 * Creates a new appointment and initializes a Stripe payment session.
 *
 * @param user - Authenticated user (from JWT payload)
 * @param payload - Contains doctorId and scheduleId
 * @returns A Stripe payment URL for completing the booking
 */
const createAppointment = async (
  user: IJWTPayload,
  payload: { doctorId: string; scheduleId: string }
) => {
  // 1️⃣ Validate patient and doctor data
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { id: payload.doctorId, isDeleted: false },
  });

  // 2️⃣ Ensure selected schedule slot is available
  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  // 3️⃣ Create appointment, payment, and update booking status in a transaction
  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: { isBooked: true },
    });

    const transactionId = uuidv4();

    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    // 4️⃣ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: { name: `Appointment with ${doctorData.name}` },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `https://www.programming-hero.com/`,
      cancel_url: `https://next.programming-hero.com/`,
    });

    return { paymentUrl: session.url };
  });

  return result;
};

/**
 * 📋 Get My Appointments
 * -----------------------------------------------------
 * Retrieves all appointments for the authenticated user.
 * Supports filtering (status, paymentStatus) and pagination.
 *
 * @param user - Authenticated user (doctor or patient)
 * @param filters - Query filters
 * @param options - Pagination options
 * @returns List of appointments with pagination metadata
 */
const getMyAppointment = async (
  user: IJWTPayload,
  filters: any,
  options: IOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  // 🧍‍♂️ Role-based filtering
  if (user.role === UserRole.PATIENT) {
    andConditions.push({ patient: { email: user.email } });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({ doctor: { email: user.email } });
  }

  // 🔍 Apply additional filters
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: (filterData as any)[key] },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch appointments
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true },
  });

  const total = await prisma.appointment.count({ where: whereConditions });

  return {
    meta: { total, limit, page },
    data: result,
  };
};

/**
 * 🔄 Update Appointment Status
 * -----------------------------------------------------
 * Updates the appointment’s status (e.g., confirmed, canceled, completed).
 *
 * @param appointmentId - ID of the appointment to update
 * @param status - New status value
 * @param user - Authenticated user
 * @returns Updated appointment record
 */
const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IJWTPayload
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true },
  });

  // 🚫 Only the doctor who owns the appointment can update it
  if (user.role === UserRole.DOCTOR && user.email !== appointmentData.doctor.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
};

/**
 * 📂 Get All Appointments (Admin)
 * -----------------------------------------------------
 * Retrieves all appointments with optional filters and pagination.
 * Accessible only by admin users.
 */
const getAllFromDB = async (filters: any, options: IOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { patientEmail, doctorEmail, ...filterData } = filters;
  const andConditions: Prisma.AppointmentWhereInput[] = [];

  // 🔍 Filter by patient or doctor email
  if (patientEmail) {
    andConditions.push({ patient: { email: patientEmail } });
  } else if (doctorEmail) {
    andConditions.push({ doctor: { email: doctorEmail } });
  }

  // 🧾 Apply extra filter conditions
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch appointments and metadata
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: { doctor: true, patient: true },
  });

  const total = await prisma.appointment.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * ⏰ Cancel Unpaid Appointments
 * -----------------------------------------------------
 * Automatically cancels appointments that remain unpaid
 * for more than 30 minutes. Runs as a cron job.
 *
 * Steps:
 * 1️⃣ Find unpaid appointments older than 30 minutes.
 * 2️⃣ Delete associated payment and appointment records.
 * 3️⃣ Mark the corresponding schedule slots as available again.
 */
const cancelUnpaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: { lte: thirtyMinAgo },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tnx) => {
    await tnx.payment.deleteMany({
      where: { appointmentId: { in: appointmentIdsToCancel } },
    });

    await tnx.appointment.deleteMany({
      where: { id: { in: appointmentIdsToCancel } },
    });

    // 🩺 Reopen schedule slots for cancelled appointments
    for (const unPaidAppointment of unPaidAppointments) {
      await tnx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unPaidAppointment.doctorId,
            scheduleId: unPaidAppointment.scheduleId,
          },
        },
        data: { isBooked: false },
      });
    }
  });
};

/**
 * 📦 Export AppointmentService
 * -----------------------------------------------------
 * Provides all appointment-related operations as a service layer.
 */
export const AppointmentService = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllFromDB,
  cancelUnpaidAppointments,
};
