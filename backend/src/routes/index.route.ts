import Router from "express-promise-router";
import IndexController from "../controllers/index.controller";
import { Route } from "../interfaces/public.interface";

class IndexRoute implements Route {
  public path = "/";
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, this.indexController.index);
  }
}

export default IndexRoute;
