import { init } from "@rematch/core";
import immerPlugin from "@rematch/immer";

import { RematchRootDispatch, RematchRootState } from "./rematch";
import * as models from "./root";

const immer = immerPlugin();
export const store = init({
  models,
  plugins: [immer]
});

export type RootState = RematchRootState<typeof models>;

export type RootDispatch = RematchRootDispatch<typeof models>;
