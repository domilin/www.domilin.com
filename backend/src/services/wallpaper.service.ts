import { ServiceReturn } from "../interfaces/public.interface";
import { Wallpaper } from "../interfaces/wallpaper.interface";
import { WallpaperModel } from "../models/wallpaper.model";

export default class WallpaperService {
  public async wallpaperGet(): ServiceReturn<Wallpaper> {
    const data = await WallpaperModel.find({ main: true }).sort({ updatedAt: -1 });
    if (!data) return { code: 11, msg: "Wallpaper get Failed" };
    return { code: 1, msg: "Wallpaper get success", data: data[0] };
  }
}
