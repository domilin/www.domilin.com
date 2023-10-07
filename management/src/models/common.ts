import { RootDispatch } from "./store";
import { ModelConfig, ModelEffects } from "./rematch";
import { auth, communal } from "../public/apis";
import { ajax } from "../public";

export interface SigninParams {
  username: string;
  password: string;
}

export type CommonState = {
  signinShow: boolean;
  breadcrumb: string[];
};
export const common: ModelConfig = {
  state: {
    signinShow: false,
    breadcrumb: []
  },
  reducers: {
    signinShow: (state: CommonState, payload: boolean): void => {
      state.signinShow = payload;
    },
    breadcrumbData: (state: CommonState, payload: string[]): void => {
      state.breadcrumb = payload;
    }
  },
  effects: (dispatch: RootDispatch): ModelEffects => ({
    async signin(payload: SigninParams, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: auth.signin,
        params: payload
      });
      return res;
    },
    async uploadDelete(fileUrl: string, state): Promise<void> {
      const res = await ajax({
        type: "post",
        url: communal.uploadDelete,
        params: { fileUrl: fileUrl }
      });
      return res;
    }
  })
};
