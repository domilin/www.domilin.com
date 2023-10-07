import Router from "express-promise-router";
import AdminWallpaperController from "../controllers/admin.wallpaper.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminAuthMiddleware from "../middlewares/admin.auth.middleware";
import { Route } from "../interfaces/public.interface";
import {
  WallpaperDelDto,
  WallpaperGetDto,
  WallpaperAddDto,
  WallpaperSetMainDto,
} from "../dtos/wallpaper.dto";

export default class AdminWallpaperRoute implements Route {
  public path = "/admin/wallpaper";
  public router = Router();
  public AdminWallpaperController = new AdminWallpaperController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      validationMiddleware(WallpaperGetDto),
      adminAuthMiddleware,
      this.AdminWallpaperController.wallpaperGet
    );
    this.router.put(
      `${this.path}`,
      validationMiddleware(WallpaperAddDto),
      adminAuthMiddleware,
      this.AdminWallpaperController.wallpaperAdd
    );
    this.router.delete(
      `${this.path}`,
      validationMiddleware(WallpaperDelDto),
      adminAuthMiddleware,
      this.AdminWallpaperController.wallpaperDel
    );
    this.router.post(
      // 设置未前端展示壁纸
      `${this.path}/setmain`,
      validationMiddleware(WallpaperSetMainDto),
      adminAuthMiddleware,
      this.AdminWallpaperController.wallpaperSetMain
    );
  }
}
