import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { decodePassword } from ".";

// 密码验证规则: 6-16位包含大小写数字字符
@ValidatorConstraint({ name: "passwordRules", async: false })
export class PasswordRules implements ValidatorConstraintInterface {
  private validateTips = "Password 6-16 characters and must contain case letters and Numbers";
  validate(text: string): boolean {
    try {
      // decodePassword验证密码格式首先解密，解密错误进入catch
      const password = text ? decodePassword(text) : "";
      const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,16}$/;
      return reg.test(password); // 对于异步验证，您必须在此处返回Promise<boolean>
    } catch (err) {
      this.validateTips = `Validate Password: ${
        err.message && err.message.message ? err.message.message : err.message
      }`;
      return false;
    }
  }
  defaultMessage(): string {
    return this.validateTips;
  }
}

// 图形验证码长度为4
@ValidatorConstraint({ name: "codeLength", async: false })
export class CodeLength implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    return text ? text.length === 4 : false;
  }
  defaultMessage(): string {
    return "graph code length is 4";
  }
}
