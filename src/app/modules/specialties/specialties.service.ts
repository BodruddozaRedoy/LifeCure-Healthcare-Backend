import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";
import { fileUploader } from "../../helpers/fileUploader";

/**
 * 🩺 SpecialtiesService
 * -----------------------------------------------------
 * Contains all business logic and database operations
 * for managing medical specialties (create, retrieve, delete).
 */

/**
 * 🆕 inserIntoDB
 * -----------------------------------------------------
 * Creates a new specialty record.
 * - If a file is provided, uploads it to Cloudinary.
 * - Stores the uploaded image URL as the specialty icon.
 *
 * @param req - Express request object containing file and body data
 * @returns The newly created specialty record
 */
const inserIntoDB = async (req: Request) => {
  const file = req.file;

  // ✅ Upload the specialty icon to Cloudinary if provided
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  // 🗄️ Create a new specialty record in the database
  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

/**
 * 📋 getAllFromDB
 * -----------------------------------------------------
 * Retrieves all specialties from the database.
 *
 * @returns Array of all specialties
 */
const getAllFromDB = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};

/**
 * ❌ deleteFromDB
 * -----------------------------------------------------
 * Deletes a specialty from the database by its ID.
 *
 * @param id - Specialty ID
 * @returns Deleted specialty record
 */
const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: { id },
  });
  return result;
};

/**
 * 📦 Export SpecialtiesService
 * -----------------------------------------------------
 * Provides access to all service-layer functions related to specialties.
 */
export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
