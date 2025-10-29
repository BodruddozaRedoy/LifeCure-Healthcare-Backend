import z from "zod";

/**
 * 🧾 Doctor Schedule Validation
 * -----------------------------------------------------
 * Defines validation schema for creating doctor schedules.
 * Ensures that the request body includes an array of valid schedule IDs.
 */

const createDoctorScheduleValidationSchema = z.object({
  body: z.object({
    // 🔹 List of schedule IDs (must be an array of strings)
    scheduleIds: z.array(z.string()),
  }),
});

/**
 * 📦 Export DoctorScheduleValidation
 * -----------------------------------------------------
 * Provides centralized validation schemas for doctor schedule routes.
 */
export const DoctorScheduleValidation = {
  createDoctorScheduleValidationSchema,
};
