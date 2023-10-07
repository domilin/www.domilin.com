import { ServiceReturn } from "../interfaces/public.interface";
import { Channel, Album, AlbumArticle, AlbumPagination } from "../interfaces/article.interface";
import { articleModel, channelModel, albumModel, albumArticleModel } from "../models/article.model";
import { paginationFind } from "../utils/index";
import {
  ChannelAddDto,
  ChannelEditDto,
  ChannelDelDto,
  ArticleAuditDto,
  ArticleDelDto,
  AlbumGetDto,
  AlbumAddDto,
  AlbumEditDto,
  AlbumDelDto,
  AlbumArticleGetDto,
  AlbumArticleAddDto,
  AlbumArticleDelDto,
  AlbumArticleEditDto,
} from "../dtos/article.dto";
import { anyType } from "../interfaces/types";

export default class AdminArticleService {
  public async channelGet(): ServiceReturn<Channel[]> {
    const data = await channelModel.find({ delete: false }).sort({ sort: 1 });
    if (!data) return { code: 11, msg: "Channel get Failed" };
    return { code: 1, msg: "Channel get success", data: data };
  }

  public async channelAdd(params: ChannelAddDto): ServiceReturn<void> {
    const isExist = await channelModel.findOne({ name: params.name });
    if (isExist) {
      isExist.name = params.name;
      isExist.sort = params.sort;
      isExist.delete = false;
      await isExist.save();
    } else {
      const data = await channelModel.create({
        name: params.name,
        sort: params.sort,
        delete: false,
      });
      if (!data) return { code: 11, msg: "Channel add Failed" };
    }
    return { code: 1, msg: "Channel add success" };
  }

  public async channelEdit(params: ChannelEditDto): ServiceReturn<void> {
    const isExist = await channelModel.findOne({ name: params.name, delete: false });
    if (isExist && `${isExist._id}` !== params._id) return { code: 11, msg: "Name is exist" };

    // 查看当前要设置的排序是否已占用
    const isUsed = await channelModel.findOne({ sort: params.sort, delete: false });
    if (isUsed && `${isUsed._id}` !== params._id) {
      // 已占用，获取当前修改频道之前的排序值， 赋值给被占用的频道
      const beforeSort = await channelModel.findOne({ _id: params._id });
      await channelModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }

    // 未占用直接设置
    const _id = params._id;
    delete params._id;
    await channelModel.findOneAndUpdate({ _id: _id }, params, {
      new: true,
    });
    return { code: 1, msg: "Channel Update success" };
  }

  public async channelDel(params: ChannelDelDto): ServiceReturn<void> {
    const data = await channelModel.findOneAndUpdate(
      { _id: params._id },
      { delete: true },
      { new: true }
    );
    if (!data) return { code: 11, msg: "Channel delete Failed" };
    return { code: 1, msg: "Channel delete success" };
  }

  public async articleAudit(params: ArticleAuditDto): ServiceReturn<void> {
    const data = await articleModel.findOneAndUpdate(
      { _id: params._id },
      { audit: params.audit, delete: false },
      { new: true }
    );

    if (!data) return { code: 11, msg: "Article update Failed" };
    return { code: 1, msg: "Article update success" };
  }

  public async articleDel(params: ArticleDelDto): ServiceReturn<void> {
    if (!params.articleId) return { code: 11, msg: "ArticleId requied" };
    const data = await articleModel.findOneAndUpdate(
      { _id: params.articleId },
      { delete: true },
      { new: true }
    );
    if (!data) return { code: 12, msg: "Article delete Failed" };
    return { code: 1, msg: "Article delete success" };
  }

  public async albumGet(params: AlbumGetDto): ServiceReturn<AlbumPagination<Album>> {
    const { currentPage, pageSize, keywords } = params;
    let filter = null;
    if (keywords) {
      filter = {
        $or: [{ title: { $regex: keywords, $options: "$i" } }],
      };
    }

    const albumList = await paginationFind<Album>({
      model: albumModel,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
      sort: { sort: -1 },
      filter,
    });
    if (!albumList) return { code: 11, msg: "Album get Failed" };

    // 获取排序最大的一个专辑，用其sort值加1
    const sortAlbum = await albumModel.find().limit(1).sort({ sort: -1 });
    let sort = 0;
    if (sortAlbum && sortAlbum.length > 0) {
      sort = sortAlbum[0].sort + 1;
    }

    return {
      code: 1,
      msg: "Album get success",
      data: { ...albumList, maxSort: sort },
    };
  }

  public async albumAdd(params: AlbumAddDto): ServiceReturn<void> {
    const { title } = params;
    const albumFound = await albumModel.findOne({ title });
    if (albumFound) return { code: 11, msg: "Album exist" };

    // 获取排序最大的一个专辑，用其sort值加1
    const sortAlbum = await albumModel.find().limit(1).sort({ sort: -1 });
    params.sort = 0;
    if (sortAlbum && sortAlbum.length > 0) {
      params.sort = sortAlbum[0].sort + 1;
    }

    const data = await albumModel.create(params);
    if (!data) return { code: 12, msg: "Album add failed" };
    return { code: 1, msg: "Album add success" };
  }

