import { IsString, IsNumber } from "class-validator";

export class BasicWebsiteDto {
  @IsString()
  public icon: string;

  @IsString()
  public name: string;

  @IsNumber()
  public sort: number;
}

// 一级导航
export class FirstLevelDto extends BasicWebsiteDto {
  public recommend?: boolean;
}

export class FirstLevelPostDto extends FirstLevelDto {
  @IsString()
  public _id: string;
}

// 一级导航
export class SecondLevelDto extends BasicWebsiteDto {
  @IsString()
  public firstLevelId: string;
}

export class SecondLevelPostDto extends SecondLevelDto {
  @IsString()
  public _id: string;
}

// 网站地址
export class WebsiteDto extends SecondLevelDto {
  @IsString()
  public intro: string;

  @IsString()
  public url: string;

  @IsString()
  public secondLevelId: string;

  @IsString()
  public background: string;

  public recommendFirstLevelId?: string; // 前端不用传，后端通过recommendSecondLevelId查询传入，在此只是定义用于service

  public recommendSecondLevelId?: string;
}

export class WebsitePostDto extends WebsiteDto {
  @IsString()
  public _id: string;
}

export class WebsiteGetDto {
  @IsString()
  public keywords: string;

  @IsString()
  public recommend?: "true" | "false"; // (eg:home)是否为推荐网址查询, get请求默认参数转为字符串

  @IsString()
  public firstLevelId: string; // 可选参数 firstLevelId、secondLevelId 二选一

  @IsString()
  public secondLevelId: string;

  @IsString()
  public currentPage: string;

  @IsString()
  public pageSize: string;
}
