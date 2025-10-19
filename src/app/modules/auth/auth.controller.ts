import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
  // console.log("login: ", req.body)
  const result = await AuthService.login(req.body);
  // console.log(req)
  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60
  });

  res.cookie("refreshToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 90
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully!",
    data: {
        needPasswordChange: result.needPasswordChange
    },
  });
});

export const AuthController = {
  login,
};
