import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import config from "../../config";

/**
 * 🧩 Multer Disk Storage Configuration
 * ------------------------------------
 * Handles temporary file uploads before sending them to Cloudinary.
 */
const storage = multer.diskStorage({
  /** 🗂️ Set upload destination */
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "/uploads"));
  },

  /** 🏷️ Generate a unique file name to avoid collisions */
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * 📦 Multer Middleware Instance
 * Used in routes to handle single/multiple file uploads.
 *
 * Example usage:
 *   router.post('/upload', fileUploader.upload.single('image'), controllerFn);
 */
const upload = multer({ storage });

/**
 * ☁️ Upload File to Cloudinary
 * ------------------------------------
 * Uploads a file stored locally (via Multer) to Cloudinary
 * and returns the upload result.
 *
 * @param file - The file object from Multer
 * @returns Cloudinary upload response object
 */
const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    // Configure Cloudinary credentials dynamically
    cloudinary.config({
      cloud_name: config.cloudinary.cloud_name,
      api_key: config.cloudinary.api_key,
      api_secret: config.cloudinary.api_secret,
    });

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: file.filename,
      folder: "uploads", // Optional: organize uploads inside a folder
    });

    return result;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new Error("Cloudinary upload failed");
  }
};

/**
 * 📤 fileUploader Utility
 * Provides both:
 *  - `upload`: Multer middleware for local uploads
 *  - `uploadToCloudinary`: Function to push files to Cloudinary
 */
export const fileUploader = {
  upload,
  uploadToCloudinary,
};
