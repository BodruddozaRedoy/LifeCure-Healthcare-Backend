import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

/**
 * 🧾 Request Validation Middleware
 * -----------------------------------------------------
 * Validates incoming request data using a provided Zod schema.
 *
 * ✅ Ensures that incoming requests have the correct shape and data types.
 * ✅ Prevents invalid or malformed data from reaching route handlers.
 *
 * @param schema - A Zod schema defining the expected request structure
 * @returns Express middleware that validates `req.body`
 *
 * Example usage:
 *   router.post('/create-user', validateRequest(UserSchema), userController.create);
 */
const validateRequest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against the schema
      await schema.parseAsync({
        body: req.body,
      });

      // ✅ If valid, proceed to the next middleware/handler
      return next();
    } catch (err) {
      // ❌ If validation fails, forward the error to the global error handler
      next(err);
    }
  };

export default validateRequest;
