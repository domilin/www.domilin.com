import axios, { AxiosResponse } from "axios";
import * as path from "path";
import * as fse from "fs-extra";
import * as cheerio from "cheerio";
import * as colorThief from "colorthief";
import { ServiceReturn } from "../interfaces/public.interface";
import userModel from "../models/user.model";
import { websiteModel } from "../models/website.model";
import logger from "../utils/logger";

import {
  LevelPutDto,
  LevelPostDto,
  SitePutDto,
  SitePostDto,
  AddToMineDto,
  SiteDelDto,
  LevelDelDto,
  SitesFoldersLevelsSortDto,
  GetSiteInfoDto,
  FolderPutDto,
  FolderPostDto,
  OuterLinkGetSettingDto,
  ImportBookmarkDto,
  ExportBookmarkDto,
} from "../dtos/user.dto";
import {
  Level,
  Site,
  LevelSiteList,
  GetSiteInfo,
  Folder,
  User,
  OuterLinkUser,
} from "../interfaces/user.interface";
import { anyType, BaseJson } from "../interfaces/types";
import { sortBy, isUrl, settingReturnParams, textLength } from "../utils/index";
import { WebsiteDto } from "../dtos/website.dto";
import { RECOMMENDFIRSTLEVELID, RECOMMENDSECONDLEVELID } from "../config";
import { isArray } from "lodash";

export default class UserService {
  public async levelAdd(params: LevelPutDto): ServiceReturn<Level[]> {
    const { userId, name } = params;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };
    const level = await userModel.findOne({ _id: userId, "levels.name": name });
    if (level) return { code: 12, msg: "level name is exist" };

    params.sort = 1;
    if (user.levels && user.levels.length > 0) {
      const levels = user.levels;
      levels.sort(sortBy("sort"));
      params.sort = levels[0].sort + 1;
    }

