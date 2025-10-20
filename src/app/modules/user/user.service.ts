import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { createPatientType } from "./user.types";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";
import { Admin, Doctor, UserRole } from "@prisma/client";

const createPatient = async (payload: Request) => {
  try {
    console.log("Payload:", payload);
    if(payload.file){
      const uploadedResult = await fileUploader.uploadToCloudinary(payload.file)
      console.log(uploadedResult)
      payload.body.patient.profilePhoto = uploadedResult?.secure_url
    }

    const hashedPassword = await bcrypt.hash(payload.body.password, 10);

    const result = await prisma.$transaction(async (tnx) => {
      // Step 1: Create user
      const user = await tnx.user.create({
        data: {
          email: payload.body.patient.email,
          password: hashedPassword
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
        req.body.admin.profilePhoto = uploadToCloudinary?.secure_url
    }

    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdAdminData = await transactionClient.admin.create({
            data: req.body.admin
        });

        return createdAdminData;
    });

    return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url
    }
    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdDoctorData = await transactionClient.doctor.create({
            data: req.body.doctor
        });

        return createdDoctorData;
    });

    return result;
};

const getAllFromDB = async({page, limit, search, sortBy, sortOrder}:{page:number, limit:number, search:string, sortBy:string, sortOrder:string}) => {
  const pageNum = page || 1;
  const limitNum = limit || 10;
  const result = await prisma.user.findMany({
    skip: (pageNum-1) * limitNum,
    take: limitNum,
    where: {
      email: {
        contains: search,
        mode: "insensitive"
      }
    },
    orderBy: sortBy && sortOrder ? {
      [sortBy]:sortOrder
    }:{
      createdAt: "desc"
    }
  })
  return result
}

export const UserService = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllFromDB
};
