import { ServiceReturn } from "../interfaces/public.interface";
import { Wallpaper } from "../interfaces/wallpaper.interface";
import { WallpaperModel } from "../models/wallpaper.model";
import { paginationFind, PaginationReturn } from "../utils/index";
import { WallpaperGetDto, WallpaperSetMainDto } from "../dtos/wallpaper.dto";

export default class AdminWallpaperService {
  public async wallpaperGet({
    curPage,
    sizePage,
  }: WallpaperGetDto): ServiceReturn<PaginationReturn<Wallpaper>> {
    const data = await paginationFind<Wallpaper>({
      model: WallpaperModel,
      currentPage: parseInt(curPage),
      pageSize: parseInt(sizePage),
      sort: { createdAt: -1 },
      projection: { _id: 1, url: 1, main: 1 },
    });
    if (!data) return { code: 11, msg: "Wallpaper get Failed" };
    return { code: 1, msg: "Wallpaper get success", data };
  }

  public async wallpaperAdd(url: string): ServiceReturn<Wallpaper> {
    const data = await WallpaperModel.create({ url, main: false });
    if (!data) return { code: 11, msg: "Wallpaper add Failed" };
    return { code: 1, msg: "Wallpaper add success", data };
  }

  public async wallpaperDel(id: string): ServiceReturn<void> {
    const data = await WallpaperModel.findByIdAndRemove(id);
    if (!data) return { code: 11, msg: "Wallpaper delete Failed" };
    return { code: 1, msg: "Wallpaper delete success" };
  }

  public async wallpaperSetMain(params: WallpaperSetMainDto): ServiceReturn<void> {
    const { _id, main } = params;
    const data = await WallpaperModel.findOneAndUpdate({ _id }, { main });
    if (!data) return { code: 11, msg: "Wallpaper SetMain Failed" };
    return { code: 1, msg: "Wallpaper SetMain success" };
  }
}
