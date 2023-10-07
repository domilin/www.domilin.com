import * as gm from "gm";
import * as path from "path";
import { ServiceReturn } from "../interfaces/public.interface";
import { Poster, Setting, Font } from "../interfaces/poster.interface";
import { PosterModel, SettingModel, FontModel } from "../models/poster.model";
import {
  PosterGetDto,
  PosterPostDto,
  PosterPutDto,
  SettingGetDelDto,
  SettingPostDto,
  SettingPutDto,
  PosterCreateDto,
  FontPostDto,
} from "../dtos/poster.dto";
import { anyType } from "../interfaces/types";
import logger from "../utils/logger";

export default class PosterService {
  public async posterGet({ _id }: PosterGetDto): ServiceReturn<Poster[] | Poster> {
    if (!_id) {
      const poster = await PosterModel.find().sort({ createdAt: -1 });
      if (!poster) return { code: 11, msg: "Poster get Failed" };
      return { code: 1, msg: "Poster get success", data: poster };
    } else {
      const poster = await PosterModel.findById(_id);
      if (!poster) return { code: 11, msg: "Poster get Failed" };
      const setting = await SettingModel.find({ posterId: _id }).sort({ createdAt: 1 });
      if (!setting) return { code: 11, msg: "Setting get Failed" };
      return {
        code: 1,
        msg: "Poster get success",
        data: { ...poster.toObject(), setting },
      };
    }
  }

  public async posterAdd(params: PosterPutDto): ServiceReturn<Poster> {
    const data = await PosterModel.create(params);
    if (!data) return { code: 11, msg: "Poster Add Failed" };
    return { code: 1, msg: "Poster Add success", data };
  }

  public async posterEdit(params: PosterPostDto): ServiceReturn<Poster> {
    const posterId = params._id;
    delete params._id;
    const data = await PosterModel.findOneAndUpdate({ _id: posterId }, params, { new: true });
    if (!data) return { code: 11, msg: "Poster Edit Failed" };
    return { code: 1, msg: "Poster Edit success", data };
  }

  public async posterDel({ _id }: PosterGetDto): ServiceReturn<void> {
    const data = await PosterModel.findOneAndRemove({ _id });
    if (!data) return { code: 11, msg: "Poster Del Failed" };
    return { code: 1, msg: "Poster Del success" };
  }

  public async settingAdd(params: SettingPutDto): ServiceReturn<Setting> {
    if (!params.posterId) return { code: 11, msg: "PosterId paras is required" };
    const isUsed = await SettingModel.findOne({ title: params.title, posterId: params.posterId });
    if (isUsed) return { code: 12, msg: "Title exist" };
    const data = await SettingModel.create(params);
    if (!data) return { code: 13, msg: "Setting Add Failed" };
    return { code: 1, msg: "Setting Add success", data };
  }

  public async settingEdit(params: SettingPostDto): ServiceReturn<Setting> {
    // const isUsed = await SettingModel.findOne({ title: params.title });
    // if (isUsed) return { code: 11, msg: "Title exist" };
    const data = await SettingModel.findOneAndUpdate({ _id: params._id }, params);
    if (!data) return { code: 11, msg: "Setting Edit Failed" };
    return { code: 1, msg: "Setting Edit success", data };
  }

  public async settingDel(params: SettingGetDelDto): ServiceReturn<void> {
    const data = await SettingModel.findOneAndRemove({ _id: params._id });
    if (!data) return { code: 11, msg: "Setting Del Failed" };
    return { code: 1, msg: "Setting Del success" };
  }

  public async fontGet(): ServiceReturn<Font[]> {
    const data = await FontModel.find();
    if (!data) return { code: 11, msg: "Font get Failed" };
    return { code: 1, msg: "Font get success", data };
  }

  public async fontAdd(params: FontPostDto): ServiceReturn<Font> {
    const isUsed = await FontModel.findOne({ name: params.name });
    if (isUsed) return { code: 11, msg: "Font exist" };
    const data = await FontModel.create(params);
    return { code: 1, msg: "Font get success", data };
  }

  private generateImages = ({
    settingData,
    settingItem,
    poster,
  }: {
    settingItem: { id: string; value: string }[];
    poster: Poster;
    settingData: Setting[];
  }): Promise<string> => {
    const pathStatic = `${path.join(__dirname)}/../../static`;
    const makerFolder = path.join(pathStatic + "/posters");
    const posterName = poster.name.indexOf(".") > -1 ? poster.name.split(".")[0] : poster.name;

    return new Promise(function (resolve, reject) {
      // 初始化gm
      const init = gm(path.join(pathStatic + poster.url));

      // 循环渲染描述
      let fileIdName = null;
      for (const val of settingData) {
        // 获取当前输入值
        let value = null;
        for (const setVal of settingItem) {
          if (setVal.id === val._id.toString()) {
            value = setVal.value;
            break;
          }
        }
        if (!value) continue;
        if (!fileIdName) fileIdName = value;

        // 设置单个描述样式
        init.quality(100);
        const defFamily = path.join(pathStatic + "/resources/fonts/PingFang Regular.ttf");
        const family = path.join(pathStatic + val.fontFamily.value);
        init.font(val.fontFamily && val.fontFamily.value ? family : defFamily);
        init.fontSize(val.fontSize || 24);
        init.fill(val.fontColor || "#000000");
        // '+ val.fontSize - 8' 文字添加进去与前端展示坐标不一致---测试需要加上字体大小并减去16--大致能与前端展示一致
        const size = val.fontSize ? val.fontSize - 8 : 22;
        init.drawText(val.left || 0, val.top ? val.top + size : size, value);
      }

      // 写入图片
      const posterLastName = `${fileIdName}${
        fileIdName ? "-" : ""
      }${posterName}-${new Date().getTime()}.jpg`;
      const madeFileName = `${makerFolder}/${posterLastName}`;
      init.write(madeFileName, function (err) {
        if (!err) {
          resolve(`/posters/${posterLastName}`);
        } else {
          reject(err);
        }
      });
    });
  };

  // Linux系统依赖：sudo apt-get install imagemagick graphicsmagick ghostscript
  // Mac系统依赖：brew intall imagemagick graphicsmagick ghostscript
  public async posterCreate({ posterId, setting }: PosterCreateDto): ServiceReturn<string[]> {
    if (!posterId) return { code: 11, msg: "Id is required" };
    const poster = await PosterModel.findById(posterId);
    if (!poster) return { code: 12, msg: "Poster don't exist" };
    const settingData = await SettingModel.find({ posterId });
    if (!settingData) return { code: 13, msg: "Setting don't exist" };

    // 根据输入值，以”,“隔开，生成二维数组: [[{value: xxx, id: xxx}], [{value: xxx, id: xxx}]]
    const settingArr: anyType[] = [];
    for (const val of setting) {
      if (val.value) {
        const tempArr = val.value.split(",");
        for (const key in tempArr) {
          const item = { id: val.id, value: tempArr[key] };
          if (settingArr[key]) {
            settingArr[key].push(item);
          } else {
            settingArr[key] = [item];
          }
        }
      }
    }

    const imageUrl: string[] = [];
    for (const val of settingArr) {
      const res = await this.generateImages({
        poster,
        settingData,
        settingItem: val,
      }).catch(function (err) {
        imageUrl.push(null);
        logger.error(err.message);
      });
      res && imageUrl.push(res);
    }

    return { code: 1, msg: "Create success", data: imageUrl };
  }
}
