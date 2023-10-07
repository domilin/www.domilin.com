import { RootDispatch } from "./store";
import { ModelConfig, ModelEffects } from "./rematch";
import { wallpaper } from "../public/apis";
import { ajax } from "../public";

export interface WallpaperItem {
  key: string;
  _id: string;
  url: string;
  main: boolean;
}

export type WallpaperState = {
  list: WallpaperItem[];
};
export const wallpaperModel: ModelConfig = {
  state: {
    list: []
  },
  reducers: {
    setList: (state: WallpaperState, payload: WallpaperItem[]): void => {
      payload.map(function(item: WallpaperItem, index: number) {
        item.key = item._id;
        return item;
      });
      state.list = payload;
    }
  },
  effects: (dispatch: RootDispatch): ModelEffects => ({
    async wallpaperGet({ curPage }: { curPage: number }, state): Promise<void> {
      const res = await ajax({
        type: "get",
        url: wallpaper.wallpaper,
        params: { curPage, sizePage: 10 }
      });
      if (res.code === 1) dispatch.wallpaper.setList(res.data.list);
      return res;
    },
    async wallpaperAdd({ url }: { url: string }, state): Promise<void> {
      const res = await ajax({
        type: "put",
        url: wallpaper.wallpaper,
        params: { url }
      });
      return res;
    },
    async wallpaperDel({ _id }: { _id: string }, state): Promise<void> {
      const res = await ajax({
        type: "delete",
        url: wallpaper.wallpaper,
        params: { _id }
      });
      return res;
    },
    async setMain(payload: { _id: string; main: boolean }, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: wallpaper.setMain,
        params: payload
      });
      return res;
    }
  })
};
