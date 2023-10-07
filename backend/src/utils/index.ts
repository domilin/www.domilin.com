import * as crypto from "crypto";
import * as http from "http";
import { anyType, BaseJson } from "../interfaces/types";
import logger from "./logger";

export const isEmptyObject = (obj: object): boolean => {
  return !Object.keys(obj).length;
};

/** @desc 获取文件扩展名 */
export const fileExtension = (fileUrl: string): string => {
  const singfileArray = fileUrl.split(".");
  return singfileArray[singfileArray.length - 1];
};

/**
 * @desc 判断是否是正确的网址
 * @returns {Boolean}
 * @Params {phoneNumber}
 * @method isUrl()
 */
export const isUrl = (url: string): boolean => {
  const strRegex = "^((https|http|ftp|rtsp|mms)?://)[^s]+";
  return RegExp(strRegex).test(url);
};

/**
 * @desc 字符串长度
 * @params {text}
 * @method textLength(text)
 * */
export const textLength = (text: string): number => text.replace(/[^\x00-\xff]/g, "aa").length;

/** @desc 分页查询 */
export interface PaginationParams {
  currentPage: number;
  pageSize: number;
  model: anyType;
  sort?: { [key: string]: -1 | 1 };
  filter?: anyType;
  projection?: anyType;
}
export interface PaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPage: number;
  totalSize: number;
  list: T[];
}
export async function paginationFind<T>({
  model,
  currentPage = 1,
  pageSize = 1,
  sort,
  filter,
  projection,
}: PaginationParams): Promise<PaginationReturn<T>> {
  const skip = (currentPage - 1) * pageSize;
  const totalSize = await model.countDocuments(filter);
  const totalPage = totalSize < pageSize ? 1 : Math.ceil(totalSize / pageSize);
  const listReturn = await model.find(filter, projection).skip(skip).limit(pageSize).sort(sort);

  return {
    currentPage,
    pageSize,
    totalPage,
    totalSize,
    list: listReturn || [],
  } as PaginationReturn<T>;
}

