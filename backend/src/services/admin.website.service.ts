import { ServiceReturn } from "../interfaces/public.interface";
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
import { firstLevelModel, secondLevelModel, websiteModel } from "../models/website.model";

export default class AdminWebsiteService {
  /** -------------------一级导航---------------------- */
  /** @desc 错误码: 11导航已存在 */
  public async firstLevelAdd(params: FirstLevelDto): ServiceReturn<FirstLevel> {
    const firstLevelFound: FirstLevel = await firstLevelModel.findOne({ name: params.name });
    if (firstLevelFound) return { code: 11, msg: `${params.name} already exists` };

    const createFirstLevel: FirstLevel = await firstLevelModel.create(params);
    return { code: 1, msg: "Create success", data: createFirstLevel };
  }

  public async firstLevelEdit(params: FirstLevelPostDto): ServiceReturn<FirstLevel> {
    // 查看当前要设置的排序是否已占用
    const isUsed: FirstLevel = await firstLevelModel.findOne({ sort: params.sort });
    if (isUsed && isUsed._id !== params._id) {
      // 已占用，获取当前修改频道之前的排序值， 赋值给被占用的频道
      const beforeSort: FirstLevel = await firstLevelModel.findOne({ _id: params._id });
      await firstLevelModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }

    // 未占用直接设置
    const _id = params._id;
    delete params._id;
    const updateData = await firstLevelModel.findOneAndUpdate({ _id: _id }, params, {
      // upsert: true, // 如果不存在就创建
      new: true, // 返回修改后的文档
    });
    return { code: 1, msg: "Update success", data: updateData };
  }

  public async firstLevelGet(): ServiceReturn<FirstLevelList> {
    const findData = await firstLevelModel.find().sort({ sort: 1 });
    return { code: 1, msg: "Get success", data: findData };
  }

  /** @desc 错误码: 11删除失败 */
  public async firstLevelDel(_id: string): ServiceReturn<void> {
    if (!_id) return { code: 11, msg: "Id don't exists" };

    // 删除当前一级导航
    const removeFirstLevelData = await firstLevelModel.deleteOne({ _id: _id });
    if (removeFirstLevelData.deletedCount === 0) return { code: 11, msg: "Del failed" };
    // 删除此导航下属所有二级导航
    await secondLevelModel.deleteMany({ firstLevelId: _id });
    // 删除每个二级导航下属所有网站地址(当前一级下所有网站地址)
    await websiteModel.deleteMany({ firstLevelId: _id });

    return { code: 1, msg: "Del success" };
  }

  /** -------------------二级导航---------------------- */
  public async secondLevelAdd(params: SecondLevelDto): ServiceReturn<SecondLevel> {
    const secondLevelFound: SecondLevel = await secondLevelModel.findOne({ name: params.name });
    if (secondLevelFound) return { code: 11, msg: `${params.name} already exists` };
    const createSecondLevel: SecondLevel = await secondLevelModel.create(params);
    return { code: 1, msg: "Create success", data: createSecondLevel };
  }
  public async secondLevelEdit(params: SecondLevelPostDto): ServiceReturn<SecondLevel> {
    const isUsed: SecondLevel = await secondLevelModel.findOne({
      firstLevelId: params.firstLevelId,
      sort: params.sort,
    });
    if (isUsed && isUsed._id !== params._id) {
      const beforeSort: SecondLevel = await secondLevelModel.findOne({ _id: params._id });
      await secondLevelModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }
    const _id = params._id;
    delete params._id;
    const updateData = await secondLevelModel.findOneAndUpdate({ _id: _id }, params, {
      new: true,
    });
    return { code: 1, msg: "Update success", data: updateData };
  }
  public async secondLevelGet(firstLevelId: string): ServiceReturn<SecondLevelList> {
    const findData = await secondLevelModel.find({ firstLevelId: firstLevelId }).sort({ sort: 1 });
    return { code: 1, msg: "Get success", data: findData };
  }
  public async secondLevelDel(_id: string): ServiceReturn<void> {
    if (!_id) return { code: 11, msg: "Id don't exists" };
    const removeData = await secondLevelModel.deleteOne({ _id: _id });
    if (removeData.deletedCount === 0) return { code: 11, msg: "Del failed" };
    await websiteModel.deleteMany({ secondLevelId: _id });
    return { code: 1, msg: "Del success" };
  }

  /** -------------------网站地址---------------------- */
  /** @desc 错误码：11推荐Id与当前Id不相等，12推荐ID不存在，13推荐ID所属一级ID不存在，14推荐ID所属一级ID不是属于推荐一级导航 */
  public async websiteAdd(params: WebsiteDto): ServiceReturn<Website> {
    const websiteFound: Website = await websiteModel.findOne({ name: params.name });
    if (websiteFound) return { code: 11, msg: `${params.name} already exists` };
    const createWebsite: Website = await websiteModel.create(params);
    return { code: 1, msg: "Create success", data: createWebsite };
  }

