import { IsString, IsArray } from "class-validator";

export class PosterPutDto {
  @IsString()
  public name: string;

  @IsString()
  public url: string;
}

export class PosterPostDto extends PosterPutDto {
  @IsString()
  public _id: string;
}

export class PosterGetDto {
  @IsString()
  public _id?: string;
}

export class SettingPutDto {
  // @IsString()
  public posterId: string;

  @IsString()
  public title: string;

  public value?: string;

  public left: number;

  public top: number;

  public textAlign: string;

  public fontFamily: {
    id: string;
    value: string;
    name: string;
  };

  public fontSize: number;

  public fontColor: string;
}

export class SettingPostDto extends SettingPutDto {
  @IsString()
  public _id: string;
}

export class SettingGetDelDto {
  @IsString()
  public _id: string;
}

export class PosterCreateDto {
  @IsString()
  public posterId: string;

  @IsArray()
  public setting: [
    {
      id: string;
      value: string;
    }
  ];
}

export class FontPostDto {
  @IsString()
  public url: string;

  @IsString()
  public name: string;
}
