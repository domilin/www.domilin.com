import { RootDispatch } from "./store";
import { ModelConfig, ModelEffects } from "./rematch";
import { site } from "../public/apis";
import { ajax } from "../public";

interface IdParams {
  _id: string;
}
interface BasicWebsite {
  icon: string;
  name: string;
  sort: number;
}

// 一级导航参数
export interface FirstLevelPutParams extends BasicWebsite {
  recommend: boolean;
}
export type FirstLevelPostParams = IdParams & FirstLevelPutParams;

// 二级导航参数
export interface SecondLevelPutParams extends BasicWebsite {
  firstLevelId: string;
}
export type SecondLevelPostParams = IdParams & SecondLevelPutParams;

// 网站地址参数
export interface WebsitePutParams extends SecondLevelPutParams {
  intro: string;
  url: string;
  secondLevelId: string;
  background: string;
  recommendSecondLevelId?: string;
}
export interface WebsitePostParams extends WebsitePutParams {
  _id: string;
  _v?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface WebsiteTableItem extends WebsitePostParams {
  key: string;
}
export type WebsiteGetParams = {
  secondLevelId?: string;
  keywords?: string;
  recommend?: boolean | undefined;
};

// 组件公用接口
export interface CurrentLevel {
  firstLevel?: string | undefined;
  secondLevel?: string | undefined;
  recommend?: boolean | undefined;
}

// 导航state
export type websiteState = {
  firstLevel: FirstLevelPostParams[];
  secondLevel: SecondLevelPostParams[];
  websiteList: WebsitePostParams[];
};
export const website: ModelConfig = {
  state: {
    firstLevel: [],
    secondLevel: [],
    websiteList: []
  },
  reducers: {
    firstLevelData: (state: websiteState, payload: FirstLevelPostParams[]): void => {
      state.firstLevel = payload;
    },
    secondLevelData: (state: websiteState, payload: SecondLevelPostParams[]): void => {
      state.secondLevel = payload;
    },
    websiteData: (state: websiteState, payload: WebsiteTableItem[]): void => {
      payload.map(function(item: WebsiteTableItem, index: number) {
        item.key = item._id;
        return item;
      });
      state.websiteList = payload;
    }
  },
  effects: (dispatch: RootDispatch): ModelEffects => ({
    // 一级导航
    async firstLevelAdd(payload: FirstLevelPutParams, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: site.firstLevel,
        params: payload
      });
      return res;
    },
    async firstLevelEdit(payload: FirstLevelPostParams, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: site.firstLevel,
        params: payload
      });
      return res;
    },
    async firstLevelGet(payload, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: site.firstLevel
      });
      if (res.code === 1) dispatch.website.firstLevelData(res.data);
      return res;
    },
    async firstLevelDel(_id: string, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: site.firstLevel,
        params: { _id }
      });
      return res;
    },

    // 二级导航
    async secondLevelAdd(payload: SecondLevelPutParams, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: site.secondLevel,
        params: payload
      });
      return res;
    },
    async secondLevelEdit(payload: SecondLevelPostParams, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: site.secondLevel,
        params: payload
      });
      return res;
    },
    async secondLevelGet(firstLevelId, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: site.secondLevel,
        params: { firstLevelId }
      });
      return res;
    },
    async secondLevelDel(_id: string, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: site.secondLevel,
        params: { _id }
      });
      return res;
    },

    // 网站地址
    async websiteAdd(payload: WebsitePutParams, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: site.website,
        params: payload
      });
      return res;
    },
    async websiteEdit(payload: WebsitePostParams, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: site.website,
        params: payload
      });
      return res;
    },
    async websiteGet(payload: WebsiteGetParams, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: site.website,
        params: payload
      });
      if (res.code === 1) dispatch.website.websiteData(res.data);
      return res;
    },
    async websiteDel(_id: string, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: site.website,
        params: { _id }
      });
      return res;
    }
  })
};
