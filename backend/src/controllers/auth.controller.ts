import { Request, Response } from "express";
import * as uuid from "uuid";
import AuthService from "../services/auth.service";
import userModel from "../models/user.model";
import { User } from "../interfaces/user.interface";
import { ServiceData } from "../interfaces/public.interface";
import { ValidateCode } from "../interfaces/auth.interface";
import {
  SignupDto,
  SigninDto,
  SignoutDto,
  EmailValidateDto,
  ChangePsdDto,
  BindEmailDto,
  ForgetPsdDto,
} from "../dtos/auth.dto";
import { BaseJson } from "../interfaces/types";

export default class AuthController {
  public user = userModel;
  public authService = new AuthService();

  public graphValidate = async (req: Request, res: Response): Promise<void> => {
    const uuidKey = req.query.uuidKey || uuid.v4();
    const data: ServiceData<ValidateCode> = await this.authService.graphValidate(uuidKey);
    res.json(data);
  };

  public emailValidate = async (req: Request, res: Response): Promise<void> => {
    const params: EmailValidateDto = req.body;
    const email: string = params.email;
    const uuidKey: string = params.uuidKey || uuid.v4();
    const data: ServiceData<ValidateCode> = await this.authService.emailValidate(email, uuidKey);
    res.json(data);
  };

  public signUp = async (req: Request, res: Response): Promise<void> => {
    const params: SignupDto = req.body;
    const data: ServiceData<User> = await this.authService.signUp(params);
    res.json(data);
  };

  public forgetPsd = async (req: Request, res: Response): Promise<void> => {
    const params: ForgetPsdDto = req.body;
    const data: ServiceData<User> = await this.authService.forgetPsd(params);
    res.json(data);
  };

  public signIn = async (req: Request, res: Response): Promise<void> => {
    const params: SigninDto = req.body;
    const userName: string = params.userName;
    const password: string = params.password;
    const data: ServiceData<User> = await this.authService.signIn(userName, password);
    res.json(data);
  };

  public signOut = async (req: Request, res: Response): Promise<void> => {
    const params: SignoutDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.authService.singOut(params);

    res.json(data);
  };

  public bindEmail = async (req: Request, res: Response): Promise<void> => {
    const params: BindEmailDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<User> = await this.authService.bindEmail(params);
    res.json(data);
  };

  public setting = async (req: Request, res: Response): Promise<void> => {
    const params: BaseJson = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<User> = await this.authService.setting(params);

    res.json(data);
  };

  public getSetting = async (req: Request, res: Response): Promise<void> => {
    const userId: string = (req.user as User)._id;
    const data: ServiceData<User> = await this.authService.getSetting(userId);

    res.json(data);
  };

  public changePsd = async (req: Request, res: Response): Promise<void> => {
    const params: ChangePsdDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<User> = await this.authService.changePsd(params);

    res.json(data);
  };
}