/** @desc 密码-----前端加密方法 */
// const publicKey = `-----BEGIN PUBLIC KEY-----
// MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgGi3THYuRs9WzylwCj1LjufHOUfl
// 5aXI3Gf76GNGDe+9IOvVrtjjBnpFtnEekToRcA9WqH9YY5lgD4lD9zxaTvVtyGBH
// APfIshIKqAiB5PK2Z8oM8mGYPF0y03JNIwhLXpC0+AT6UDXZ+pUAnlX2C/VEIPof
// iJRFUuWTfVfVIDcdAgMBAAE=
// -----END PUBLIC KEY-----`
// const randomNumber = (min, max) => {
//     return Math.floor(Math.random() * (max - min + 1) + min)
// }
// export const encodePassword = (password) => {
//     const encrypt = new JsEncrypt()
//     encrypt.setPublicKey(publicKey)
//     return encrypt.encrypt(JSON.stringify({
//         password: password.toString(),
//         nonce: randomNumber(0, 1000000).toString(),
//         timestamp: (Date.parse(new Date()) / 1000).toString()
//     }))
// }
/** @desc 密码-----后端解密方法,在PasswordRules校验前先解密为原始密码 */
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgGi3THYuRs9WzylwCj1LjufHOUfl5aXI3Gf76GNGDe+9IOvVrtjj
BnpFtnEekToRcA9WqH9YY5lgD4lD9zxaTvVtyGBHAPfIshIKqAiB5PK2Z8oM8mGY
PF0y03JNIwhLXpC0+AT6UDXZ+pUAnlX2C/VEIPofiJRFUuWTfVfVIDcdAgMBAAEC
gYAmB5O8Q9gxiqxXtznwwtUWdfLmmqaJS+ZH2WOvUgzTqVMgcw059VEv7MtyT5Cc
jyKsX2N4RCh/1jQuPMG4aG/OGU+0Tt5o+UhgcvBsfbfnjKbcdu7cXHunAuqux4AU
jg+pyf99/aqQ2ki0bgKpCF2eG1jgFwSUmx36Z0mQ0IC/QQJBAKuQ/zdm35GaQrEM
0YdhfnmdEaCaHU9Yki3hS5TxPHRAVQnIf4Li8KWBIvMfG4Nge2iAzlSkzYUmNhNV
86+7F+0CQQCcQBLvXqNQLABncJAs4P6rh5pG225hIiOvNtzmb3g+i0RJq4lTfw4P
tHSHle72jRMsFGIh2raWgAbr2j/HoVXxAkA0mmqGFBasT/3uxx1fQvdCVnRXJ6mg
8GkxhAhmjGiaxDbOnxjpiqd6N1P98yW+bFCqRAP/U+Bn2MVvvETRNq4pAkBYXvzW
mUXwsBJCbq18VHx08yrUbILPOQnJrVPemKj/ZrDmobf3m2KOi1dk3+3ZUAzJ33Vp
BFREZoCDoFp2Q89hAkEApDgWLAq9qqNMA7Vl9CNJci8biPRLXEOrTEKmABvqX/6e
ZAcEOwjt8klrRZo+VeeZkfOhxxtpnyE5JX8xrydxLg==
-----END RSA PRIVATE KEY-----`;
export const decodePassword = (password: string): string => {
  try {
    const psd = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(password, "base64")
    );
    return JSON.parse(psd.toString("utf-8")).password;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * @desc 数组根据数组对象中的某个属性值进行排序的方法
 * @param {filed, rev, primer} 排序的属性-如number属性, rev: true表示升序排列false降序排序
 * @method myArray.sort(sortBy('number', false, parseFloat)) 表示根据number属性降序排列
 * */
export const sortBy = (
  filed: string,
  rev?: number,
  primer?: (string: string) => number
): ((a: BaseJson, b: BaseJson) => number) => {
  const revTemp = rev ? 1 : -1;
  return function (a: BaseJson, b: BaseJson): number {
    let aVal = a[filed];
    let bVal = b[filed];
    if (typeof primer !== "undefined") {
      aVal = primer(aVal);
      bVal = primer(bVal);
    }
    if (aVal < bVal) {
      return revTemp * -1;
    }
    if (aVal > bVal) {
      return revTemp * 1;
    }
    return 1;
  };
};

/**
 * @desc 获取两个数组不同的元素
 * filter处理数组
   indexOf首次出现位置
   lastIndexOf最后出现位置
   如果存在相同元素--->首尾返回位置不同（返回false）
   如果只有一个元素--->首尾位置为同一位置（返回true）
 * @param {arr1, arr2}
 * @method arrDifferent(arr1, arr2)
 * */
export const arrDifferent = (arr1: anyType[], arr2: anyType): anyType[] =>
  arr1
    .concat(arr2)
    .filter(
      (currentValue, index, arr) => arr.indexOf(currentValue) === arr.lastIndexOf(currentValue)
    );

/**
 * @desc 获取两个数组相同的元素
 * @param {arr1, arr2}
 * @method arrEqual(arr1, arr2)
 * */
export const arrEqual = (arr1: anyType[], arr2: anyType): anyType[] => {
  const newArr = [];
  for (let i = 0; i < arr2.length; i++) {
    for (let j = 0; j < arr1.length; j++) {
      if (arr1[j] === arr2[i]) {
        newArr.push(arr1[j]);
      }
    }
  }
  return newArr;
};

/**
 * @desc 百度seo主动提交url
 * @param {opts}
 * @method pushUrlToBaiduSeo(opts)
 * */
export const pushUrlToBaiduSeo = (opts: { urlList: string[] }): void => {
  const { urlList } = opts;
  if (!urlList || !Array.isArray(urlList)) return;

  const content = opts.urlList.join("\n");
  const params = {
    host: "data.zz.baidu.com",
    path: "/urls?site=https://www.domilin.com&token=T7iFZIEvcLAmuQ2MHTTP/1.1",
    method: "post",
    "User-Agent": "curl/7.12.1",
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": content.length,
    },
  };
  const httpReq = http.request(params, function (res) {
    res.setEncoding("utf8");
    res.on("data", function (data) {
      console.log("data:", data);
      logger.info(`data.zz.baidu.com: ${JSON.stringify(data)}`);
    });
  });
  httpReq.write(content);
  httpReq.end();
};

/**
 * @desc 获取设置时，返回的字段
 * */
export const settingReturnParams = {
  email: 1,
  nickName: 1,
  avatar: 1,
  engine: 1,
  theme: 1,
  themeFollowSys: 1,
  wallpaperType: 1,
  wallpaper: 1,
  wallpaperBlur: 1,
  iconType: 1,
  sidebar: 1,
  sidebarAuto: 1,
  sidebarNarrow: 1,
  outerLink: 1,
  outerLinkName: 1,
  lastWatchLevel: 1,
  wallpaperBing: 1,
  layoutScrollSearchLevelFixed: 1,
  layoutContentWidth: 1,
  layoutRowSpacing: 1,
  layoutCloumnSpacing: 1,
  layoutNavBtnShow: 1,
  layoutNavDotsShow: 1,
  layoutPageAnimateSpeed: 1,
  layoutPageAnimateEffect: 1,
  layoutPageSwitchMouse: 1,
  layoutPageSwitchKeyboard: 1,
  searchSize: 1,
  searchRadius: 1,
  searchWidth: 40,
  searchOpacity: 1,
  searchShow: 1,
  searchShadow: 1,
  searchOpenWay: 1,
  levelShow: 1,
  levelAddShow: 1,
  levelIconShow: 1,
  levelTextShow: 1,
  levelSize: 1,
  levelRadius: 1,
  levelOpacity: 1,
  levelShadow: 1,
  iconAddShow: 1,
  iconRadius: 1,
  iconSize: 1,
  iconShadow: 1,
  iconOpacity: 1,
  iconOpenWay: 1,
  standbyOpen: 1,
  standbyNewShow: 1,
  standbyFreeShow: 1,
  standbyBgBlur: 1,
  standbyTime: 1,
  standbyTimeLunar: 1,
  standbyTime24: 1,
  standbyWeather: 1,
  standbyWeatherCity: 1,
};
