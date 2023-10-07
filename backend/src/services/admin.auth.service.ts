import { ServiceReturn } from "../interfaces/public.interface";
import { decodePassword } from "../utils";
import { createToken } from "../utils/passportAuth";

export default class AdminAuthService {
  /** @desc 错误码: 11用户不存在，12密码不匹配 */
  public async signin(userName: string, password: string): ServiceReturn<void> {
    if (userName !== "YourName") return { code: 11, msg: "username does not exist" };
    const originalPassword = decodePassword(password);
    const isMatch: boolean = originalPassword === "YourPassword";
    if (!isMatch) return { code: 12, msg: "You're password not matching" };
    const token: string = createToken({ _id: "admin-YourName", userName: null, password: null });

    return { code: 1, msg: "Signin success", token: token };
  }
}
