import { Request, Response } from "express";

export default class IndexController {
  public index = async (req: Request, res: Response): Promise<void> => {
    res.sendStatus(200);
  };
}
