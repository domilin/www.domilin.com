import { Request, Response } from "express";
import ArticleService from "../services/article.service";
import { ServiceData } from "../interfaces/public.interface";
import { Article, Tag, Channel, Album } from "../interfaces/article.interface";
import {
  ArticleAddDto,
  ArticleEditDto,
  ArticleDelDto,
  ArticleGetDto,
  TagDto,
  AlbumGetDto,
  AlbumGetByArticleIdDto,
} from "../dtos/article.dto";
import { PaginationReturn } from "../utils/index";
import { User } from "../interfaces/user.interface";

export default class ArticleController {
  public articleService = new ArticleService();

  /** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 start----------------------------------- */
  public articleAdd = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleAddDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Article> = await this.articleService.articleAdd(params);
    res.json(data);
  };
  public articleEdit = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleEditDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<Article> = await this.articleService.articleEdit(params);
    res.json(data);
  };
  public articleGetUser = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleGetDto = req.query;
    params.userId = (req.user as User)._id; // 与articleGet只多userId，通过这个判断是否是获取用户相关文章列表或详情

    const data: ServiceData<
      PaginationReturn<Article> | Article | Article[]
    > = await this.articleService.articleGet(params, { backend: false });
    res.json(data);
  };
  public articleDel = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleDelDto = req.body;
    params.userId = (req.user as User)._id;

    const data: ServiceData<void> = await this.articleService.articleDel(params);
    res.json(data);
  };
  /** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 end ----------------------------------- */

  public articleGet = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleGetDto = req.query;
    const data: ServiceData<
      PaginationReturn<Article> | Article | Article[]
    > = await this.articleService.articleGet(params, { backend: false });
    res.json(data);
  };
  public tagAddEdit = async (req: Request, res: Response): Promise<void> => {
    const tagName: string = req.body.name;
    const data: ServiceData<Tag> = await this.articleService.tagAddEdit(tagName);
    res.json(data);
  };
  public tagGet = async (req: Request, res: Response): Promise<void> => {
    const params: TagDto = req.query;
    const data: ServiceData<Tag[]> = await this.articleService.tagGet(params);
    res.json(data);
  };

  public channelGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<Channel[]> = await this.articleService.channelGet();
    res.json(data);
  };

  public albumGet = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumGetDto = req.query;
    const data: ServiceData<PaginationReturn<Album> | Album> = await this.articleService.albumGet(
      params
    );
    res.json(data);
  };

  public albumGetByArticleId = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumGetByArticleIdDto = req.query;
    const data: ServiceData<Album[]> = await this.articleService.albumGetByArticleId(params);
    res.json(data);
  };
}
