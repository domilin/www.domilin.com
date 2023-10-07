import { Request, Response } from "express";
import AdminWebsiteService from "../services/admin.website.service";
import { ServiceData } from "../interfaces/public.interface";
import {
  FirstLevelDto,
  FirstLevelPostDto,
  SecondLevelDto,
  SecondLevelPostDto,
  WebsiteDto,
  WebsitePostDto,
  WebsiteGetDto,
} from "../dtos/website.dto";
import {
  FirstLevel,
  FirstLevelList,
  SecondLevel,
  SecondLevelList,
  Website,
  WebsiteList,
} from "../interfaces/website.interface";

export default class AdminWebsiteController {
  public adminWebsiteService = new AdminWebsiteService();

  // 一级导航
  public firstLevelAdd = async (req: Request, res: Response): Promise<void> => {
    const params: FirstLevelDto = req.body;
    const data: ServiceData<FirstLevel> = await this.adminWebsiteService.firstLevelAdd(params);
    res.json(data);
  };
  public firstLevelEdit = async (req: Request, res: Response): Promise<void> => {
    const params: FirstLevelPostDto = req.body;
    const data: ServiceData<FirstLevel> = await this.adminWebsiteService.firstLevelEdit(params);
    res.json(data);
  };
  public firstLevelGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<FirstLevelList> = await this.adminWebsiteService.firstLevelGet();
    res.json(data);
  };
  public firstLevelDel = async (req: Request, res: Response): Promise<void> => {
    const _id: string = req.body._id;
    const data: ServiceData<void> = await this.adminWebsiteService.firstLevelDel(_id);
    res.json(data);
  };

  // 二级导航
  public secondLevelAdd = async (req: Request, res: Response): Promise<void> => {
    const params: SecondLevelDto = req.body;
    const data: ServiceData<SecondLevel> = await this.adminWebsiteService.secondLevelAdd(params);
    res.json(data);
  };
  public secondLevelEdit = async (req: Request, res: Response): Promise<void> => {
    const params: SecondLevelPostDto = req.body;
    const data: ServiceData<SecondLevel> = await this.adminWebsiteService.secondLevelEdit(params);
    res.json(data);
  };
  public secondLevelGet = async (req: Request, res: Response): Promise<void> => {
    const firstLevelId: string = req.query.firstLevelId;
    const data: ServiceData<SecondLevelList> = await this.adminWebsiteService.secondLevelGet(
      firstLevelId
    );
    res.json(data);
  };
  public secondLevelDel = async (req: Request, res: Response): Promise<void> => {
    const _id: string = req.body._id;
    const data: ServiceData<void> = await this.adminWebsiteService.secondLevelDel(_id);
    res.json(data);
  };

  // 网站地址
  public websiteAdd = async (req: Request, res: Response): Promise<void> => {
    const params: WebsiteDto = req.body;
    const data: ServiceData<Website> = await this.adminWebsiteService.websiteAdd(params);
    res.json(data);
  };
  public websiteEdit = async (req: Request, res: Response): Promise<void> => {
    const params: WebsitePostDto = req.body;
    const data: ServiceData<Website> = await this.adminWebsiteService.websiteEdit(params);
    res.json(data);
  };
  public websiteGet = async (req: Request, res: Response): Promise<void> => {
    const params: WebsiteGetDto = req.query;
    const data: ServiceData<WebsiteList> = await this.adminWebsiteService.websiteGet(params);
    res.json(data);
  };
  public websiteDel = async (req: Request, res: Response): Promise<void> => {
    const _id: string = req.body._id;
    const data: ServiceData<void> = await this.adminWebsiteService.websiteDel(_id);
    res.json(data);
  };
}
