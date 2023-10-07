import * as multer from "multer";
import * as path from "path";
import { fileExtension } from "../utils";
import { anyType } from "../interfaces/types";

const staticPath = path.join(`${path.join(__dirname)}/../../static`);
export const upload = (
  type: "avatar" | "icon" | "wallpaper" | "article" | "wallpaperOfficial" | "poster" | "font"
): anyType => {
  const uploadPath =
    type === "wallpaperOfficial"
      ? `${staticPath}/upload/wallpapers/official/`
      : `${staticPath}/upload/${type}s/`;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const timestamp = new Date().getTime();
      const filename = `${type}-${timestamp}.${
        file.originalname === "blob" ? "png" : fileExtension(file.originalname)
      }`;
      cb(null, filename);
    },
  });
  const upload = multer({
    storage: storage,
    limits: {
      fileSize:
        type === "poster" || type === "font"
          ? 10 * 1024 * 1024
          : type === "wallpaper" || type === "article" || type === "wallpaperOfficial"
          ? 2 * 1024 * 1024
          : 512 * 1024,
    },
  });

  return upload.single(type);
};

export const uploadLarge = (): anyType => {
  const upload = multer({
    dest: `${staticPath}/temp/`,
    limits: {},
  });
  return upload.single("data");
};
