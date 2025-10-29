import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { Admin, Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import { userSearchableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";
import { fileUploader } from "../../helpers/fileUploader";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 👤 UserService
 * -----------------------------------------------------
 * Handles all user-related database and business logic.
 * Includes:
 * - User creation (Admin, Doctor, Patient)
 * - Profile retrieval and updates
 * - Account status management
 * - Filtering, searching, and pagination
 */

/**
 * 🏥 Create Patient
 * -----------------------------------------------------
 * Creates a new Patient user and their associated User record.
 * - Hashes password before saving
 * - Uploads optional profile photo to Cloudinary
 *
 * @param req - Express request containing patient data and optional file
 * @returns Created patient record
 */
const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
  }

  const hashPassword = await bcrypt.hash(req.body.password, 10);

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

/**
 * 🧑‍💼 Create Admin
 * -----------------------------------------------------
 * Creates a new Admin user with corresponding User record.
 * - Handles optional profile image upload
 * - Uses Prisma transaction for atomic operations
 *
 * @param req - Express request containing admin data and optional file
 * @returns Created Admin record
 */
const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({ data: userData });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

/**
 * 👨‍⚕️ Create Doctor
 * -----------------------------------------------------
 * Creates a new Doctor user with linked User record.
 * - Handles optional image upload
 * - Passwords are hashed before insertion
 *
 * @param req - Express request containing doctor data and optional file
 * @returns Created Doctor record
 */
const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({ data: userData });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

/**
 * 📋 Get All Users
 * -----------------------------------------------------
 * Retrieves all users with filtering, searching, and pagination.
 *
 * @param params - Search and filter options
 * @param options - Pagination and sorting configuration
 * @returns Paginated list of users with metadata
 */
const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  // 🔍 Handle search term
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 🧭 Handle filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

/**
 * 🙋‍♂️ Get My Profile
 * -----------------------------------------------------
 * Retrieves the authenticated user's profile information
 * based on their role (Patient, Doctor, or Admin).
 *
 * @param user - Decoded JWT payload
 * @returns Combined user and role-specific profile data
 */
const getMyProfile = async (user: IJWTPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: user.email, status: UserStatus.ACTIVE },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileData;

  if (userInfo.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUnique({ where: { email: userInfo.email } });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUnique({ where: { email: userInfo.email } });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({ where: { email: userInfo.email } });
  }

  return { ...userInfo, ...profileData };
};

/**
 * 🔄 Change Profile Status
 * -----------------------------------------------------
 * Updates a user's account status (e.g., ACTIVE, DELETED).
 *
 * @param id - User ID
 * @param payload - Object containing new status
 * @returns Updated user record
 */
const changeProfileStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  await prisma.user.findUniqueOrThrow({ where: { id } });

  const updateUserStatus = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return updateUserStatus;
};

/**
 * ✏️ Update My Profile
 * -----------------------------------------------------
 * Allows an authenticated user to update their profile
 * (Admin, Doctor, or Patient).
 * - Supports image upload
 *
 * @param user - Authenticated user (JWT payload)
 * @param req - Express request containing updated fields
 * @returns Updated profile data
 */
const updateMyProfie = async (user: IJWTPayload, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email, status: UserStatus.ACTIVE },
  });

  if (req.file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(req.file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  }

  return { ...profileInfo };
};

/**
 * 📦 Export UserService
 * -----------------------------------------------------
 * Provides access to all service-layer user functions.
 */
export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
  getMyProfile,
  changeProfileStatus,
  updateMyProfie,
};
