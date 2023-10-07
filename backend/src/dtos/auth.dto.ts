import { IsEmail, IsString, Validate } from "class-validator";
import { PasswordRules, CodeLength } from "../utils/validateCustomRules";
import { Site, Level } from "../interfaces/user.interface";

export class EmailValidateDto {
  @IsEmail()
  public email: string;

  public uuidKey: string;
}

export class SigninDto {
  @IsString()
  public userName: string;

  @Validate(PasswordRules)
  public password: string;
}

export class ForgetPsdDto {
  @IsEmail()
  public email: string;

  @Validate(PasswordRules)
  public password: string;

  @Validate(CodeLength)
  public graphCode: string;

  @Validate(CodeLength)
  public emailCode: string;

  @IsString()
  public uuidKey: string;
}

export class SignupDto {
  @IsString()
  public userName: string;

  @Validate(PasswordRules)
  public password: string;

  public levels: Level[];

  public sites: Site[];
}

export class BindEmailDto {
  @IsString()
  public email: string;

  @IsString()
  public emailCode: string;

  @IsString()
  public uuidKey: string;

  public userId: string;
}

export class SignoutDto {
  public userId: string;
}

export class ChangePsdDto {
  @Validate(PasswordRules)
  public oldPsd: string;

  @Validate(PasswordRules)
  public newPsd: string;

  public userId: string;
}
