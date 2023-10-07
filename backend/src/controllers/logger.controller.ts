import { Request, Response } from "express";
import { isEqual } from "lodash";
import { anyType } from "../interfaces/types";
import logger from "../utils/logger";

let logArr: anyType[] = [];
let logPreTime = new Date().getTime(); // 1秒内logArr中不存在的errObj才上报，防止强刷
export default class LoggerController {
  public report = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body, headers, cookies, ip } = req;
      const cookiesTmp: anyType = {};
      Object.keys(cookies).map(function (key: string) {
        // 排除不必要的信息
        const keyTrue =
          key.indexOf("Hm_lvt_") === -1 &&
          key.indexOf("Hm_lpvt_") === -1 &&
          key.indexOf("CNZZDATA") === -1 &&
          key !== "yp_riddler_id" &&
          key !== "UM_distinctid";
        if (keyTrue) {
          cookiesTmp[key] = cookies[key];
        }
      });
      const logObj = {
        ...body,
        ip: ip,
        userAgent: headers["user-agent"],
        cookies: cookiesTmp,
      };
      const logCurTime = new Date().getTime();
      const logPrint = (): void => {
        if (body.framework) {
          // 如果框架自动打印包含framework字段
          delete logObj.framework;
          switch (logObj.message) {
            case "client-api-msg":
            case "client-api-err":
              logger.warn({ ...logObj });
              break;
            case "client-app-err":
            case "client-app-err-react":
            case "client-app-err-window":
            case "client-ajax-handle-err":
              logger.error({ ...logObj });
              break;
            default:
              logger.info({ ...logObj });
          }
        } else {
          // 打印前端自定义日志
          if (body.level) {
            const level = body.level;
            delete body.level;
            (logger as anyType)[level]({
              ...body,
              message: `client: ${body.message || "browser"}`,
            });
          } else {
            logger.info({ ...body, message: `client: ${body.message || "browser"}` });
          }
        }
      };
      if (logCurTime - logPreTime >= 1000 && logArr.length !== 0) {
        logArr = [];
        logArr.push(logObj);
        logPreTime = logCurTime;
        logPrint();
      } else {
        const hasLogObj = (): void | boolean => {
          for (const val of logArr) {
            if (isEqual(val, logObj)) {
              return true;
            }
          }
          return false;
        };
        if (logArr.length !== 0 && hasLogObj()) return;
        logArr.push(logObj);
        logPrint();
      }
      res.send({
        code: 1,
        msg: "Log reported successfully",
      });
    } catch (err) {
      res.send({
        code: -1,
        msg: err.message,
      });
    }
  };
}
