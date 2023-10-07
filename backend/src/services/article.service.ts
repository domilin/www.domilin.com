import * as cheerio from "cheerio";
import { cloneDeep, reverse } from "lodash";
import * as moment from "moment";
import { ServiceReturn } from "../interfaces/public.interface";
import { DOMAIN } from "../config";
import {
  Article,
  Tag,
  TagMap,
  Channel,
  Album,
  AlbumArticle,
} from "../interfaces/article.interface";
import {
  articleModel,
  tagModel,
  tagMapModel,
  channelModel,
  albumModel,
  albumArticleModel,
} from "../models/article.model";
import {
  ArticleAddDto,
  ArticleEditDto,
  ArticleDelDto,
  ArticleGetDto,
  TagDto,
  AlbumGetDto,
  AlbumGetByArticleIdDto,
} from "../dtos/article.dto";
import { paginationFind, PaginationReturn, pushUrlToBaiduSeo } from "../utils/index";
import { anyType } from "../interfaces/types";
import userModel from "../models/user.model";
import { OFFICIALUSERID } from "../config";

import "moment/locale/zh-cn";
moment.locale("zh-cn");

export default class ArticleService {
  /** @desc
   * -----------------------------------登录用户获取、发布、编辑自己的文章 start -----------------------------------
   * 文章删除： 1，后台管理系统文章删除为delete: true(仅仅不在前端展示)； 2：前端用户删除为数据库删除
   * 文章编辑与删除： 官方账号可编辑与删除任意文章--OFFICIALUSERID， 个人账号只能编辑与删除自己的文章
   */
  public async articleAdd(params: ArticleAddDto): ServiceReturn<Article> {
    // 查找是否有文章标题或文章内容相同
    const { title, content, tags } = params;

    const titleFound = await articleModel.findOne({ title, delete: false });
    if (titleFound) return { code: 11, msg: "Article title is exist" };
    const contentFound = await articleModel.findOne({ content, delete: false });
    if (contentFound) return { code: 12, msg: "Article content is exist" };

    // 截取文章前200字，作为简介
    const $ = cheerio.load(content);
    const txt = $("p").text();
    params.intro = txt ? txt.substr(0, 200) : title;

    const articleCreate = await articleModel.create({ ...params, delete: false, audit: false });
    if (!articleModel) return { code: 13, msg: "Article create failed" };

    // 处理tagMap
    const numPromise = [];
    const mapPromise = [];
    if (tags && Array.isArray(tags)) {
      for (const val of tags) {
        mapPromise.push(tagMapModel.create({ tagId: val._id, articleId: articleCreate._id }));
        numPromise.push(tagModel.findOne({ _id: val._id }));
      }
    }
    await Promise.all(mapPromise);

    // 处理tag-num
    const numAdd = await Promise.all(numPromise);
    const savePromise = [];
    for (const item of numAdd) {
      if (item) {
        item.num = item.toObject().num + 1;
        savePromise.push(item.save());
      }
    }
    await Promise.all(savePromise);

    // 创建文章时推送给百度
    pushUrlToBaiduSeo({ urlList: [`${DOMAIN}/article/${articleCreate._id}`] });

    return { code: 1, msg: "Article add success" };
  }

