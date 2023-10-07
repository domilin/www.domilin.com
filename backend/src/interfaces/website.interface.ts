interface BasicWebsite {
  _id: string;
  icon: string;
  name: string;
  sort: number;
}

// 一级导航
export interface FirstLevel extends BasicWebsite {
  recommend?: boolean;
}
export interface FirstLevelList {
  [key: number]: FirstLevel;
}

// 二级导航
export interface SecondLevel extends BasicWebsite {
  firstLevelId: string;
}
export interface SecondLevelList {
  [key: number]: SecondLevel;
}

// 网站地址
export interface Website extends SecondLevel {
  intro: string;
  url: string;
  background: string;
  secondLevelId: string;
  recommendFirstLevelId?: string;
  recommendSecondLevelId?: string;
}
export interface WebsiteList {
  [key: number]: Website;
}
