import { Request, Response } from "express";
import AdminAuthService from "../services/admin.auth.service";
import { ServiceData } from "../interfaces/public.interface";
import { SigninDto } from "../dtos/admin.auth.dto";
import { JWT_EXPIRY as expires } from "../config";

export default class AdminAuthController {
  public adminAuthService = new AdminAuthService();
  public signin = async (req: Request, res: Response): Promise<void> => {
    const signin: SigninDto = req.body;
    const username = signin.username;
    const password = signin.password;
    const data: ServiceData<void> = await this.adminAuthService.signin(username, password);
    const date = new Date(Date.parse(new Date().toDateString()) + expires);
    res.cookie("Authorization", data.token, { expires: date });
    delete data.token;
    res.json(data);
  };
}
