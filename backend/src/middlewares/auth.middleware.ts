import { NextFunction, Response, Request } from "express";

import HttpException from "../exceptions/HttpException";
import { authenticate } from "../utils/passportAuth";

/** @desc 错误码: -1(统一为此数值，代表token验证错误，需要重新登录) */
export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.headers.authorization) {
      res.json({ code: -1, msg: "Authorization doesn't exist in the headers" });
      return;
    }
    authenticate((err, user, info) => {
      if (err) return next(new HttpException(400, err.message));

      // 登录验证通过后，把登录用户相关信息存到req中，在需要当前用户信息的接口，可直接req.user取相关信息
      if (user) {
        req.user = user;
      }

      if (!user) {
        if (info.name === "TokenExpiredError") {
          return res.json({ code: -1, msg: "Your token has expired. Please Log back in" });
        } else {
          return res.json({ code: -1, msg: info.message });
        }
      }
      return next();
    })(req, res, next);
  } catch (err) {
    next(new HttpException(400, err.message));
  }
};
