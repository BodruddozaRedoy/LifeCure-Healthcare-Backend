import { prisma } from "../../shared/prisma";
import { createPatientType } from "./user.types";
import bcrypt from "bcryptjs";

const createPatient = async (payload: createPatientType) => {
  console.log(payload);
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
      },
    });
    return await tnx.patient.create({
      data: {
        name: payload.name,
        email: payload.email,
      },
    });
  });
  return result;
};

export const UserService = {
  createPatient,
};