  public async albumEdit(params: AlbumEditDto): ServiceReturn<void> {
    const { title, _id, sort } = params;
    const albumIdFound = await albumModel.findOne({ _id });
    if (!albumIdFound) return { code: 11, msg: "Album id don't exist" };

    const albumTitleFound = await albumModel.findOne({ title });
    if (albumTitleFound && `${albumTitleFound._id}` !== _id)
      return { code: 12, msg: "Album title exist" };

    // 查看当前要设置的排序是否已占用
    const isUsed = await albumModel.findOne({ sort: sort });
    if (isUsed && `${isUsed._id}` !== _id) {
      // 已占用，获取当前修改专辑之前的排序值， 赋值给被占用的频道
      const beforeSort = await albumModel.findOne({ _id });
      await albumModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }

    albumIdFound.title = title;
    albumIdFound.sort = sort;
    await albumIdFound.save();
    return { code: 1, msg: "Album edit success" };
  }

  public async albumDel(params: AlbumDelDto): ServiceReturn<void> {
    const { _id } = params;
    const albumIdFound = await albumModel.findOne({ _id });
    if (!albumIdFound) return { code: 11, msg: "Album id don't exist" };

    await albumIdFound.remove();
    await albumArticleModel.deleteMany({ albumId: _id });

    return { code: 1, msg: "Album del success" };
  }

  public async albumArticleGet(
    params: AlbumArticleGetDto
  ): ServiceReturn<AlbumPagination<AlbumArticle>> {
    const { albumId, currentPage, pageSize, keywords } = params;

    let filter: { albumId: string; $or?: anyType } = { albumId };
    if (keywords) {
      filter = {
        albumId,
        $or: [{ articleTitle: { $regex: keywords, $options: "$i" } }],
      };
    }

    const albumArticleList = await paginationFind<AlbumArticle>({
      model: albumArticleModel,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
      sort: { sort: -1 },
      filter,
    });
    if (!albumArticleList) return { code: 11, msg: "Album get Failed" };

    // 获取排序最大的一个专辑，用其sort值加1
    const sortAlbum = await albumArticleModel.find().limit(1).sort({ sort: -1 });
    let sort = 0;
    if (sortAlbum && sortAlbum.length > 0) {
      sort = sortAlbum[0].sort + 1;
    }

    return {
      code: 1,
      msg: "AlbumArticle get success",
      data: { ...albumArticleList, maxSort: sort },
    };
  }

  public async albumArticleAdd(params: AlbumArticleAddDto): ServiceReturn<void> {
    const { url, albumId } = params;
    if (url.indexOf("article/") === -1) return { code: 11, msg: "Url should be article link" };
    const articleId = url.split("article/")[1];
    const articleFound = await articleModel.findById(articleId);
    if (!articleFound) return { code: 12, msg: "Article don't exist" };

    const albumFound = await albumModel.findById(albumId);
    if (!albumFound) return { code: 13, msg: "Album don't exist" };

    const albumArticleIdFound = await albumModel.findOne({ albumId, articleId });
    if (albumArticleIdFound) return { code: 14, msg: "AlbumArticleTitle exist" };

    // 获取排序最大的一个专辑，用其sort值加1
    const sortAlbumArticle = await albumArticleModel.find().limit(1).sort({ sort: -1 });
    let sort = 0;
    if (sortAlbumArticle && sortAlbumArticle.length > 0) {
      sort = sortAlbumArticle[0].sort + 1;
    }

    const data = await albumArticleModel.create({
      albumId,
      articleId,
      sort,
      articleTitle: articleFound.title,
    });
    if (!data) return { code: 12, msg: "AlbumArticle add failed" };

    return { code: 1, msg: "AlbumArticle add success" };
  }

  public async albumArticleEdit(params: AlbumArticleEditDto): ServiceReturn<void> {
    const { url, albumId, sort, _id } = params;

    const albumArticleFound = await albumArticleModel.findById(_id);
    if (!albumArticleFound) return { code: 11, msg: "AlbumArticle don't exist" };

    const albumFound = await albumModel.findById(albumId);
    if (!albumFound) return { code: 12, msg: "Album don't exist" };

    if (url.indexOf("article/") === -1) return { code: 13, msg: "Url should be article link" };
    const articleId = url.split("article/")[1];
    const articleFound = await articleModel.findById(articleId);
    if (!articleFound) return { code: 13, msg: "Article don't exist" };

    const albumArticleIdFound = await albumModel.findOne({ albumId, articleId });
    if (albumArticleIdFound) return { code: 14, msg: "AlbumArticleTitle exist" };

    // 查看当前要设置的排序是否已占用
    const isUsed = await albumArticleModel.findOne({ sort: sort });
    if (isUsed && `${isUsed._id}` !== _id) {
      // 已占用，获取当前修改专辑之前的排序值， 赋值给被占用的频道
      const beforeSort = await albumArticleModel.findOne({ _id });
      await albumArticleModel.findOneAndUpdate({ _id: isUsed._id }, { sort: beforeSort.sort });
    }

    albumArticleFound.articleId = articleId;
    albumArticleFound.articleTitle = articleFound.title;
    albumArticleFound.albumId = albumId;
    albumArticleFound.sort = sort;
    await albumArticleFound.save();
    return { code: 1, msg: "AlbumArticle add success" };
  }

  public async albumArticleDel(params: AlbumArticleDelDto): ServiceReturn<void> {
    const { _id } = params;
    const albumArticleIdFound = await albumArticleModel.findOne({ _id });
    if (!albumArticleIdFound) return { code: 11, msg: "AlbumArticle id don't exist" };

    await albumArticleIdFound.remove();
    return { code: 1, msg: "AlbumArticle del success" };
  }
}
