import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File) => {
  // console.log(file)
  // Configuration
  cloudinary.config({
    cloud_name: "dcrs7po93",
    api_key: "656644789892135",
    api_secret: "oSmWqHOQcBC7yILWBCCGiQQG1Uw", // Click 'View API Keys' above to copy your API secret
  });

  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(
      file.path,
      {
        public_id: file.filename,
      }
    )
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);
  return uploadResult
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
