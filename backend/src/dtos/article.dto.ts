import { IsString, IsArray, IsNumber, IsBoolean } from "class-validator";

/** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 start ----------------------------------- */
export class ArticleDelDto {
  @IsString()
  public articleId: string;

  public userId: string;
}

export class ArticleAddDto {
  @IsString()
  public title: string;

  @IsString()
  public content: string;

  @IsArray()
  public tags: Array<TagDto>;

  @IsString()
  public channelId: string;

  public intro: string; // 不需要传，在保存时自动截取前200字作为简介

  public userId: string;
}

export class ArticleEditDto extends ArticleAddDto {
  @IsString()
  public _id: string;
}
/** @desc -----------------------------------登录用户获取、发布、编辑自己的文章 end ----------------------------------- */

export class ArticleAuditDto {
  @IsString()
  public _id: string;

  @IsBoolean()
  public audit: boolean;
}

export class ArticleGetDto {
  @IsString() // 应该为number，get请求已转为number
  public currentPage: string;

  @IsString() // 应该为number，get请求已转为number
  public pageSize: string;

  public tagId?: string; // 多个tagId, 用英文“,”逗号隔开

  public articleId?: string;

  public keywords?: string;

  public audit?: string;

  public channelId?: string;

  public albumId?: string;

  public sitemap?: string; // 0没有sitemap文件或者内容为0--获取一个月之内的，1已有--则获取一天之内的

  public userId?: string;
}

export class TagDto {
  public name: string;

  public _id: string;
}

export class ChannelDelDto {
  @IsString()
  public _id: string;
}

export class ChannelAddDto {
  @IsString()
  public name: string;

  @IsNumber()
  public sort: number;
}

export class ChannelEditDto {
  @IsString()
  public _id: string;

  @IsString()
  public name: string;

  @IsNumber()
  public sort: number;
}

export class AlbumGetDto {
  @IsString() // 应该为number，get请求已转为number
  public currentPage: string;

  @IsString() // 应该为number，get请求已转为number
  public pageSize: string;

  public keywords: string;

  public _id: string;
}

export class AlbumAddDto {
  @IsString()
  public title: string;

  public sort: number; // 前端不需要传，service中通过查找，sort排序，最后一个的sort+1
}

export class AlbumEditDto {
  @IsString()
  public _id: string;

  @IsString()
  public title: string;

  @IsNumber()
  public sort: number;
}

export class AlbumDelDto {
  @IsString()
  public _id: string;
}

export class AlbumArticleGetDto {
  @IsString() // 应该为number，get请求已转为number
  public currentPage: string;

  @IsString() // 应该为number，get请求已转为number
  public pageSize: string;

  @IsString()
  public albumId: string;

  public keywords: string;
}

export class AlbumArticleAddDto {
  @IsString()
  public url: string;

  @IsString()
  public albumId: string;

  public sort: number;
}

export class AlbumArticleEditDto {
  @IsString()
  public _id: string;

  @IsString()
  public url: string;

  @IsNumber()
  public sort: number;

  @IsString()
  public albumId: string;
}

export class AlbumArticleDelDto {
  @IsString()
  public _id: string;
}

export class AlbumGetByArticleIdDto {
  @IsString()
  public articleId: string;
}

export class CommentDto {
  @IsString()
  public articleId: string;

  @IsString()
  public content: string;

  public userId: string;
}

export class CommentPostDto extends ArticleEditDto {
  @IsString()
  public _id: string;
}
