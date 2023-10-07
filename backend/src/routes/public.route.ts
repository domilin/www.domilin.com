import Router from "express-promise-router";
import PublicController from "../controllers/public.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import { Route } from "../interfaces/public.interface";
import { UploadDeleteDto, UploadUrlImageDto } from "../dtos/public.dto";
import { upload, uploadLarge } from "../middlewares/upload.middleware";

class IndexRoute implements Route {
  public path = "/public";
  public router = Router();
  public publicController = new PublicController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/upload/delete`,
      validationMiddleware(UploadDeleteDto),
      this.publicController.uploadDelete
    );
    this.router.post(`${this.path}/upload/large`, uploadLarge(), this.publicController.uploadLarge);
    this.router.post(`${this.path}/upload/icon`, upload("icon"), this.publicController.upload);
    this.router.post(`${this.path}/upload/avatar`, upload("avatar"), this.publicController.upload);
    this.router.post(
      `${this.path}/upload/wallpaper`,
      upload("wallpaper"),
      this.publicController.upload
    );
    this.router.post(
      `${this.path}/upload/wallpaper/official`,
      upload("wallpaperOfficial"),
      this.publicController.upload
    );
    this.router.post(
      `${this.path}/upload/article`,
      upload("article"),
      this.publicController.upload
    );
    this.router.post(
      `${this.path}/upload/imgurl`,
      validationMiddleware(UploadUrlImageDto),
      this.publicController.uploadUrlImage
    );
    this.router.post(`${this.path}/upload/font`, upload("font"), this.publicController.upload);
    this.router.post(`${this.path}/upload/poster`, upload("poster"), this.publicController.upload);
  }
}

export default IndexRoute;
