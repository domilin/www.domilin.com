import { Request, Response } from "express";
import PublicService from "../services/public.service";
import { UploadLargeDto } from "../dtos/public.dto";
import { ServiceData, UploadInfo } from "../interfaces/public.interface";

export default class PublicController {
  public publicService = new PublicService();

  public upload = async (req: Request, res: Response): Promise<void> => {
    const originalname = req.file.originalname;
    const filename = req.file.filename;
    const destination = req.file.destination;
    const url = `${destination.split("/static")[1]}${filename}`;
    const size = req.file.size;
    const data: ServiceData<UploadInfo> = await this.publicService.upload(originalname, url, size);
    res.json(data);
  };

  public uploadUrlImage = async (req: Request, res: Response): Promise<void> => {
    const url: string = req.body.url;
    const data: ServiceData<string> = await this.publicService.uploadUrlImage(url);
    res.json(data);
  };

  public uploadDelete = async (req: Request, res: Response): Promise<void> => {
    const fileUrl: string = req.body.fileUrl;
    const data: ServiceData<void> = await this.publicService.uploadDelete(fileUrl);
    res.json(data);
  };

  public uploadLarge = async (req: Request, res: Response): Promise<void> => {
    const info: UploadLargeDto = req.body;
    const filename: string = req.file.fieldname;
    const data: ServiceData<UploadLargeDto> = await this.publicService.uploadLarge(info, filename);
    res.json(data);
  };
}
