import Router from "express-promise-router";
import SpiderController from "../controllers/spider.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminAuthMiddleware from "../middlewares/admin.auth.middleware";
import { Route } from "../interfaces/public.interface";
import { MonKnow, XiaoDai } from "../dtos/spider.dto";

class IndexRoute implements Route {
  public path = "/spider";
  public router = Router();
  public spiderController = new SpiderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/monknow`,
      validationMiddleware(MonKnow),
      adminAuthMiddleware,
      this.spiderController.monknow
    );
    this.router.get(
      `${this.path}/xiaodai`,
      validationMiddleware(XiaoDai),
      adminAuthMiddleware,
      this.spiderController.xiaodai
    );
  }
}

export default IndexRoute;
