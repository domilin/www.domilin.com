import Router from "express-promise-router";
import ArticleController from "../controllers/article.controller";
import { Route } from "../interfaces/public.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import authMiddleware from "../middlewares/auth.middleware";

import {
  ArticleAddDto,
  ArticleEditDto,
  ArticleGetDto,
  CommentDto,
  CommentPostDto,
  TagDto,
  AlbumGetDto,
  AlbumGetByArticleIdDto,
} from "../dtos/article.dto";

export default class WebsiteRoute implements Route {
  public path = "/article";
  public pathArticle = `${this.path}/blog`;
  public pathArticleUser = `${this.path}/blog/user`;
  public pathComment = `${this.path}/comment`;
  public pathTag = `${this.path}/tag`;
  public pathChannel = `${this.path}/channel`;
  public pathAlbum = `${this.path}/album`;
  public pathAlbumByArticle = `${this.path}/albumbyarticle`;
  public router = Router();
  public articleController = new ArticleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /** @desc
     * -----------------------------------登录用户获取、发布、编辑自己的文章 start -----------------------------------
     * 需要token、userId判断当前请求是否为当前登录用户
     */
    this.router.put(
      this.pathArticle,
      validationMiddleware(ArticleAddDto),
      authMiddleware,
      this.articleController.articleAdd
    );
    this.router.post(
      this.pathArticle,
      validationMiddleware(ArticleEditDto),
      authMiddleware,
      this.articleController.articleEdit
    );
    this.router.get(
      `${this.pathArticleUser}`, // 获取个人文章列表(审核，未审核的都返回)
      validationMiddleware(ArticleGetDto, true),
      authMiddleware,
      this.articleController.articleGetUser
    );
    this.router.delete(
      this.pathArticle,
      validationMiddleware(ArticleEditDto, true),
      authMiddleware,
      this.articleController.articleDel
    );
    /** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 end ----------------------------------- */

    this.router.get(
      // 这是公开的文章获取
      // 根据tagId-->标签文章列表、channelId频道文章列表、userId用户文章列表、articleId文章详情、albumId专辑文章列表、keywords搜索文章
      this.pathArticle,
      validationMiddleware(ArticleGetDto, true),
      this.articleController.articleGet
    );
    this.router.post(
      this.pathTag,
      validationMiddleware(TagDto),
      authMiddleware,
      this.articleController.tagAddEdit
    );
    this.router.get(this.pathTag, validationMiddleware(TagDto), this.articleController.tagGet);
    this.router.get(this.pathChannel, this.articleController.channelGet);
    this.router.get(
      this.pathAlbum,
      validationMiddleware(AlbumGetDto, true),
      this.articleController.albumGet
    );
    this.router.get(
      this.pathAlbumByArticle,
      validationMiddleware(AlbumGetByArticleIdDto),
      this.articleController.albumGetByArticleId
    );
  }
}
