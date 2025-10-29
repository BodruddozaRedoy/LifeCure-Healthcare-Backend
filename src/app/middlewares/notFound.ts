import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

/**
 * 🚫 404 Not Found Middleware
 * -----------------------------------------------------
 * Handles all unmatched routes in the application.
 *
 * ✅ Returns a standardized JSON response for invalid or unknown endpoints.
 * ✅ Ensures the API responds gracefully instead of hanging or crashing.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction (for middleware chaining)
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
};

export default notFound;
