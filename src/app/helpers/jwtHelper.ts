import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

/**
 * 🔐 Generate a JWT Token
 * -----------------------------------------------------
 * Creates a signed JSON Web Token using the provided payload,
 * secret key, and expiration time.
 *
 * @param payload - Data to include in the token (e.g., user info)
 * @param secret - Secret key used for signing the token
 * @param expiresIn - Expiration duration (e.g., "1h", "7d")
 * @returns A signed JWT string
 */
const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);

  return token;
};

/**
 * ✅ Verify a JWT Token
 * -----------------------------------------------------
 * Decodes and validates a JWT token using the provided secret key.
 * Throws an error if the token is invalid or expired.
 *
 * @param token - The JWT token string to verify
 * @param secret - Secret key used to verify the token
 * @returns The decoded token payload if valid
 */
const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * 🧩 jwtHelper
 * -----------------------------------------------------
 * Utility object that provides helper methods
 * for generating and verifying JWT tokens.
 */
export const jwtHelper = {
  generateToken,
  verifyToken,
};
