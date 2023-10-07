import Router from "express-promise-router";
import UserController from "../controllers/user.controller";
import {
  LevelPutDto,
  LevelPostDto,
  SitePostDto,
  SitePutDto,
  LevelSiteGetDto,
  AddToMineDto,
  SitesFoldersLevelsSortDto,
  GetSiteInfoDto,
  FolderPutDto,
  FolderPostDto,
  FolderDelDto,
  OuterLinkGetSettingDto,
  ImportBookmarkDto,
  ExportBookmarkDto,
} from "../dtos/user.dto";
import { Route } from "../interfaces/public.interface";
import authMiddleware from "../middlewares/auth.middleware";
import validationMiddleware from "../middlewares/validation.middleware";

export default class UserRoute implements Route {
  public path = "/user";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.put(
      `${this.path}/level`,
      validationMiddleware(LevelPutDto),
      authMiddleware,
      this.userController.levelAdd
    );
    this.router.post(
      `${this.path}/level`,
      validationMiddleware(LevelPostDto),
      authMiddleware,
      this.userController.levelEdit
    );
    this.router.delete(
      `${this.path}/level`,
      validationMiddleware(LevelPostDto, true),
      authMiddleware,
      this.userController.levelDel
    );
    this.router.put(
      `${this.path}/site`,
      validationMiddleware(SitePutDto),
      authMiddleware,
      this.userController.siteAdd
    );
    this.router.post(
      `${this.path}/site`,
      validationMiddleware(SitePostDto),
      authMiddleware,
      this.userController.siteEdit
    );
    this.router.delete(
      `${this.path}/site`,
      validationMiddleware(SitePostDto, true),
      authMiddleware,
      this.userController.siteDel
    );
    this.router.put(
      `${this.path}/folder`,
      validationMiddleware(FolderPutDto, true),
      authMiddleware,
      this.userController.folderAdd
    );
    this.router.post(
      `${this.path}/folder`,
      validationMiddleware(FolderPostDto, true),
      authMiddleware,
      this.userController.folderEdit
    );
    this.router.delete(
      `${this.path}/folder`,
      validationMiddleware(FolderDelDto, true),
      authMiddleware,
      this.userController.folderDel
    );
    this.router.get(
      `${this.path}/levelsite`,
      validationMiddleware(LevelSiteGetDto),
      authMiddleware,
      this.userController.levelSiteGet
    );
    this.router.post(
      `${this.path}/site/addtomine`,
      validationMiddleware(AddToMineDto),
      authMiddleware,
      this.userController.addToMine
    );
    this.router.post(
      `${this.path}/site/sort`,
      validationMiddleware(SitesFoldersLevelsSortDto),
      authMiddleware,
      this.userController.sitesFoldersLevelsSort
    );
    this.router.post(
      `${this.path}/site/recommendToOffcial`,
      validationMiddleware(AddToMineDto, true),
      authMiddleware,
      this.userController.recommendToOffcial
    );
    this.router.post(
      `${this.path}/site/getsiteinfo`,
      validationMiddleware(GetSiteInfoDto, true),
      this.userController.getSiteInfo
    );
    this.router.post(
      `${this.path}/outerlinkgetsetting`,
      validationMiddleware(OuterLinkGetSettingDto),
      this.userController.outerLinkGetSetting
    );
    this.router.post(
      `${this.path}/bookmark/import`,
      validationMiddleware(ImportBookmarkDto),
      authMiddleware,
      this.userController.importBookmark
    );
    this.router.get(
      `${this.path}/bookmark/export`,
      validationMiddleware(ExportBookmarkDto),
      authMiddleware,
      this.userController.exportBookmark
    );
  }
}
