import Router from "express-promise-router";
import validationMiddleware from "../middlewares/validation.middleware";
import PosterController from "../controllers/poster.controller";
import { Route } from "../interfaces/public.interface";
import {
  PosterGetDto,
  PosterPostDto,
  PosterPutDto,
  SettingPutDto,
  SettingPostDto,
  SettingGetDelDto,
  PosterCreateDto,
  FontPostDto,
} from "../dtos/poster.dto";

export default class PosterRoute implements Route {
  public path = "/poster";
  public router = Router();
  public controller = new PosterController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      validationMiddleware(PosterGetDto, true),
      this.controller.posterGet
    );
    this.router.delete(
      `${this.path}`,
      validationMiddleware(PosterGetDto, true),
      this.controller.posterDel
    );
    this.router.put(`${this.path}`, validationMiddleware(PosterPutDto), this.controller.posterAdd);
    this.router.post(
      `${this.path}`,
      validationMiddleware(PosterPostDto, true),
      this.controller.posterEdit
    );
    this.router.put(
      `${this.path}/setting`,
      validationMiddleware(SettingPutDto),
      this.controller.settingAdd
    );
    this.router.post(
      `${this.path}/setting`,
      validationMiddleware(SettingPostDto),
      this.controller.settingEdit
    );
    this.router.delete(
      `${this.path}/setting`,
      validationMiddleware(SettingGetDelDto),
      this.controller.settingDel
    );
    this.router.get(`${this.path}/font`, this.controller.fontGet);
    this.router.post(
      `${this.path}/font`,
      validationMiddleware(FontPostDto),
      this.controller.fontAdd
    );
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(PosterCreateDto),
      this.controller.posterCreate
    );
  }
}
