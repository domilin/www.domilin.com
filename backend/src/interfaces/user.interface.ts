import { Document } from "mongoose";

export type ComparePasswordFunction = (candidatePassword: string) => Promise<boolean>;

interface UserBase {
  _id: string;
  userName: string;
  password: string;
  email?: string;
  levels?: Array<Level>;
  folders?: Array<Folder>;
  token?: string;
  comparePassword?: ComparePasswordFunction;
  toObject?: Document["toObject"];
  save?: Document["save"];
  nickName?: string; // 昵称
  avatar?: string; // 头像
  engine?: string; // 搜索引擎
  theme?: string; // 主题: night, light
  themeFollowSys?: boolean; // 主题跟随系统
  wallpaperType?: string; // official官方，color纯色，custom自定义
  wallpaper?: string; // 壁纸地址或颜色值
  wallpaperBlur?: boolean; // 壁纸模糊
  iconType?: string; // 网站图标类型: efficient高效，light轻巧
  iconAddShow?: boolean; // 显示添加按钮
  sidebar?: string; // 侧边栏位置: left, right
  sidebarAuto?: boolean; // 侧边栏自动隐藏
  sidebarNarrow?: boolean; // 窄距侧边栏
  outerLink?: boolean; // 是否开放主页外链
}

export interface User extends UserBase {
  sites?: Array<Site>;
}

export interface OuterLinkUser extends UserBase {
  sites: Array<Site | Folder>;
}

export interface Level {
  _id?: string;
  icon: string;
  name: string;
  sort: number;
}

export interface Folder {
  _id?: string;
  name: string;
  sort: number;
  levelId: string;
  type?: string;
  children?: Array<Site>; // 查询返回前端时，添加children
}

export interface Site extends Level {
  url: string;
  intro: string;
  background: string;
  levelId: string;
  iconType: string;
  folderId?: string;
  officialIcon?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface LevelSiteList {
  levels: Array<Level>;
  sites: Array<Site | Folder>;
}

export interface GetSiteInfo {
  description: string;
  title: string;
  icon?: string;
  background?: string;
}

export interface Bookmark {
  url: string;
  title: string;
}
