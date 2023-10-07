import { Request, Response } from "express";
import UserService from "../services/user.service";
import { ServiceData } from "../interfaces/public.interface";
import {
  Level,
  Site,
  LevelSiteList,
  GetSiteInfo,
  Folder,
  Bookmark,
} from "../interfaces/user.interface";
import { User, OuterLinkUser } from "../interfaces/user.interface";
import {
  LevelPutDto,
  LevelPostDto,
  SitePostDto,
  SitePutDto,
  SiteDelDto,
  LevelDelDto,
  AddToMineDto,
  SitesFoldersLevelsSortDto,
  GetSiteInfoDto,
  FolderPutDto,
  FolderPostDto,
  OuterLinkGetSettingDto,
  ImportBookmarkDto,
  ExportBookmarkDto,
} from "../dtos/user.dto";

export default class AuthController {
  public userService = new UserService();

  public levelAdd = async (req: Request, res: Response): Promise<void> => {
    const params: LevelPutDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Level[]> = await this.userService.levelAdd(params);
    res.json(data);
  };

  public levelEdit = async (req: Request, res: Response): Promise<void> => {
    const params: LevelPostDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Level[]> = await this.userService.levelEdit(params);
    res.json(data);
  };

  public levelDel = async (req: Request, res: Response): Promise<void> => {
    const params: LevelDelDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<LevelSiteList> = await this.userService.levelDel(params);
    res.json(data);
  };

  public siteAdd = async (req: Request, res: Response): Promise<void> => {
    const params: SitePutDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Array<Site | Folder>> = await this.userService.siteAdd(params);
    res.json(data);
  };

  public siteEdit = async (req: Request, res: Response): Promise<void> => {
    const params: SitePostDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Array<Site | Folder>> = await this.userService.siteEdit(params);
    res.json(data);
  };

  public siteDel = async (req: Request, res: Response): Promise<void> => {
    const params: SiteDelDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Array<Site | Folder>> = await this.userService.siteDel(params);
    res.json(data);
  };

  public folderAdd = async (req: Request, res: Response): Promise<void> => {
    const params: FolderPutDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Folder> = await this.userService.folderAdd(params);
    res.json(data);
  };

  public folderEdit = async (req: Request, res: Response): Promise<void> => {
    const params: FolderPostDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.userService.folderEdit(params);
    res.json(data);
  };

  public folderDel = async (req: Request, res: Response): Promise<void> => {
    const params: FolderPostDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.userService.folderDel(params);
    res.json(data);
  };

  public levelSiteGet = async (req: Request, res: Response): Promise<void> => {
    const userId: string = (req.user as User)._id;

    const data: ServiceData<LevelSiteList> = await this.userService.levelSiteGet(userId);
    res.json(data);
  };

  public outerLinkGetSetting = async (req: Request, res: Response): Promise<void> => {
    const params: OuterLinkGetSettingDto = req.body;
    const data: ServiceData<OuterLinkUser> = await this.userService.outerLinkGetSetting(params);

    res.json(data);
  };

  public addToMine = async (req: Request, res: Response): Promise<void> => {
    const params: AddToMineDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Array<Site | Folder>> = await this.userService.addToMine(params);
    res.json(data);
  };

  public sitesFoldersLevelsSort = async (req: Request, res: Response): Promise<void> => {
    const params: SitesFoldersLevelsSortDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.userService.sitesFoldersLevelsSort(params);
    res.json(data);
  };

  public recommendToOffcial = async (req: Request, res: Response): Promise<void> => {
    const params: AddToMineDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.userService.recommendToOffcial(params);
    res.json(data);
  };

  public getSiteInfo = async (req: Request, res: Response): Promise<void> => {
    const params: GetSiteInfoDto = req.body;

    const data: ServiceData<GetSiteInfo> = await this.userService.getSiteInfo(params);
    res.json(data);
  };

  public importBookmark = async (req: Request, res: Response): Promise<void> => {
    const params: ImportBookmarkDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.userService.importBookmark(params);
    res.json(data);
  };

  public exportBookmark = async (req: Request, res: Response): Promise<void> => {
    const params: ExportBookmarkDto = req.query;
    params.userId = (req.user as User)._id;

    const data: ServiceData<string> = await this.userService.exportBookmark(params);
    res.json(data);
  };
}
