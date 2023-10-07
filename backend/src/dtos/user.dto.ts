import { IsArray, IsNumber, IsString } from "class-validator";
import { Folder, Level, Site } from "../interfaces/user.interface";
import { BasicWebsiteDto } from "./website.dto";

export class LevelPutDto extends BasicWebsiteDto {
  public userId: string;
}

export class LevelPostDto extends LevelPutDto {
  @IsString()
  public _id: string;
}

export class SitePutDto extends BasicWebsiteDto {
  @IsString()
  public levelId: string;

  @IsString()
  public intro: string;

  @IsString()
  public url: string;

  @IsString()
  public background: string;

  @IsString()
  public iconType: string;

  public userId: string;

  public folderId: string;
}

export class SitePostDto extends SitePutDto {
  @IsString()
  public _id: string;

  public createdAt: string;

  public updatedAt: string;
}

export class LevelSiteGetDto {
  public userId: string;
}

export class AddToMineDto {
  @IsString()
  public levelId: string;

  @IsString()
  public siteId: string;

  public userId: string;
}

export class SiteDelDto {
  public siteId: string;

  public delFolderSite: {
    delFolderId: string;
    delSiteId: string;
    changeSiteId: string;
    changeSiteSort: number;
  };

  public userId: string;
}

export class LevelDelDto {
  @IsString()
  public _id: string;

  public userId: string;
}

export class SitesFoldersLevelsSortDto {
  public sitesFolders?: Array<Site | Folder>;

  public levels?: Array<Level>;

  public userId: string;
}

export class FolderPutDto {
  @IsString()
  public levelId: string;

  @IsNumber()
  public sort: number;

  @IsString()
  public name: string;

  public userId: string;
}

export class FolderPostDto extends FolderPutDto {
  @IsString()
  public _id: string;
}

export class FolderDelDto {
  @IsString()
  public _id: string;
}

export class GetSiteInfoDto {
  @IsString()
  public url: string;
}

export class OuterLinkGetSettingDto {
  @IsString()
  public userName: string;
}

export class ImportBookmarkDto {
  @IsArray()
  public checked: [
    {
      url: string;
      title: string;
    }
  ];

  // 直接在cookie中获取
  // @IsString()
  public userId: string;

  @IsString()
  public levelId: string;
}

export class ExportBookmarkDto {
  // 直接在cookie中获取
  // @IsString()
  public userId: string;
}
