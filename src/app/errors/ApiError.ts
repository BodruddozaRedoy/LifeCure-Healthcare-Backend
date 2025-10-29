/**
 * 🌐 ApiError
 * -------------------------
 * A custom error class that extends the built-in Error object.
 *
 * ✅ Purpose:
 * Provides a consistent structure for handling application-level errors,
 * especially those returned as HTTP responses (e.g., 400, 404, 500).
 *
 * ✅ Example usage:
 * throw new ApiError(404, "User not found");
 */
class ApiError extends Error {
  /** HTTP status code (e.g., 400, 404, 500) */
  statusCode: number;

  /**
   * @param statusCode - The HTTP status code to associate with this error
   * @param message - A human-readable error message
   * @param stack - (Optional) Stack trace for debugging
   */
  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);

    this.statusCode = statusCode;

    // Maintain correct prototype chain (important for 'instanceof' checks)
    Object.setPrototypeOf(this, new.target.prototype);

    // Preserve or capture stack trace for better debugging
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
