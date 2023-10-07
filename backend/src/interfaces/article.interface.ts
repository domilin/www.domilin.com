import { User } from "./user.interface";
import { PaginationReturn } from "../utils";
export interface Article {
  _id: string;
  title: string;
  intro: string;
  content: string;
  userId: string;
  tags: Tag[];
  user?: User;
  channelId: string;
  audit: boolean;
  delete: boolean;
  // comments: string[];
}

export interface Tag {
  _id: string;
  name: string;
  num?: number;
}

export interface TagMap {
  tagId: string;
  articleId: string;
}

export interface Channel {
  _id: string;
  name: string;
  sort: number;
  delete: boolean;
}

export interface Album {
  _id: string;
  title: string;
  sort: number;
}

export interface AlbumPagination<T> extends PaginationReturn<T> {
  maxSort?: number;
}

export interface AlbumArticle {
  _id: string;
  albumId: string;
  articleId: string;
  articleTitle: string;
  sort: number;
}
