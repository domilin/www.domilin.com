import Router from "express-promise-router";
import AuthController from "../controllers/auth.controller";
import {
  EmailValidateDto,
  ForgetPsdDto,
  SigninDto,
  SignoutDto,
  ChangePsdDto,
  SignupDto,
  BindEmailDto,
} from "../dtos/auth.dto";
import { Route } from "../interfaces/public.interface";
import authMiddleware from "../middlewares/auth.middleware";
import validationMiddleware from "../middlewares/validation.middleware";

export default class AuthRoute implements Route {
  public path = "/auth";
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/graph`, this.authController.graphValidate);
    this.router.post(
      `${this.path}/email`,
      validationMiddleware(EmailValidateDto),
      this.authController.emailValidate
    );
    this.router.post(
      `${this.path}/forgetpsd`,
      validationMiddleware(ForgetPsdDto),
      this.authController.forgetPsd
    );
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(SignupDto),
      this.authController.signUp
    );
    this.router.post(
      `${this.path}/signin`,
      validationMiddleware(SigninDto),
      this.authController.signIn
    );
    this.router.post(
      `${this.path}/bindemail`,
      validationMiddleware(BindEmailDto),
      authMiddleware,
      this.authController.bindEmail
    );
    this.router.post(
      `${this.path}/signout`,
      validationMiddleware(SignoutDto),
      authMiddleware,
      this.authController.signOut
    );
    this.router.post(`${this.path}/setting`, authMiddleware, this.authController.setting);
    this.router.post(`${this.path}/getsetting`, authMiddleware, this.authController.getSetting);
    this.router.post(
      `${this.path}/changepsd`,
      validationMiddleware(ChangePsdDto),
      authMiddleware,
      this.authController.changePsd
    );
  }
}
