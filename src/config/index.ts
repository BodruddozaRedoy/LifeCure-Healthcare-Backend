import dotenv from 'dotenv';
import path from 'path';

/**
 * 🧩 Load Environment Variables
 * Reads variables from the `.env` file located in the project root.
 */
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * ⚙️ Application Configuration
 * Centralized config object for all environment-dependent values.
 * 
 * This makes environment management cleaner, avoids repeating `process.env`,
 * and helps catch missing values early if you add runtime validation.
 */
export default {
  /** 🌍 Environment Setup */
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  /** ☁️ Cloudinary Configuration */
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  /** 🔑 OpenRouter (AI / API Gateway) Configuration */
  openRouterApiKey: process.env.OPENROUTER_API_KEY,

  /** 💳 Stripe Payment Configuration */
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,

  /** 📧 Email Sender Credentials */
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },

  /** 🔐 JWT (Auth Token) Configuration */
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },

  /** 🧂 Password Hashing Configuration */
  salt_round: process.env.SALT_ROUND,

  /** 🔗 Password Reset Link */
  reset_pass_link: process.env.RESET_PASS_LINK,
};
