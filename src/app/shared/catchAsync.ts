import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * 🧩 catchAsync
 * -----------------------------------------------------
 * Utility function that wraps async Express route handlers
 * to automatically catch and forward errors to the global
 * error-handling middleware.
 *
 * 💡 Why:
 * Without this wrapper, you'd need repetitive try-catch blocks
 * in every controller for async operations.
 *
 * @param fn - Async Express route handler (controller)
 * @returns Wrapped function that passes errors to next()
 *
 * ✅ Example:
 * router.get("/", catchAsync(async (req, res) => {
 *   const users = await prisma.user.findMany();
 *   res.json(users);
 * }));
 */
const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default catchAsync;
