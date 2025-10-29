import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

/**
 * 🧩 Global Error Handler Middleware
 * -----------------------------------------------------
 * Handles all uncaught errors throughout the application and
 * sends a standardized JSON response to the client.
 *
 * ✅ Supports Prisma-specific error handling for better clarity.
 * ✅ Prevents the app from crashing on unhandled exceptions.
 *
 * @param err - The error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  // Default error response structure
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  /**
   * 🧠 Handle Prisma Known Request Errors
   * Handles specific Prisma error codes to return more descriptive messages.
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      (message = "Duplicate key error"),
        (error = err.meta),
        (statusCode = httpStatus.CONFLICT);
    }
    if (err.code === "P1000") {
      (message = "Authentication failed against database server"),
        (error = err.meta),
        (statusCode = httpStatus.BAD_GATEWAY);
    }
    if (err.code === "P2003") {
      (message = "Foreign key constraint failed"),
        (error = err.meta),
        (statusCode = httpStatus.BAD_REQUEST);
    }
  }
  /**
   * 🧾 Prisma Validation Error
   * Occurs when input data doesn't match Prisma schema.
   */
  else if (err instanceof Prisma.PrismaClientValidationError) {
    (message = "Validation Error"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  }
  /**
   * ❓ Unknown Prisma Request Error
   * Handles unexpected errors from Prisma.
   */
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    (message = "Unknown Prisma error occured!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  }
  /**
   * ⚙️ Prisma Initialization Error
   * Triggered when the Prisma client fails to initialize properly.
   */
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    (message = "Prisma client failed to initialize!"),
      (error = err.message),
      (statusCode = httpStatus.BAD_REQUEST);
  }

  // 🧾 Send standardized JSON response
  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