    user.levels.push(params);
    await user.save();
    return { code: 1, msg: "level add success", data: user.toObject().levels };
  }

  public async levelEdit(params: LevelPostDto): ServiceReturn<Level[]> {
    const { userId, _id, name, sort, icon } = params;

    const level = await userModel.findOne({ _id: userId, "levels.name": name });
    if (level && level.levels) {
      let nameExist = false;
      let beforeLevel: Level;
      let sortExist: Level;
      for (const val of level.levels) {
        if (val.name === name && val._id.toString() !== _id) nameExist = true;
        if (`${val._id}` === _id) beforeLevel = val;
        if (val.sort === sort) sortExist = val;
      }

      if (nameExist) return { code: 11, msg: "level name is exist" };
      if (sortExist) {
        await userModel.findOneAndUpdate(
          { _id: userId, "levels._id": sortExist._id },
          {
            $set: {
              "levels.$.sort": beforeLevel.sort,
            },
          }
        );
      }
    }

    const data = await userModel.findOneAndUpdate(
      { _id: userId, "levels._id": _id },
      {
        $set: {
          "levels.$.name": name,
          "levels.$.icon": icon,
          "levels.$.sort": sort,
        },
      },
      { new: true }
    );

    return { code: 1, msg: "level edit success", data: data.toObject().levels };
  }

  public async levelDel(params: LevelDelDto): ServiceReturn<LevelSiteList> {
    const { userId, _id } = params;
    await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          levels: { _id: _id },
          sites: { levelId: _id },
          folders: { levelId: _id },
        },
      },
      { new: true }
    );

    const dataLevelsSites = await this.levelSiteGet(userId, "Level del success");
    return dataLevelsSites;
  }

  public async siteAdd(params: SitePutDto): ServiceReturn<Array<Site | Folder>> {
    const { userId, name, url } = params;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };

    // 检查是否有相同元素
    const siteName = await userModel.findOne({ _id: userId, "sites.name": name });
    if (siteName) return { code: 12, msg: "site name is exist" };
    const siteUrl = await userModel.findOne({ _id: userId, "sites.url": url });
    if (siteUrl) return { code: 13, msg: "site url is exist" };

    user.sites.push(params);
    await user.save();

    const dataLevelsSites = await this.levelSiteGet(userId);
    return { code: 1, msg: "site add success", data: dataLevelsSites.data.sites };
  }

  public async siteEdit(params: SitePostDto): ServiceReturn<Array<Site | Folder>> {
    const { userId, _id, name, url } = params;

    // 检测网站名称是否存在
    const siteName = await userModel.findOne({ _id: userId, "sites.name": name });
    if (siteName && siteName.sites) {
      for (const val of siteName.sites) {
        if (val.name !== name) continue;
        if (val._id.toString() !== _id) return { code: 11, msg: "site name is exist" };
      }
    }
    // 检测网站地址是否存在
    const siteUrl = await userModel.findOne({ _id: userId, "sites.url": url });
    if (siteUrl && siteUrl.sites) {
      for (const val of siteUrl.sites) {
        if (val.url !== url) continue;
        if (val._id.toString() !== _id) return { code: 12, msg: "site url is exist" };
      }
    }

    delete params._id;
    delete params.createdAt;
    delete params.updatedAt;

    const setParams: anyType = {};
    for (const key in params) {
      setParams[`sites.$.${key}`] = (params as anyType)[key];
    }

    await userModel.findOneAndUpdate(
      { _id: userId, "sites._id": _id },
      {
        $set: setParams,
      },
      { new: true }
    );

    const dataLevelsSites = await this.levelSiteGet(userId);
    return { code: 1, msg: "site edit success", data: dataLevelsSites.data.sites };
  }

  public async siteDel(params: SiteDelDto): ServiceReturn<Array<Site | Folder>> {
    const { userId, siteId, delFolderSite } = params;

    if (siteId) {
      await userModel.findOneAndUpdate(
        { _id: userId },
        {
          $pull: { sites: { _id: siteId } },
        }
      );
    }

    // 当删除文件夹下网址，且文件夹只有两个网址时：删除文件夹，重新排序sites+folders
    if (delFolderSite) {
      const { delFolderId, delSiteId, changeSiteId, changeSiteSort } = delFolderSite;
      await userModel.findOneAndUpdate(
        { _id: userId },
        {
          $pull: {
            folders: { _id: delFolderId },
            sites: { _id: delSiteId },
          },
        }
      );
      await userModel.findOneAndUpdate(
        { _id: userId, "sites._id": changeSiteId },
        {
          $set: {
            "sites.$.sort": changeSiteSort,
            "sites.$.folderId": undefined,
          },
        }
      );
    }
    const dataLevelsSites = await this.levelSiteGet(userId);
    return { code: 1, msg: "site del success", data: dataLevelsSites.data.sites };
  }

  public async folderAdd(params: FolderPutDto): ServiceReturn<Folder> {
    const { userId } = params;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };

    delete params.userId;
    user.folders.push(params);
    await user.save();
    const folders = user.toObject().folders;
    return { code: 1, msg: "folder add success", data: folders[folders.length - 1] };
  }

  public async folderEdit(params: FolderPostDto): ServiceReturn<void> {
    const { userId, _id, name, levelId, sort } = params;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };

    const setParams: anyType = {};
    for (const key in params) {
      setParams[`sites.$.${key}`] = (params as anyType)[key];
    }

    await userModel.findOneAndUpdate(
      { _id: userId, "folders._id": _id },
      {
        $set: {
          "folders.$.sort": sort,
          "folders.$.name": name || "Folder",
          "folders.$.levelId": levelId,
        },
      }
    );
    return { code: 1, msg: "folder edit success" };
  }

  public async folderDel(params: FolderPostDto): ServiceReturn<void> {
    const { userId, _id } = params;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };

    await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { folders: { _id: _id } },
      },
      { new: true }
    );

    return { code: 1, msg: "site del success" };
  }

  public async levelSiteGet(userId: string, tips?: string): ServiceReturn<LevelSiteList> {
    const user = await userModel.findOne({ _id: userId }, { levels: 1, folders: 1, sites: 1 });
    if (!user) return { code: 11, msg: "user isn't exist" };
    const { levels, folders, sites } = user.toObject();

    const sitesLast: Array<Site | Folder> = [];
    for (const site of sites) {
      if ("folderId" in site && site.folderId) {
        for (const folder of folders) {
          if (`${folder._id}` === `${site.folderId}`) {
            if ("children" in folder) {
              const children = [...folder.children];
              children.push(site);
              folder.children = children.sort(sortBy("sort", 1));
            } else {
              folder.children = [site];
            }
          }
        }
      } else {
        sitesLast.push(site);
      }
    }

    // 若folder的children为空或，children没有添加上则不返回
    const lastFolders: Site[] = [];
    for (const folder of folders) {
      if (folder.children && isArray(folder.children) && folder.children.length > 0) {
        lastFolders.push(folder);
      }
    }

    return {
      code: 1,
      msg: tips || "levelsite get success",
      data: { levels, sites: sitesLast.concat(lastFolders) },
    };
  }

  public async outerLinkGetSetting({
    userName,
  }: OuterLinkGetSettingDto): ServiceReturn<OuterLinkUser> {
    const userFound: User = await userModel.findOne(
      { userName, outerLink: true },
      { ...settingReturnParams, _id: 1 }
    );
    if (!userFound)
      return { code: 11, msg: "UserName don't be found or User's outerLink don't open" };

    const settingObj = userFound.toObject();

    const dataLevelsSites = await this.levelSiteGet(userFound._id);
    const levelsSites = dataLevelsSites.data;

    return {
      code: 1,
      msg: "Get setting success",
      data: {
        ...settingObj,
        ...levelsSites,
      },
    };
  }

  public async sitesFoldersLevelsSort(params: SitesFoldersLevelsSortDto): ServiceReturn<void> {
    const userFound = await userModel.findOne(
      { _id: params.userId },
      { sites: 1, folders: 1, levels: 1 }
    );
    if (!userFound) return { code: 11, msg: "user isn't exist" };

    // 分类重排序
    if (params && "levels" in params) {
      const { levels } = userFound;
      for (const val of params.levels) {
        for (const level of levels) {
          if (val._id === `${level._id}`) {
            level.sort = val.sort;
            break;
          }
        }
      }
    }

    // 网址，文件夹---重排序
    if (params && "sitesFolders" in params) {
      const { folders, sites } = userFound;

      const changeSite = (site: Site, params?: BaseJson): void => {
        for (const key in sites) {
          if (site._id === `${sites[key]._id}`) {
            sites[key].levelId = site.levelId;
            sites[key].folderId = site.folderId;
            sites[key].sort = site.sort;

            if (params && params.deleteFolderId && sites[key].folderId) {
              sites[key].folderId = undefined;
            }
            break;
          }
        }
      };

      const changeFolder = (folder: Folder): void => {
        for (const key in folders) {
          if (folder._id === `${folders[key]._id}`) {
            folders[key].levelId = folder.levelId;
            folders[key].sort = folder.sort;
            break;
          }
        }
      };
      for (const val of params.sitesFolders) {
        if ("type" in val && val.type === "folder") {
          changeFolder(val);
          for (const folderSite of val.children) {
            changeSite(folderSite);
          }
        } else {
          changeSite(val as Site, { deleteFolderId: true });
        }
      }
    }

    await userFound.save();

    return { code: 1, msg: "site sort success" };
  }

  public async addToMine(params: AddToMineDto): ServiceReturn<Array<Site | Folder>> {
    const { userId, siteId, levelId } = params;
    const siteData = await websiteModel.findOne({ _id: siteId });
    if (!siteData) return { code: 11, msg: "Site don't exist" };
    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 12, msg: "user isn't exist" };

    // 检查是否有相同元素
    const siteName = await userModel.findOne({ _id: userId, "sites.name": siteData.name });
    if (siteName) return { code: 13, msg: "site name is exist" };
    const siteUrl = await userModel.findOne({ _id: userId, "sites.url": siteData.url });
    if (siteUrl) return { code: 14, msg: "site url is exist" };

    const sitesTemp = user.sites;
    sitesTemp.sort(sortBy("sort", 1));
    const sortTemp = sitesTemp.length > 0 ? sitesTemp[sitesTemp.length - 1].sort + 1 : 0;
    user.sites.push({
      icon: "official",
      iconType: "official",
      officialIcon: siteData.icon,
      url: siteData.url,
      name: siteData.name,
      intro: siteData.intro,
      background: siteData.background,
      sort: sortTemp,
      levelId: levelId,
    });

    await user.save();

    const dataLevelsSites = await this.levelSiteGet(userId);
    // type===official ===> 自己添加的没有officialIcon，则显示图标; 否则显示officialIcon
    return { code: 1, msg: "add to mine success", data: dataLevelsSites.data.sites };
  }

  public async recommendToOffcial(params: AddToMineDto): ServiceReturn<void> {
    const { userId, siteId } = params;
    if (!userId || !siteId) return { code: 1, msg: "userId param or siteId param don't exist" };

    const user = await userModel.findOne({ _id: userId });
    if (!user) return { code: 11, msg: "user isn't exist" };
    const level = await userModel.findOne({ _id: userId, "sites._id": siteId });
    if (!level) return { code: 12, msg: "site don't exist" };

    const curSite: WebsiteDto = {
      secondLevelId: RECOMMENDSECONDLEVELID,
      firstLevelId: RECOMMENDFIRSTLEVELID,
      sort: 0,
      name: "",
      intro: "",
      url: "",
      icon: "",
      background: "",
    };
    let officialIcon = "";
    for (const val of level.sites) {
      if (val._id.toString() === siteId) {
        curSite.name = val.name;
        curSite.intro = val.intro;
        curSite.url = val.url;
        curSite.background = val.background;
        curSite.icon = val.icon.indexOf("/upload/icons/") > -1 ? val.icon : "";
        officialIcon = val.officialIcon;
        break;
      }
    }

    // 通过icon查找是否存在，icon在系统中也是一一对应的
    const iconData = await websiteModel.find({ icon: officialIcon });
    if (iconData && iconData.length > 0) return { code: 13, msg: "site exist" };

    // 模糊匹配网站名称(name)和网站地址(url)
    const filter = {
      $or: [
        { name: { $regex: curSite.name, $options: "$i" } },
        { url: { $regex: curSite.url, $options: "$i" } },
      ],
    };
    const data = await websiteModel.find(filter);
    if (data && data.length > 0) return { code: 14, msg: "site exist" };

    await websiteModel.create(curSite);
    return { code: 1, msg: "site recommend success" };
  }

  public async getSiteInfo(params: GetSiteInfoDto): ServiceReturn<GetSiteInfo> {
    const { url } = params;

    let errMsg = null;
    const res = await axios({
      method: "get",
      url: url,
      timeout: 5000,
    }).catch(function (error) {
      console.log("----------url get error----------");
      console.log(error);
      errMsg = error.message || "axios error";
    });
    if (errMsg) return { code: 11, msg: errMsg };

    const $ = cheerio.load((res as AxiosResponse).data);
    const $title = $("title");
    const $description = $("meta[name=description]");
    const $ico = $("link[rel*=icon]").length > 0 ? $("link[rel*=icon]") : $("link[rel*=favicon]");
    let background = "rgb(255, 255, 255)";

    const siteInfo: GetSiteInfo = {
      description: $description.attr("content") || "",
      title: $title.text() || "",
      background,
    };

    /** @desc ---------------------------------获取ico主色（start）------------------------  */
    // 获取ico图片
    let icoRes = null;
    let siteIconUrl = null;
    try {
      const hostReg = /^http(s)?:\/\/(.*?)\//;
      const icoUrl = $ico.attr("href");
      const protocol = url.indexOf("https://") === 0 ? "https" : "http";
      const lastIcoUrl =
        icoUrl && icoUrl.substring(0, 1) === "/" ? icoUrl.replace("/", "") : icoUrl;
      const lastUrl = isUrl(icoUrl)
        ? icoUrl
        : icoUrl && icoUrl.substring(0, 2) === "//"
        ? `${protocol}:${icoUrl}`
        : `${protocol}://${hostReg.exec(url)[2]}/${lastIcoUrl}`;
      siteIconUrl = lastUrl;
      icoRes = await axios({
        method: "get",
        url: lastUrl,
        responseType: "stream",
      });
    } catch (error) {
      console.log("----------ico get error----------");
      console.log(error);
      logger.info(error.message);
    }

    // 存储ico图片
    if (icoRes && icoRes.data) {
      // 图片路径与名称
      const filePath = path.join(`${path.join(__dirname)}/../../static`) + "/upload/icos";
      const fileName = `icos-${new Date().getTime()}`;
      let fileExtension = "ico";
      if (siteIconUrl) {
        const arrTemp = siteIconUrl.split(".");
        fileExtension = arrTemp[arrTemp.length - 1];
      }
      const file = `${filePath}/${fileName}.${fileExtension}`;

      const writer = fse.createWriteStream(file);
      icoRes.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      }).catch(function (error) {
        console.log("----------ico file  write error----------");
        console.log(error);
        logger.info(error.message);
      });

      try {
        // 图标地址
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const icoToPng = require("ico-to-png");
        const source = await fse.readFile(file);
        siteInfo.icon = `/upload/icos/${fileName}.${fileExtension}`;

        // 背景颜色
        let icoSource = null;
        if (fileExtension === "ico") {
          icoSource = await icoToPng(source, 128);
        }
        background = await colorThief.getColor(
          `data:image/${icoSource ? "png" : fileExtension};base64,${
            icoSource ? icoSource.toString("base64") : source.toString("base64")
          }`
        );
        siteInfo.background = Array.isArray(background)
          ? `rgb(${background.join(",")})`
          : background;
      } catch (error) {
        console.log("----------background get error----------");
        console.log(error);
        logger.info(error.message);
      }
    }
    /** @desc ---------------------------------获取ico主色（end）------------------------  */

    return {
      code: 1,
      msg: "Get success",
      data: siteInfo,
    };
  }

  private getStringHostname = (url: string): string => {
    const m = url.match(/^(https|http|ftp|rtsp|mms):\/\/[^/]+/);
    return m ? m[0] : null;
  };

  public async importBookmark(params: ImportBookmarkDto): ServiceReturn<void> {
    /** @desc 基本步骤
     * 查找我的收藏中是否已存在--->存在则不添加--->不存在走下一步
     * 查找官方是否已存在--->存在则添加至我的收藏(类似addToMine)---->不存在走下一步
     * 用本身的title， url创建
     */
    const { checked, userId, levelId } = params;
    if (Array.isArray(checked)) {
      for (const val of checked) {
        const hostName = this.getStringHostname(val.url);
        const resMine = await userModel.findOne({
          _id: userId,
          "sites.url": { $regex: hostName || "", $options: "i" },
        });
        if (resMine) continue; // 我的收藏夹已存在则继续下一个循环

        // 查找个人信息对象，以便接下来使用
        const resUser = await userModel.findOne({ _id: userId });
        const sitesTemp = resUser.sites;
        sitesTemp.sort(sortBy("sort", 1));
        const sortTemp = sitesTemp.length > 0 ? sitesTemp[sitesTemp.length - 1].sort + 1 : 0;

        // 我的收藏不存在，查抄官方是否有，把官方的直接添加进收藏
        const resOfficial = await websiteModel.findOne({
          url: { $regex: hostName || "", $options: "i" },
        });
        if (resOfficial) {
          resUser.sites.push({
            icon: "official",
            iconType: "official",
            officialIcon: resOfficial.icon,
            url: resOfficial.url,
            name: resOfficial.name,
            intro: resOfficial.intro,
            background: resOfficial.background,
            sort: sortTemp,
            levelId: levelId,
          });

          await resUser.save();

          continue; // 官方已查到则直接添加官方的内容，与addToMine相似，继续下一个循环
        }

        // 官方与个人收藏都未找到，则利用现有信息添加
        const twoTxt = val.title
          ? val.title.substr(0, 2).replace(/^\S/, (s) => s.toUpperCase())
          : "Do";
        const oneTxt = val.title
          ? val.title.substr(0, 1).replace(/^\S/, (s) => s.toUpperCase())
          : "Do";
        resUser.sites.push({
          icon: textLength(twoTxt) > 3 ? oneTxt : twoTxt,
          iconType: "character",
          url: val.url,
          name: val.title,
          intro: val.title,
          background: "#3f91f7",
          sort: sortTemp,
          levelId: levelId,
        });
        await resUser.save();
      }
    }
    return {
      code: 1,
      msg: "import success",
    };
  }
  public async exportBookmark(params: ExportBookmarkDto): ServiceReturn<string> {
    const { userId } = params;
    const res = await this.levelSiteGet(userId);

    // xml框架
    const xmlHeader = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n
      <!-- This is an automatically generated file.
          It will be read and overwritten.
          DO NOT EDIT! -->
      <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n
      <TITLE>Bookmarks</TITLE>\n
      <H1>Bookmarks</H1>\n
      <DL><p>\n`;
    const xmlFooter = "</DL><p>\n";
    let xmlBody = "";

    for (const levelItem of res.data.levels) {
      xmlBody += `<DT><H3>${levelItem.name}</H3>\n<DL><p>\n`;

      for (const siteItem of res.data.sites) {
        if (levelItem._id.toString() !== siteItem.levelId.toString()) continue;

        if ((siteItem as Folder).type === "folder") {
          // xml框架children
          const xmlChilrenHeader = `<DT><H3>${siteItem.name}</H3>\n<DL><p>\n`;
          const xmlChilrenFooter = "</DL><p>\n";
          let xmChildrenBody = "";

          for (const siteChild of (siteItem as Folder).children) {
            xmChildrenBody += `<DT><A HREF="${siteChild.url}">${siteChild.name}</A>\n`;
          }
          xmlBody += xmlChilrenHeader + xmChildrenBody + xmlChilrenFooter;
          continue;
        }

        xmlBody += `<DT><A HREF="${(siteItem as Site).url}">${(siteItem as Site).name}</A>\n`;
      }

      xmlBody += "</DL><p>\n";
    }
    return {
      code: 1,
      msg: "export success",
      data: xmlHeader + xmlBody + xmlFooter,
    };
  }
}
