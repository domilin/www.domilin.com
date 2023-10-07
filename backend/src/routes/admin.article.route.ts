import Router from "express-promise-router";
import AdminArticleController from "../controllers/admin.article.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminAuthMiddleware from "../middlewares/admin.auth.middleware";
import { Route } from "../interfaces/public.interface";
import {
  ChannelAddDto,
  ChannelDelDto,
  ChannelEditDto,
  ArticleGetDto,
  ArticleDelDto,
  ArticleAuditDto,
  AlbumGetDto,
  AlbumAddDto,
  AlbumEditDto,
  AlbumDelDto,
  AlbumArticleGetDto,
  AlbumArticleAddDto,
  AlbumArticleDelDto,
  AlbumArticleEditDto,
} from "../dtos/article.dto";

class IndexRoute implements Route {
  public path = "/admin/article";
  public router = Router();
  public controller = new AdminArticleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/channel`, adminAuthMiddleware, this.controller.channelGet);
    this.router.put(
      `${this.path}/channel`,
      validationMiddleware(ChannelAddDto),
      adminAuthMiddleware,
      this.controller.channelAdd
    );
    this.router.post(
      `${this.path}/channel`,
      validationMiddleware(ChannelEditDto),
      adminAuthMiddleware,
      this.controller.channelEdit
    );
    this.router.delete(
      `${this.path}/channel`,
      validationMiddleware(ChannelDelDto),
      adminAuthMiddleware,
      this.controller.channelDel
    );
    this.router.get(
      `${this.path}/blog`,
      validationMiddleware(ArticleGetDto),
      adminAuthMiddleware,
      this.controller.articleGet
    );
    this.router.post(
      `${this.path}/blog`,
      validationMiddleware(ArticleAuditDto),
      adminAuthMiddleware,
      this.controller.articleAudit
    );
    this.router.delete(
      `${this.path}/blog`,
      validationMiddleware(ArticleDelDto, true),
      adminAuthMiddleware,
      this.controller.articleDel
    );
    this.router.get(
      `${this.path}/album`,
      validationMiddleware(AlbumGetDto),
      adminAuthMiddleware,
      this.controller.albumGet
    );
    this.router.put(
      `${this.path}/album`,
      validationMiddleware(AlbumAddDto),
      adminAuthMiddleware,
      this.controller.albumAdd
    );
    this.router.post(
      `${this.path}/album`,
      validationMiddleware(AlbumEditDto),
      adminAuthMiddleware,
      this.controller.albumEdit
    );
    this.router.delete(
      `${this.path}/album`,
      validationMiddleware(AlbumDelDto),
      adminAuthMiddleware,
      this.controller.albumDel
    );
    this.router.get(
      `${this.path}/albumarticle`,
      validationMiddleware(AlbumArticleGetDto),
      adminAuthMiddleware,
      this.controller.albumArticleGet
    );
    this.router.put(
      `${this.path}/albumarticle`,
      validationMiddleware(AlbumArticleAddDto),
      adminAuthMiddleware,
      this.controller.albumArticleAdd
    );
    this.router.post(
      `${this.path}/albumarticle`,
      validationMiddleware(AlbumArticleEditDto),
      adminAuthMiddleware,
      this.controller.albumArticleEdit
    );
    this.router.delete(
      `${this.path}/albumarticle`,
      validationMiddleware(AlbumArticleDelDto),
      adminAuthMiddleware,
      this.controller.albumArticleDel
    );
  }
}

export default IndexRoute;
