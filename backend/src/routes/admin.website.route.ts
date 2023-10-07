import Router from "express-promise-router";
import AdminWebsiteController from "../controllers/admin.website.controller";
import { Route } from "../interfaces/public.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import adminAuthMiddleware from "../middlewares/admin.auth.middleware";

import {
  FirstLevelDto,
  FirstLevelPostDto,
  SecondLevelDto,
  SecondLevelPostDto,
  WebsiteDto,
  WebsitePostDto,
  WebsiteGetDto,
} from "../dtos/website.dto";

export default class AdminAuthRoute implements Route {
  public path = "/admin/website";
  public firstLevelPath = `${this.path}/firstlevel`;
  public secondLevelPath = `${this.path}/secondlevel`;
  public websitePath = `${this.path}/site`;
  public router = Router();
  public adminWebsiteController = new AdminWebsiteController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // 一级导航
    this.router.put(
      this.firstLevelPath,
      validationMiddleware(FirstLevelDto),
      adminAuthMiddleware,
      this.adminWebsiteController.firstLevelAdd
    );
    this.router.post(
      this.firstLevelPath,
      validationMiddleware(FirstLevelPostDto),
      adminAuthMiddleware,
      this.adminWebsiteController.firstLevelEdit
    );
    this.router.get(
      this.firstLevelPath,
      adminAuthMiddleware,
      this.adminWebsiteController.firstLevelGet
    );
    this.router.delete(
      this.firstLevelPath,
      validationMiddleware(FirstLevelPostDto, true),
      adminAuthMiddleware,
      this.adminWebsiteController.firstLevelDel
    );

    // 二级导航 {firstLevel: home}为首页推荐
    this.router.put(
      this.secondLevelPath,
      validationMiddleware(SecondLevelDto),
      adminAuthMiddleware,
      this.adminWebsiteController.secondLevelAdd
    );
    this.router.post(
      this.secondLevelPath,
      validationMiddleware(SecondLevelPostDto),
      adminAuthMiddleware,
      this.adminWebsiteController.secondLevelEdit
    );
    this.router.get(
      this.secondLevelPath,
      validationMiddleware(SecondLevelPostDto, true),
      adminAuthMiddleware,
      this.adminWebsiteController.secondLevelGet
    );
    this.router.delete(
      this.secondLevelPath,
      validationMiddleware(SecondLevelPostDto, true),
      adminAuthMiddleware,
      this.adminWebsiteController.secondLevelDel
    );

    // 网站地址
    this.router.put(
      this.websitePath,
      validationMiddleware(WebsiteDto),
      adminAuthMiddleware,
      this.adminWebsiteController.websiteAdd
    );
    this.router.post(
      this.websitePath,
      validationMiddleware(WebsitePostDto),
      adminAuthMiddleware,
      this.adminWebsiteController.websiteEdit
    );
    this.router.get(
      this.websitePath,
      validationMiddleware(WebsiteGetDto, true),
      adminAuthMiddleware,
      this.adminWebsiteController.websiteGet
    );
    this.router.delete(
      this.websitePath,
      validationMiddleware(WebsitePostDto, true),
      adminAuthMiddleware,
      this.adminWebsiteController.websiteDel
    );
  }
}
