import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchAbleFields } from "./admin.constant";
import { IAdminFilterRequest } from "./admin.interface";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 🧩 AdminService
 * -----------------------------------------------------
 * Contains all business logic for interacting with the Admin model.
 * Handles CRUD operations, pagination, filtering, and transactional deletions.
 */

/**
 * 📄 Get All Admins
 * -----------------------------------------------------
 * Retrieves a paginated list of admins from the database
 * with support for searching and filtering.
 *
 * @param params - Filter and search parameters
 * @param options - Pagination and sorting options
 * @returns List of admins with pagination metadata
 */
const getAllFromDB = async (params: IAdminFilterRequest, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.AdminWhereInput[] = [];

  // 🔍 Search condition: matches searchTerm against defined searchable fields
  if (params.searchTerm) {
    andCondions.push({
      OR: adminSearchAbleFields.map(field => ({
        [field]: {
          contains: params.searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // 🎯 Apply additional filters (e.g., role, email, etc.)
  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // 🚫 Exclude deleted records
  andCondions.push({ isDeleted: false });

  const whereConditons: Prisma.AdminWhereInput = { AND: andCondions };

  // 📦 Fetch filtered and paginated admin data
  const result = await prisma.admin.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
  });

  // 📊 Get total count for pagination metadata
  const total = await prisma.admin.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/**
 * 🔍 Get Admin by ID
 * -----------------------------------------------------
 * Fetches a single admin by ID if not soft-deleted.
 *
 * @param id - Admin ID
 * @returns Admin record or null if not found
 */
const getByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  return result;
};

/**
 * ✏️ Update Admin
 * -----------------------------------------------------
 * Updates an admin record by ID.
 * Throws an error if the admin does not exist or is deleted.
 *
 * @param id - Admin ID
 * @param data - Fields to update
 * @returns Updated admin record
 */
const updateIntoDB = async (id: string, data: Partial<Admin>): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: { id },
    data,
  });

  return result;
};

/**
 * ❌ Delete Admin (Hard Delete)
 * -----------------------------------------------------
 * Permanently removes an admin record and its related user entry.
 * Runs within a transaction to maintain data consistency.
 *
 * @param id - Admin ID
 * @returns Deleted admin record
 */
const deleteFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: { id },
    });

    await transactionClient.user.delete({
      where: { email: adminDeletedData.email },
    });

    return adminDeletedData;
  });

  return result;
};

/**
 * 🗑️ Soft Delete Admin
 * -----------------------------------------------------
 * Marks an admin as deleted (isDeleted = true) instead of removing it.
 * Also updates the related user’s status to `DELETED`.
 * Runs within a transaction for atomicity.
 *
 * @param id - Admin ID
 * @returns Updated admin record with deleted flag
 */
const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: adminDeletedData.email },
      data: { status: UserStatus.DELETED },
    });

    return adminDeletedData;
  });

  return result;
};

/**
 * 📦 Export AdminService
 * -----------------------------------------------------
 * Provides a structured service interface for Admin CRUD operations.
 */
export const AdminService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDeleteFromDB,
};
