import { Request, Response } from "express";
import WebsiteService from "../services/website.service";
import { ServiceData } from "../interfaces/public.interface";
import { FirstLevelList, SecondLevelList, Website } from "../interfaces/website.interface";
import { WebsiteGetDto } from "../dtos/website.dto";
import { PaginationReturn } from "../utils/index";

export default class WebsiteController {
  public websiteService = new WebsiteService();

  public firstLevelGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<FirstLevelList> = await this.websiteService.firstLevelGet();
    res.json(data);
  };
  public secondLevelGet = async (req: Request, res: Response): Promise<void> => {
    const firstLevelId: string = req.query.firstLevelId;
    const data: ServiceData<SecondLevelList> = await this.websiteService.secondLevelGet(
      firstLevelId
    );
    res.json(data);
  };
  public websiteGet = async (req: Request, res: Response): Promise<void> => {
    const params: WebsiteGetDto = req.query;
    const data: ServiceData<PaginationReturn<Website>> = await this.websiteService.websiteGet(
      params
    );
    res.json(data);
  };
}
