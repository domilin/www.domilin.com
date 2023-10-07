import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";
import logger from "../utils/logger";

export default (error: HttpException, req: Request, res: Response, next: NextFunction): void => {
  const status: number = error.status || 500;
  const message: string = error.message || "Something went wrong";

  console.log(error);
  logger.error(message);
  res.status(status).json({ code: status, msg: message });
};