  public async articleEdit(params: ArticleEditDto): ServiceReturn<Article> {
    const { _id, title, content, tags, channelId, userId } = params;

    /** @desc
     * 查找用户是否拥有此篇文章
     * 登录用户是否是官方账户
     * 官方账户编辑其它用户文章，则只需要根据“_id”获取详情就行
     */
    let foundData = await articleModel.findOne({ _id, userId });
    if (!foundData && `${userId}` !== OFFICIALUSERID)
      return { code: 11, msg: "Article don't exist" };
    if (`${userId}` === OFFICIALUSERID) foundData = await articleModel.findOne({ _id });

    /** @desc ---------------------取出删除，与新增的tags--------------------- */
    // 比较修改之前tags和现在tags的不同，并把之删除的、新加的区分出来
    // 1：把两者不同的挑选出来---两者都存在的元素即为不改变的
    const oldTags = foundData.tags;
    const difTags = tags.concat(oldTags).filter(function (item, index, arr) {
      // 获取正序索引
      let ydIndex: null | string = null;
      for (const key in arr) {
        if (`${arr[key]._id}` === `${item._id}`) {
          ydIndex = key;
          break;
        }
      }

      // 获取反序索引
      const reverseArr = reverse(cloneDeep(arr));
      let dyIndex: null | string = null;
      for (const key in reverseArr) {
        if (`${reverseArr[key]._id}` === `${item._id}`) {
          dyIndex = `${reverseArr.length - 1 - parseInt(key)}`;
          break;
        }
      }

      return ydIndex === dyIndex;
    });
    const tagsEqual = (tags: Tag[]): Tag[] =>
      difTags.filter((item) => {
        let hasItem = false;
        for (const val of tags) {
          if (`${val._id}` === `${item._id}`) {
            hasItem = true;
            break;
          }
        }
        return hasItem;
      });
    // 2: difTags跟oldTags相同的元素即为删除的
    const delTags = tagsEqual(oldTags);
    // 3: difTags跟tags相同的元素即为新增的
    const newTags = tagsEqual(tags);

    /** @desc ---------------------对delTags、newTags进行操作--------------------- */
    // ---------------------处理defTags的tagMap，tag的num(需要先根据id找到num，再更新)
    const delPromise: anyType[] = [];
    let numPromise: anyType[] = [];
    for (const val of delTags) {
      delPromise.push(tagMapModel.deleteOne({ articleId: _id, tagId: val._id }));
      numPromise.push(tagModel.findOne({ _id: val._id }));
    }
    await Promise.all(delPromise);

    // 根据find到的tag更新num
    const numMinus = await Promise.all(numPromise);
    let savePromise = [];
    for (const item of numMinus) {
      if (!item) continue;

      if (item.num && item.toObject().num > 1) {
        item.num = item.toObject().num - 1;
        savePromise.push(item.save());
      } else {
        savePromise.push(tagModel.deleteOne({ _id: item._id }));
      }
    }
    await Promise.all(savePromise);

    // ---------------------处理newTags的tagMap，tag的num(需要先根据id找到num，再更新)
    const newPromise: anyType[] = [];
    numPromise = [];
    for (const val of newTags) {
      newPromise.push(tagMapModel.create({ tagId: val._id, articleId: _id }));
      numPromise.push(tagModel.findOne({ _id: val._id }));
    }
    await Promise.all(newPromise);

    // 根据find到的tag更新num
    const numAdd = await Promise.all(numPromise);
    savePromise = [];
    for (const item of numAdd) {
      if (!item) continue;
      item.num = item.toObject().num + 1;
      savePromise.push(item.save());
    }
    await Promise.all(savePromise);

    /** @desc ---------------------更新文章内容--------------------- */
    // 截取文章前200字，作为简介
    const $ = cheerio.load(content);
    const txt = $("p").text();

    foundData.title = title;
    foundData.intro = txt ? txt.substr(0, 200) : title;
    foundData.content = content;
    foundData.tags = tags;
    foundData.channelId = channelId;
    foundData.audit = false;
    await foundData.save();

    return { code: 1, msg: "Article edit success" };
  }

  public async articleDel({ articleId, userId }: ArticleDelDto): ServiceReturn<void> {
    if (!articleId) return { code: 12, msg: "Id don't exists" };

    /** @desc
     * 查找用户是否拥有此篇文章
     * 登录用户是否是官方账户
     * 官方账户编辑其它用户文章，则只需要根据“_id”获取详情就行
     */
    let foundData = await articleModel.findOne({ _id: articleId, userId });
    if (!foundData && `${userId}` !== OFFICIALUSERID)
      return { code: 11, msg: "Article don't exist" };
    if (`${userId}` === OFFICIALUSERID) foundData = await articleModel.findOne({ _id: articleId });

    // 删除文章本身
    const tags = foundData.tags;
    await foundData.remove();

    // 找到tag，以便得到number
    const numPromise: anyType[] = [];
    for (const val of tags) {
      numPromise.push(tagModel.findOne({ _id: val._id }));
    }
    // 根据find到的tag更新num
    const numMinus = await Promise.all(numPromise);
    const savePromise = [];
    for (const item of numMinus) {
      if (!item) continue;

      if (item.num && item.toObject().num > 1) {
        item.num = item.toObject().num - 1;
        savePromise.push(item.save());
      } else {
        savePromise.push(tagModel.deleteOne({ _id: item._id }));
      }
    }
    await Promise.all(savePromise);

    // 删除文章tagMap引用
    await tagMapModel.deleteMany({ articleId });

    return { code: 1, msg: "Article delete success" };
  }
  /** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 end----------------------------------- */

