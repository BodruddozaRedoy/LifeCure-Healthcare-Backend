import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { createPatientType } from "./user.types";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";

const createPatient = async (payload: Request) => {
  try {
    console.log("Payload:", payload);
    if (payload.file) {
      const uploadedResult = await fileUploader.uploadToCloudinary(
        payload.file
      );
      console.log(uploadedResult);
      payload.body.patient.profilePhoto = uploadedResult?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(payload.body.password, 10);

    const result = await prisma.$transaction(async (tnx) => {
      // Step 1: Create user
      const user = await tnx.user.create({
        data: {
          email: payload.body.patient.email,
          password: hashedPassword,
        },
      });

      // Step 2: Create patient profile
      const patient = await tnx.patient.create({
        data: payload.body.patient,
      });

      return { user, patient };
    });

    return result;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error; // Bubble up error to controller
  }
};

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

const getAllFromDB = async (filters: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { search, ...filterData } = filters;
  const andConditions: Prisma.UserWhereInput[] = [];
  if (search) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: "insensitive",
        },
      })),
    });
  }

  if(Object.keys(filterData).length > 0){
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    })
  }
  const result = await prisma.user.findMany({
    skip: skip,
    take: limit,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  return result;
};

export const UserService = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB,
};
