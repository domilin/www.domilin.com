import { Request, Response } from "express";
import WallpaperService from "../services/wallpaper.service";
import { ServiceData } from "../interfaces/public.interface";
import { Wallpaper } from "../interfaces/wallpaper.interface";

export default class WallpaperController {
  public service = new WallpaperService();
  public wallpaperGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<Wallpaper> = await this.service.wallpaperGet();
    res.json(data);
  };
}
