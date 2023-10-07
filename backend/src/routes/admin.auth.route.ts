import Router from "express-promise-router";
import AdminAuthController from "../controllers/admin.auth.controller";
import { Route } from "../interfaces/public.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import { SigninDto } from "../dtos/admin.auth.dto";

export default class AdminAuthRoute implements Route {
  public path = "/admin/auth";
  public router = Router();
  public adminAuthController = new AdminAuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/signin`,
      validationMiddleware(SigninDto),
      this.adminAuthController.signin
    );
  }
}
