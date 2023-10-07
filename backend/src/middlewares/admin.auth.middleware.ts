import { NextFunction, Response, Request } from "express";
import * as jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";
import { User } from "../interfaces/user.interface";
import { JWT_SECRET as secret } from "../config";

/** @desc 错误码: -1(统一为此数值，代表token验证错误，需要重新登录) */
async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const cookies = req.cookies;
  if (!cookies && !cookies.Authorization) {
    res.json({ code: -1, msg: "Authorization doesn't exist in the cookies" });
    return;
  }

  try {
    const verificationResponse = jwt.verify(cookies.Authorization, secret) as User;
    const userId = verificationResponse._id;

    if (userId === "admin-chrischou") {
      next();
    } else {
      res.json({ code: -1, msg: "Your token has expired. Please Log back in" });
    }
  } catch (err) {
    next(new HttpException(400, err.message));
  }
}

export default authMiddleware;
