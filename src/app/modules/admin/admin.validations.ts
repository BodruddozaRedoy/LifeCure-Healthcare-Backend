import { z } from "zod";

/**
 * 🧾 Admin Validation Schemas
 * -----------------------------------------------------
 * Defines Zod validation rules for Admin-related request bodies.
 *
 * This ensures that incoming data is type-safe and valid before
 * reaching the controller or service layers.
 */

/**
 * ✏️ Update Admin Schema
 * -----------------------------------------------------
 * Validates the request body for updating an admin.
 * Both fields are optional, allowing partial updates.
 *
 * Fields:
 * - name: string (optional)
 * - contactNumber: string (optional)
 */
const update = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

/**
 * 📦 Export Validation Schemas
 * -----------------------------------------------------
 * Provides a centralized collection of all Admin-related
 * Zod schemas for use in routes and middleware.
 */
export const adminValidationSchemas = {
  update,
};
