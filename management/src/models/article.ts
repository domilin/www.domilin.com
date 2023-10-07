import { RootDispatch } from "./store";
import { ModelConfig, ModelEffects } from "./rematch";
import { ajax } from "../public";
import { article } from "../public/apis";

export interface Article {
  _id: string;
  key?: string;
  title: string;
  intro: string;
  userId: string;
  delete: boolean;
  audit: boolean;
  updatedAt: string;
}
export interface Channel {
  _id: string;
  name: string;
  sort: number;
}
export interface Album {
  key?: string;
  _id: string;
  title: string;
  sort: number;
}
export interface AlbumGet {
  currentPage: number;
  keywords?: string;
}
export interface AlbumArticle {
  key?: string;
  _id: string;
  albumId: string;
  articleId: string;
  articleTitle: string;
  sort: number;
  url?: string;
}
export interface AlbumArticleGet {
  currentPage: number;
  albumId: string;
  keywords?: string;
}
export interface ArticleGet {
  currentPage: number;
  channelId?: string;
  keywords?: string;
  delete?: string;
  audit?: string;
}

// article state
export type ArticleModelState = {
  articleList: Article[];
  channelList: Channel[];
  albumList: Album[];
  albumArticleList: AlbumArticle[];
};
export const articleModel: ModelConfig = {
  state: {
    articleList: [],
    channelList: [],
    albumList: [],
    albumArticleList: []
  },
  reducers: {
    articleListSet: (state: ArticleModelState, payload: Article[]): void => {
      payload.map(function(item: Article, index: number) {
        item.key = item._id;
        return item;
      });
      state.articleList = payload;
    },
    channelListSet: (state: ArticleModelState, payload: Channel[]): void => {
      state.channelList = payload;
    },
    albumListSet: (state: ArticleModelState, payload: Album[]): void => {
      payload.map(function(item: Album, index: number) {
        item.key = item._id;
        return item;
      });
      state.albumList = payload;
    },
    albumArticleListSet: (state: ArticleModelState, payload: AlbumArticle[]): void => {
      payload.map(function(item: AlbumArticle, index: number) {
        item.key = item._id;
        return item;
      });
      state.albumArticleList = payload;
    }
  },
  effects: (dispatch: RootDispatch): ModelEffects => ({
    async channelGet(payload, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: article.channel
      });
      if (res && res.code === 1) dispatch.article.channelListSet(res.data);
      return res;
    },
    async channelEdit(payload: Channel, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: article.channel,
        params: payload
      });
      return res;
    },
    async channelAdd(payload: { name: string; sort: number }, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: article.channel,
        params: payload
      });
      return res;
    },
    async channelDel(payload: { _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: article.channel,
        params: payload
      });
      return res;
    },
    async albumGet(payload: AlbumGet, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: article.album,
        params: {
          pageSize: 10,
          ...payload
        }
      });
      if (res && res.code === 1) dispatch.article.albumListSet(res.data.list);
      return res;
    },
    async albumAdd(payload: { title: string }, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: article.album,
        params: payload
      });
      return res;
    },
    async albumEdit(payload: { title: string; sort: number }, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: article.album,
        params: payload
      });
      return res;
    },
    async albumDel(payload: { _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: article.album,
        params: payload
      });
      return res;
    },
    async albumArticleGet(payload: AlbumArticleGet, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: article.albumArticle,
        params: {
          pageSize: 10,
          ...payload
        }
      });
      if (res && res.code === 1) dispatch.article.albumArticleListSet(res.data.list);
      return res;
    },
    async albumArticleAdd(payload: { albumId: string; url: string; sort: number }, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: article.albumArticle,
        params: payload
      });
      return res;
    },
    async albumArticleEdit(payload: { albumId: string; url: string; sort: number; _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: article.albumArticle,
        params: payload
      });
      return res;
    },
    async albumArticleDel(payload: { _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: article.albumArticle,
        params: payload
      });
      return res;
    },
    async articleGet(payload: ArticleGet, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: article.blog,
        params: {
          pageSize: 10,
          ...payload
        }
      });
      if (res && res.code === 1) dispatch.article.articleListSet(res.data.list);
      return res;
    },
    async articleAudit(payload: { _id: string; audit: boolean }, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: article.blog,
        params: payload
      });
      return res;
    },
    async articleDel(payload: { _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: article.blog,
        params: payload
      });
      return res;
    }
  })
};
