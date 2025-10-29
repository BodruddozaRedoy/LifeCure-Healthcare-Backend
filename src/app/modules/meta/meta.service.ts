import { PaymentStatus, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";

/**
 * 📊 MetaService
 * -----------------------------------------------------
 * Handles dashboard metadata aggregation for different user roles:
 * - Admin: Global platform statistics
 * - Doctor: Personalized metrics like appointments, reviews, revenue, etc.
 * - Patient: Appointment and prescription statistics
 */

/**
 * 🔹 Fetch Dashboard Meta Data
 * -----------------------------------------------------
 * Returns dynamic dashboard analytics based on user role.
 *
 * @param user - Authenticated user from JWT payload
 * @returns Object containing aggregated dashboard statistics
 */
const fetchDashboardMetaData = async (user: IJWTPayload) => {
  let metadata;
  switch (user.role) {
    case UserRole.ADMIN:
      metadata = await getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metadata = await getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metadata = await getPatientMetaData(user);
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role!");
  }

  return metadata;
};

/**
 * 🩺 Doctor Dashboard Metadata
 * -----------------------------------------------------
 * Provides doctor-specific insights including:
 * - Appointment count
 * - Unique patient count
 * - Review count
 * - Total revenue from paid appointments
 * - Appointment status distribution
 */
const getDoctorMetaData = async (user: IJWTPayload) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { doctorId: doctorData.id },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: { id: true },
  });

  const reviewCount = await prisma.review.count({
    where: { doctorId: doctorData.id },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      appointment: { doctorId: doctorData.id },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { doctorId: doctorData.id },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount,
    reviewCount,
    patientCount: patientCount.length,
    totalRevenue,
    formattedAppointmentStatusDistribution,
  };
};

/**
 * 👩‍⚕️ Patient Dashboard Metadata
 * -----------------------------------------------------
 * Provides patient-specific statistics including:
 * - Appointment count
 * - Prescription count
 * - Review count
 * - Appointment status breakdown
 */
const getPatientMetaData = async (user: IJWTPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { patientId: patientData.id },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: { patientId: patientData.id },
  });

  const reviewCount = await prisma.review.count({
    where: { patientId: patientData.id },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { patientId: patientData.id },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    formattedAppointmentStatusDistribution,
  };
};

/**
 * 🧑‍💼 Admin Dashboard Metadata
 * -----------------------------------------------------
 * Provides platform-wide analytics including:
 * - Total counts for patients, doctors, admins, appointments, and payments
 * - Total revenue (only PAID payments)
 * - Data for bar and pie charts (visual analytics)
 */
const getAdminMetaData = async () => {
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });

  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();

  return {
    patientCount,
    doctorCount,
    adminCount,
    appointmentCount,
    paymentCount,
    totalRevenue,
    barChartData,
    pieChartData,
  };
};

/**
 * 📊 Bar Chart Data (Admin Dashboard)
 * -----------------------------------------------------
 * Groups appointment creation data by month to display
 * appointment growth trends over time.
 */
const getBarChartData = async () => {
  const appointmentCountPerMonth = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;
  return appointmentCountPerMonth;
};

/**
 * 🥧 Pie Chart Data (Admin Dashboard)
 * -----------------------------------------------------
 * Groups appointments by their current status to visualize
 * proportions of completed, pending, or canceled appointments.
 */
const getPieChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const formatedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return formatedAppointmentStatusDistribution;
};

/**
 * 📦 Export MetaService
 * -----------------------------------------------------
 * Exposes methods for fetching dashboard metadata by role.
 */
export const MetaService = {
  fetchDashboardMetaData,
};
