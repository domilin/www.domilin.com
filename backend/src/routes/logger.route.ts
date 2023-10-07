import Router from "express-promise-router";
import LoggerController from "../controllers/logger.controller";
import { Route } from "../interfaces/public.interface";
class LoggerRoute implements Route {
  public path = "/logger";
  public router = Router();
  public LoggerController = new LoggerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, this.LoggerController.report);
  }
}

export default LoggerRoute;
