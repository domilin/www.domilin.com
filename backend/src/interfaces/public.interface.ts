import { Router } from "express";

export interface Route {
  path: string;
  router: Router;
}

export type ServiceData<T> = {
  code: number;
  msg: string;
  data?: T;
  [key: string]: string | number | T;
};

export type ServiceReturn<T> = Promise<ServiceData<T>>;

export interface UploadInfo {
  filename: string;
  url: string;
  size: number;
}
