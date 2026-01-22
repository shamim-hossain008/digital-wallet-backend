import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "admin-avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ with: 400, height: 400, crop: "fill", gravity: "face" }],
  }),
});

export const uploadAdminAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only JPG,PNG,WEBP allowed"));
    } else {
      cb(null, true);
    }
  },
});
