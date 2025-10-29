import { Gender } from "@prisma/client";
import z from "zod";

/**
 * 🩺 UserValidation
 * -----------------------------------------------------
 * Defines all Zod validation schemas for user creation requests.
 * Includes input validation for:
 * - Patient registration
 * - Admin creation
 * - Doctor onboarding
 */

/**
 * 👨‍⚕️ createPatientValidationSchema
 * -----------------------------------------------------
 * Validates incoming data when creating a Patient user.
 *
 * Required:
 * - password: string
 * - patient.name: string (non-empty)
 * - patient.email: string (non-empty)
 *
 * Optional:
 * - patient.address
 */
const createPatientValidationSchema = z.object({
  password: z.string(),
  patient: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().nonempty("Email is required"),
    address: z.string().optional(),
  }),
});

/**
 * 🧑‍💼 createAdminValidationSchema
 * -----------------------------------------------------
 * Validates incoming data when creating an Admin user.
 *
 * Required:
 * - password
 * - admin.name
 * - admin.email
 * - admin.contactNumber
 */
const createAdminValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
  }),
});

/**
 * 🩺 createDoctorValidationSchema
 * -----------------------------------------------------
 * Validates incoming data when creating a Doctor user.
 *
 * Required:
 * - password
 * - doctor.name
 * - doctor.email
 * - doctor.contactNumber
 * - doctor.registrationNumber
 * - doctor.gender (MALE | FEMALE)
 * - doctor.appointmentFee
 * - doctor.qualification
 * - doctor.currentWorkingPlace
 * - doctor.designation
 *
 * Optional:
 * - doctor.address
 * - doctor.experience
 */
const createDoctorValidationSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  doctor: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      error: "Reg number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({
      error: "Appointment fee is required",
    }),
    qualification: z.string({
      error: "Qualification is required",
    }),
    currentWorkingPlace: z.string({
      error: "Current working place is required!",
    }),
    designation: z.string({
      error: "Designation is required!",
    }),
  }),
});

/**
 * 📦 Export
 * -----------------------------------------------------
 * Exports all user validation schemas for use in controllers and routes.
 */
export const UserValidation = {
  createPatientValidationSchema,
  createAdminValidationSchema,
  createDoctorValidationSchema,
};
