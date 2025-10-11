import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { createPatientType } from "./user.types";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";

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

export const UserService = {
  createPatient,
};
