import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, "uploads/avatars");
  },
  filename: (_req, file, callback) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueName + path.extname(file.originalname));
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("/image")) {
      callback(new Error("Only image files allowed"));
    }
    callback(null, true);
  },
});
