import Router from "express-promise-router";
import WebsiteController from "../controllers/website.controller";
import { Route } from "../interfaces/public.interface";
import validationMiddleware from "../middlewares/validation.middleware";

import { WebsiteGetDto } from "../dtos/website.dto";

export default class WebsiteRoute implements Route {
  public path = "/website";
  public router = Router();
  public websiteController = new WebsiteController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/first`, this.websiteController.firstLevelGet);
    this.router.get(
      `${this.path}/second`,
      validationMiddleware(WebsiteGetDto, true),
      this.websiteController.secondLevelGet
    );
    this.router.get(
      `${this.path}/site`,
      validationMiddleware(WebsiteGetDto, true),
      this.websiteController.websiteGet
    );
  }
}
