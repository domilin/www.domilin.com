import { Schema, Document, model } from "mongoose";
import { Wallpaper } from "../interfaces/wallpaper.interface";

const wallpaperSchema = new Schema(
  {
    main: { required: true, type: Boolean, default: false },
    url: { required: true, type: String },
  },
  { timestamps: true }
);

export const WallpaperModel = model<Wallpaper & Document>("Wallpaper", wallpaperSchema);
