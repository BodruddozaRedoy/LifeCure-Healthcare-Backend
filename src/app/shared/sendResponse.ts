import { Response } from "express";

/**
 * 🚀 sendResponse
 * -----------------------------------------------------
 * A standardized API response helper for Express.
 *
 * Ensures consistent response format across the entire application.
 * Works with generics to support flexible `data` payload types.
 *
 * @template T - The data type of the response payload.
 *
 * @param res - Express Response object
 * @param jsonData - Response configuration object
 *   @property {number} statusCode - HTTP status code
 *   @property {boolean} success - Whether the request was successful
 *   @property {string} message - A short descriptive message
 *   @property {object} [meta] - Optional pagination metadata
 *   @property {T | null | undefined} data - Actual response data
 *
 * ✅ Example:
 * sendResponse<User[]>(res, {
 *   statusCode: 200,
 *   success: true,
 *   message: "Users fetched successfully",
 *   meta: { page: 1, limit: 10, total: 50 },
 *   data: users,
 * });
 */
const sendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
    data: T | null | undefined;
  }
): void => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta ?? null,
    data: jsonData.data ?? null,
  });
};

export default sendResponse;
