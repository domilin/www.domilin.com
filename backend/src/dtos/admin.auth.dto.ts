import { IsString, Validate } from "class-validator";
import { PasswordRules } from "../utils/validateCustomRules";

export class SigninDto {
  @IsString()
  public username: string;

  @Validate(PasswordRules)
  public password: string;
}