  public async websiteEdit(params: WebsitePostDto): ServiceReturn<Website> {
    // 设置推荐的二级导航Id
    if (
      "recommendSecondLevelId" in params &&
      params.recommendSecondLevelId !== "" &&
      params.recommendSecondLevelId !== "null" &&
      params.recommendSecondLevelId !== null &&
      params.recommendSecondLevelId !== "undefined" &&
      params.recommendSecondLevelId !== undefined
    ) {
      if (params.secondLevelId === params.recommendSecondLevelId) {
        return {
          code: 11,
          msg: "SecondLevelId shouldn't be equal to recommendSecondLevelId",
        };
      } else {
        // 查询是否存在此id，并且隶属于推荐一级导航
        const isExist = await secondLevelModel.findOne({
          _id: params.recommendSecondLevelId,
        });
        if (!isExist) return { code: 12, msg: "RecommendSecondLevelId don't exist" };

        const isRecommend = await firstLevelModel.findOne({ _id: isExist.firstLevelId });
        if (!isRecommend)
          return { code: 14, msg: "RecommendSecondLevelId firstLevelId don't exist" };

        // 查询是否是推荐的一级导航
        if (!isRecommend.recommend)
          return { code: 15, msg: "RecommendSecondLevelId firstLevelId isn't recommend" };

        // 所有条件都满足，设置推荐id
        params.recommendFirstLevelId = isRecommend._id;
      }
    } else {
      params.recommendFirstLevelId = "";
    }

    // 查找此此二级导航下的，当前排序是否被占用，并且修改排序
    const isUsed: Website = await websiteModel.findOne({
      secondLevelId: params.secondLevelId,
      sort: params.sort,
    });
    if (isUsed && isUsed._id !== params._id) {
      const beforeSort: Website = await websiteModel.findOne({ _id: params._id });
      await websiteModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }

    // 移动到其它分类
    if (params.secondLevelId) {
      // 查找当前websiteId所属的secondLevelId，跟params中的是否相等。不相等则表明，是移动到其它分类
      const isMove: Website = await websiteModel.findById(params._id);
      if (isMove.secondLevelId !== params.secondLevelId) {
        // 找到移动的secondLevelId所属的一级导航
        const moveSecond = await secondLevelModel.findById(params.secondLevelId);
        if (!moveSecond) return { code: 16, msg: "secondLevelId isn't exist" };
        params.firstLevelId = moveSecond.firstLevelId;
      }
    }

    const _id = params._id;
    delete params._id;
    const updateData = await websiteModel.findOneAndUpdate({ _id: _id }, params, {
      new: true,
    });
    return { code: 1, msg: "Update success", data: updateData };
  }

  /** @desc 错误码: 11参数不存在 */
  public async websiteGet(params: WebsiteGetDto): ServiceReturn<WebsiteList> {
    const isRecommend = params.recommend === "true"; // get请求中间件会把boolean值转为字符串
    if (params.secondLevelId && !params.keywords) {
      // ----------点击二级导航搜索其下网址
      // 如果是查询推荐(eg:home)二级导航，则查询recommendSecondLevelId，否则查询secondLevelId

      const data = isRecommend
        ? { recommendSecondLevelId: params.secondLevelId }
        : { secondLevelId: params.secondLevelId };
      const findData = await websiteModel.find(data).sort({ sort: 1 });
      return { code: 1, msg: "Get success", data: findData };
    } else {
      const keywords = params.keywords;
      let filter = {};
      if (!params.secondLevelId && params.keywords) {
        // ----------全局搜索
        filter = {
          $or: [
            { name: { $regex: keywords, $options: "$i" } },
            { url: { $regex: keywords, $options: "$i" } }, //  $options: '$i' 忽略大小写
            { intro: { $regex: keywords, $options: "$i" } },
          ],
        };
      } else if (params.secondLevelId && params.keywords) {
        // ----------当前二级导航下搜索网址
        const data = params.recommend
          ? { recommendSecondLevelId: params.secondLevelId }
          : { secondLevelId: params.secondLevelId };
        filter = {
          ...data,
          $or: [
            { name: { $regex: keywords, $options: "$i" } },
            { url: { $regex: keywords, $options: "$i" } },
            { intro: { $regex: keywords, $options: "$i" } },
          ],
        };
      } else {
        return { code: 11, msg: "SecondLevelId or Keywords don't exists" };
      }

      const findData = await websiteModel.find(filter).sort({ sort: 1 });
      return { code: 1, msg: "Get success", data: findData };
    }
  }
  public async websiteDel(_id: string): ServiceReturn<void> {
    if (!_id) return { code: 11, msg: "Id don't exists" };
    const removeData = await websiteModel.deleteOne({ _id: _id });
    if (removeData.deletedCount === 0) return { code: 11, msg: "Del failed" };
    return { code: 1, msg: "Del success" };
  }
}
