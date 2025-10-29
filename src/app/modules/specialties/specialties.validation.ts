import { z } from "zod";

/**
 * 🩺 Specialties Validation Schema
 * -----------------------------------------------------
 * Defines validation rules for creating a new specialty.
 * Ensures the `title` field is present and of type string.
 */

/**
 * 🆕 Create Specialty Schema
 * -----------------------------------------------------
 * Validates incoming request data when creating a specialty.
 */
const create = z.object({
  title: z.string({
    error: "Title is required!", // ✅ Proper Zod syntax
  }),
});

/**
 * 📦 Export Specialties Validation
 * -----------------------------------------------------
 * Exposes validation schemas for use in routes or controllers.
 */
export const SpecialtiesValidtaion = {
  create,
};
