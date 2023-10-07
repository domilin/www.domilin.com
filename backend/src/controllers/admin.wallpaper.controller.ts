import { Request, Response } from "express";
import AdminWallpaperService from "../services/admin.wallpaper.service";
import { ServiceData } from "../interfaces/public.interface";
import { Wallpaper } from "../interfaces/wallpaper.interface";
import { PaginationReturn } from "../utils/index";
import { WallpaperGetDto, WallpaperSetMainDto } from "../dtos/wallpaper.dto";

export default class AdminWallpaperController {
  public service = new AdminWallpaperService();
  public wallpaperGet = async (req: Request, res: Response): Promise<void> => {
    const params: WallpaperGetDto = req.query;
    const data: ServiceData<PaginationReturn<Wallpaper>> = await this.service.wallpaperGet(params);
    res.json(data);
  };
  public wallpaperAdd = async (req: Request, res: Response): Promise<void> => {
    const url: string = req.body.url;
    const data: ServiceData<Wallpaper> = await this.service.wallpaperAdd(url);
    res.json(data);
  };
  public wallpaperDel = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.body._id;
    const data: ServiceData<void> = await this.service.wallpaperDel(id);
    res.json(data);
  };
  public wallpaperSetMain = async (req: Request, res: Response): Promise<void> => {
    const params: WallpaperSetMainDto = req.body;
    const data: ServiceData<void> = await this.service.wallpaperSetMain(params);
    res.json(data);
  };
}
