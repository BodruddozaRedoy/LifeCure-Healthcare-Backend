import { jwtHelper } from './../../helpers/jwtHelper';
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";
import { UserStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const login = async (payload: { email: string; password: string }) => {
  console.log(payload);

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: payload.email,
        status: UserStatus.ACTIVE,
      },
    });

    const isPassCorrect = await bcrypt.compare( payload.password,user.password);
    if (!isPassCorrect) {
      throw new Error("Password is incorrect!");
    }
    const accessToken = jwtHelper.generateToken({email: user.email, role: user.role},process.env.JWT_SECRET!,"1h");

    const refreshToken = jwtHelper.generateToken({email: user.email, role: user.role},process.env.JWT_SECRET!,"90d")
    return{
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error; // Bubble up error to controller
  }
};

export const AuthService = {
  login,
};
