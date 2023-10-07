import Router from "express-promise-router";
import WallpaperController from "../controllers/wallpaper.controller";
import { Route } from "../interfaces/public.interface";

export default class WallpaperRoute implements Route {
  public path = "/wallpaper";
  public router = Router();
  public WallpaperController = new WallpaperController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, this.WallpaperController.wallpaperGet);
  }
}
