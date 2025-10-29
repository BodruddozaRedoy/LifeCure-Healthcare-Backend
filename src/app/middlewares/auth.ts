import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import { jwtHelper } from "../helpers/jwtHelper";

/**
 * 🔐 Authentication Middleware
 * -----------------------------------------------------
 * Verifies the JWT token from cookies and checks if the user
 * has the required role(s) to access a specific route.
 *
 * ✅ Steps:
 * 1. Extracts the access token from cookies.
 * 2. Verifies the token using the app’s JWT secret key.
 * 3. Attaches the decoded user info to `req.user`.
 * 4. Optionally checks if the user has a permitted role.
 *
 * @param roles - Optional list of roles allowed to access the route
 * @returns Express middleware function
 *
 * Example usage:
 *   router.get('/admin', auth('admin'), adminController.getDashboard);
 */
const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1️⃣ Get token from cookies
      const token = req.cookies.accessToken;

      // 2️⃣ If no token found → unauthorized
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // 3️⃣ Verify token using JWT helper
      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      // 4️⃣ Attach decoded user data to request object
      req.user = verifyUser;

      // 5️⃣ Role-based access check (if roles are defined)
      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // ✅ Proceed to the next middleware or route handler
      next();
    } catch (err) {
      // ❌ Forward any errors to the global error handler
      next(err);
    }
  };
};

export default auth;
