import { IsString, IsNumber } from "class-validator";

export class UploadLargeDto {
  @IsString()
  public name: string;

  @IsNumber()
  public total: number;

  @IsNumber()
  public index: number;

  @IsNumber()
  public size: number;

  @IsNumber()
  public timestamp: number;
}

export class UploadDeleteDto {
  @IsString()
  public fileUrl: string;
}

export class UploadUrlImageDto {
  @IsString()
  public url: string;
}
