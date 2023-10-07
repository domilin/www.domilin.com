import { Request, Response } from "express";
import PosterService from "../services/poster.service";
import { ServiceData } from "../interfaces/public.interface";
import { Poster, Setting, Font } from "../interfaces/poster.interface";
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

export default class IndexController {
  public service = new PosterService();

  public posterGet = async (req: Request, res: Response): Promise<void> => {
    const params: PosterGetDto = req.query;
    const data: ServiceData<Poster[] | Poster> = await this.service.posterGet(params);
    res.json(data);
  };
  public posterDel = async (req: Request, res: Response): Promise<void> => {
    const params: PosterGetDto = req.body;
    const data: ServiceData<void> = await this.service.posterDel(params);
    res.json(data);
  };
  public posterAdd = async (req: Request, res: Response): Promise<void> => {
    const params: PosterPutDto = req.body;
    const data: ServiceData<Poster> = await this.service.posterAdd(params);
    res.json(data);
  };
  public posterEdit = async (req: Request, res: Response): Promise<void> => {
    const params: PosterPostDto = req.body;
    const data: ServiceData<Poster> = await this.service.posterEdit(params);
    res.json(data);
  };
  public settingAdd = async (req: Request, res: Response): Promise<void> => {
    const params: SettingPutDto = req.body;
    const data: ServiceData<Setting> = await this.service.settingAdd(params);
    res.json(data);
  };
  public settingEdit = async (req: Request, res: Response): Promise<void> => {
    const params: SettingPostDto = req.body;
    const data: ServiceData<Setting> = await this.service.settingEdit(params);
    res.json(data);
  };
  public settingDel = async (req: Request, res: Response): Promise<void> => {
    const params: SettingGetDelDto = req.body;
    const data: ServiceData<void> = await this.service.settingDel(params);
    res.json(data);
  };
  public fontGet = async (req: Request, res: Response): Promise<void> => {
    const data: ServiceData<Font[]> = await this.service.fontGet();
    res.json(data);
  };
  public fontAdd = async (req: Request, res: Response): Promise<void> => {
    const params: FontPostDto = req.body;
    const data: ServiceData<Font> = await this.service.fontAdd(params);
    res.json(data);
  };
  public posterCreate = async (req: Request, res: Response): Promise<void> => {
    const params: PosterCreateDto = req.body;
    const data: ServiceData<string[]> = await this.service.posterCreate(params);
    res.json(data);
  };
}