  public async articleGet(
    {
      currentPage,
      pageSize,
      tagId,
      articleId,
      keywords,
      channelId,
      albumId,
      sitemap,
      userId,
    }: ArticleGetDto,
    { backend }: { backend?: boolean }
  ): ServiceReturn<PaginationReturn<Article> | Article | Article[]> {
    const curPage = parseInt(currentPage);
    const sizePage = parseInt(pageSize);

    /** @desc 查找时间段的文章----主要用于sitemap的生成  */
    if (sitemap) {
      let dateStr = moment().format("YYYY-MM-DD hh:mm:ss");

      // $gt大于，$gte大于等于，$lt小于，$lte小于等于
      if (parseInt(sitemap) === 0) {
        // 如果sitemap不存在则，获取从现在开始往前推一个月之内的文章
        dateStr = moment().subtract(30, "days").format("YYYY-MM-DD hh:mm:ss");
      } else {
        // 如果sitemap存在则，获取从现在开始往前推一天的文章
        dateStr = moment().subtract(1, "days").format("YYYY-MM-DD hh:mm:ss");
      }

      // 某个时间段的文章
      /* articleModel.find({
        $and: [{ createdAt: { $gt: startTime } }, { createdAt: { $lt: endTime } }],
      }); */

      const articleFound = await articleModel.find(
        { updatedAt: { $gte: new Date(dateStr) }, audit: true, delete: false },
        { _id: 1, updatedAt: 1, title: 1, channelId: 1 }
      );
      if (!articleFound) return { code: 11, msg: "Article get failed" };

      return { code: 1, msg: "Article get success", data: articleFound };
    }

    /** @desc 根据专辑id，获取专辑下的文章  */
    if (albumId) {
      const albumFound = await albumModel.findById(albumId);
      if (!albumFound) return { code: 17, msg: "Album don't exist" };

      const albumArticleList = await paginationFind<AlbumArticle>({
        model: albumArticleModel,
        currentPage: curPage,
        pageSize: sizePage,
        sort: { sort: -1 },
        filter: { albumId },
      });
      if (!albumArticleList) return { code: 11, msg: "Album get Failed" };

      const articleIdArr = [];
      for (const val of albumArticleList.list) {
        articleIdArr.push(val.articleId);
      }
      const articleList = await articleModel
        .find(
          { _id: { $in: articleIdArr }, audit: true, delete: false },
          { _id: 1, createdAt: 1, title: 1, tags: 1, intro: 1, audit: 1, channelId: 1 }
        )
        .sort({ createdAt: -1 });
      if (!articleList) return { code: 13, msg: "Article get by tagId Failed" };

      const { currentPage, pageSize, totalPage, totalSize } = albumArticleList;
      const listTemp: PaginationReturn<Article> = {
        currentPage,
        pageSize,
        totalPage,
        totalSize,
        list: articleList,
      };

      return { code: 1, msg: "Article get by albumId success", data: listTemp };
    }

    /** @desc 获取tag相关文章  */
    if (tagId) {
      const filter =
        tagId.indexOf(",") > -1
          ? {
              tagId: {
                $in: tagId.split(",").filter(function (currentValue, index, arr) {
                  // 删选删除掉 === "" 为空的tagId
                  return currentValue !== "";
                }),
              },
            }
          : { tagId };

      const tagMap = await paginationFind<TagMap>({
        model: tagMapModel,
        currentPage: curPage,
        pageSize: sizePage,
        projection: { _id: 1, articleId: 1 },
        filter,
      });
      const articleIdArr = [];
      for (const val of tagMap.list) {
        articleIdArr.push(val.articleId);
      }
      const articleList = await articleModel
        .find(
          { _id: { $in: articleIdArr }, audit: true, delete: false },
          { _id: 1, createdAt: 1, title: 1, tags: 1, intro: 1, audit: 1, channelId: 1 }
        )
        .sort({ createdAt: -1 });
      if (!articleList) return { code: 13, msg: "Article get by tagId Failed" };

      const { currentPage, pageSize, totalPage, totalSize } = tagMap;
      const listTemp: PaginationReturn<Article> = {
        currentPage,
        pageSize,
        totalPage,
        totalSize,
        list: articleList,
      };

      return { code: 1, msg: "Article get by tagId success", data: listTemp };
    }

    /** @desc 获取文章详情  */
    if (articleId) {
      const filter = { _id: articleId, audit: true, delete: false };
      if (userId) {
        delete filter.audit;
        delete filter.delete;
      }
      const articleInfo = await articleModel.findOne(filter);
      if (!articleInfo) return { code: 14, msg: "Article info get Failed" };
      const userInfo = await userModel.findOne(
        { _id: articleInfo.userId },
        { _id: 1, email: 1, avatar: 1, userName: 1, nickName: 1 }
      );
      if (!userInfo) return { code: 15, msg: "User info about this article get Failed" };

      return {
        code: 1,
        msg: "Article info get success",
        data: { ...articleInfo.toObject(), user: userInfo.toObject() },
      };
    }

    /** @desc 获取所有文章 + 频道相关文章 + 关键字搜索  */
    const channelFilter = channelId ? { channelId } : {};
    const keywordsFilter = keywords
      ? { $or: [{ title: { $regex: keywords, $options: "$i" } }] }
      : {};
    const userFilter = !userId ? { audit: true, delete: false } : { userId };
    const articleList = await paginationFind<Article>({
      model: articleModel,
      currentPage: curPage,
      pageSize: sizePage,
      sort: !backend && !userId ? { createdAt: -1 } : { updatedAt: -1 },
      filter: !backend
        ? { ...channelFilter, ...keywordsFilter, ...userFilter }
        : { ...channelFilter, ...keywordsFilter },
      projection: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        title: 1,
        intro: 1,
        tags: 1,
        channelId: 1,
        audit: 1,
        delete: 1,
      },
    });
    if (!articleList) return { code: 15, msg: "Article get Failed" };
    return { code: 1, msg: "Article get success", data: articleList };
  }

  public async tagAddEdit(tagName: string): ServiceReturn<Tag> {
    const tagData = await tagModel.findOneAndUpdate(
      { name: tagName },
      { name: tagName },
      {
        upsert: true,
        new: true,
      }
    );
    if (!tagData) return { code: 11, msg: "Tag add failed" };
    return { code: 1, msg: "Tag add success", data: tagData };
  }

  public async tagGet(params: TagDto): ServiceReturn<Tag[]> {
    const { name, _id } = params;
    if (!name && !_id) return { code: 12, msg: "Can't get your tag name" };
    const filter = name
      ? {
          $or: [{ name: { $regex: name, $options: "$i" } }],
        }
      : { _id };

    const tagData = await tagModel.find(filter).sort({ sort: 1 });
    if (!tagData) return { code: 11, msg: "Tag get failed" };
    return { code: 1, msg: "Tag get success", data: tagData };
  }

  public async channelGet(): ServiceReturn<Channel[]> {
    const data = await channelModel.find({ delete: false }).sort({ sort: 1 });
    if (!data) return { code: 11, msg: "Channel get failed" };
    return { code: 1, msg: "Channel get success", data: data };
  }

  public async albumGet(params: AlbumGetDto): ServiceReturn<PaginationReturn<Album> | Album> {
    const { currentPage, pageSize, _id } = params;

    if (_id) {
      const albumFound = await albumModel.findById(_id);
      if (!albumFound) return { code: 11, msg: "Album get Failed" };
      return { code: 1, msg: "Album get success", data: albumFound };
    }

    const albumList = await paginationFind<Album>({
      model: albumModel,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
      sort: { sort: -1 },
    });
    if (!albumList) return { code: 12, msg: "AlbumList get Failed" };
    return { code: 1, msg: "AlbumList get success", data: albumList };
  }

  public async albumGetByArticleId(params: AlbumGetByArticleIdDto): ServiceReturn<Album[]> {
    const { articleId } = params;

    const albumIdList = await albumArticleModel.find({ articleId });
    if (!albumIdList) return { code: 11, msg: "albumIdList get Failed" };

    const albumIdArr = [];
    for (const val of albumIdList) {
      if (albumIdArr.indexOf(val.albumId) === -1) albumIdArr.push(val.albumId);
    }

    const albumList = await albumModel.find({
      _id: { $in: albumIdArr },
    });

    return { code: 1, msg: "AlbumList get success", data: albumList };
  }
}
