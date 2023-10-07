import { Request, Response } from "express";
import AdminArticleService from "../services/admin.article.service";
import ArticleService from "../services/article.service";
import { ServiceData } from "../interfaces/public.interface";
import { Article, Channel, Album, AlbumArticle } from "../interfaces/article.interface";
import {
  ChannelAddDto,
  ChannelDelDto,
  ChannelEditDto,
  ArticleAuditDto,
  ArticleDelDto,
  ArticleGetDto,
  AlbumGetDto,
  AlbumAddDto,
  AlbumEditDto,
  AlbumDelDto,
  AlbumArticleGetDto,
  AlbumArticleAddDto,
  AlbumArticleDelDto,
  AlbumArticleEditDto,
} from "../dtos/article.dto";
import { PaginationReturn } from "../utils/index";

export default class WallpaperController {
  public service = new AdminArticleService();
  public serviceFrontend = new ArticleService();
  public channelGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<Channel[]> = await this.service.channelGet();
    res.json(data);
  };
  public channelAdd = async (req: Request, res: Response): Promise<void> => {
    const params: ChannelAddDto = req.body;
    const data: ServiceData<void> = await this.service.channelAdd(params);
    res.json(data);
  };
  public channelEdit = async (req: Request, res: Response): Promise<void> => {
    const params: ChannelEditDto = req.body;
    const data: ServiceData<void> = await this.service.channelEdit(params);
    res.json(data);
  };
  public channelDel = async (req: Request, res: Response): Promise<void> => {
    const params: ChannelDelDto = req.body;
    const data: ServiceData<void> = await this.service.channelDel(params);
    res.json(data);
  };
  public articleGet = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleGetDto = req.query;
    const data: ServiceData<
      PaginationReturn<Article> | Article | Article[]
    > = await this.serviceFrontend.articleGet(params, { backend: true });
    res.json(data);
  };
  public articleAudit = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleAuditDto = req.body;
    const data: ServiceData<void> = await this.service.articleAudit(params);
    res.json(data);
  };
  public articleDel = async (req: Request, res: Response): Promise<void> => {
    const params: ArticleDelDto = req.body;
    const data: ServiceData<void> = await this.service.articleDel(params);
    res.json(data);
  };

  public albumGet = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumGetDto = req.query;
    const data: ServiceData<PaginationReturn<Album>> = await this.service.albumGet(params);
    res.json(data);
  };

  public albumAdd = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumAddDto = req.body;
    const data: ServiceData<void> = await this.service.albumAdd(params);
    res.json(data);
  };

  public albumEdit = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumEditDto = req.body;
    const data: ServiceData<void> = await this.service.albumEdit(params);
    res.json(data);
  };

  public albumDel = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumDelDto = req.body;
    const data: ServiceData<void> = await this.service.albumDel(params);
    res.json(data);
  };

  public albumArticleGet = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumArticleGetDto = req.query;
    const data: ServiceData<PaginationReturn<AlbumArticle>> = await this.service.albumArticleGet(
      params
    );
    res.json(data);
  };

  public albumArticleAdd = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumArticleAddDto = req.body;
    const data: ServiceData<void> = await this.service.albumArticleAdd(params);
    res.json(data);
  };

  public albumArticleEdit = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumArticleEditDto = req.body;
    const data: ServiceData<void> = await this.service.albumArticleEdit(params);
    res.json(data);
  };

  public albumArticleDel = async (req: Request, res: Response): Promise<void> => {
    const params: AlbumArticleDelDto = req.body;
    const data: ServiceData<void> = await this.service.albumArticleDel(params);
    res.json(data);
  };
}
