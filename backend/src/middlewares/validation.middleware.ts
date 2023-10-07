import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import HttpException from "../exceptions/HttpException";
import { anyType } from "../interfaces/types";

/** @desc 错误码: 0参数验证错误 */
function validationMiddleware(type: anyType, skipMissingProperties = false): RequestHandler {
  return (req, res, next): void => {
    const params = req.method.toLowerCase() === "get" ? req.query : req.body;
    validate(plainToClass(type, params), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => Object.values(error.constraints))
            .join(", ");

          res.json({
            code: 0,
            msg: message,
          });
        } else {
          next();
        }
      })
      .catch(function (err) {
        next(new HttpException(400, err.message));
      });
  };
}

export default validationMiddleware;
