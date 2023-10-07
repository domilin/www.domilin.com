import { IsString, IsBoolean } from "class-validator";

export class WallpaperDelDto {
  @IsString()
  public _id: string;
}

export class WallpaperSetMainDto extends WallpaperDelDto {
  @IsBoolean()
  public main: boolean;
}

export class WallpaperGetDto {
  @IsString()
  public curPage: string;

  @IsString()
  public sizePage: string;
}

export class WallpaperAddDto {
  @IsString()
  public url: string;
}
