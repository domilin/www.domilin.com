import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { isEqual } from "lodash/ts3.1";
import JsEncrypt from "jsencrypt";
import Cookies from "js-cookie";
import { match } from "react-router";
import { RouteConfig } from "react-router-config";
import { matchPath } from "react-router-dom";
import routesConfig from "../routes";
import { auth } from "./apis";
import { BaseType, BaseJson, anyType } from "./types/public";

/** @desc 延迟执行 */
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/** @desc 获取文件扩展名 */
export const fileExtension = (fileUrl: string): string => {
  const singfileArray = fileUrl.split(".");
  return singfileArray[singfileArray.length - 1];
};

/** @desc 根据当前路由，匹配路由配置，获取参数等 */
type Match = match | null;
export const urlMatch = (url: string): Match => {
  let curRoute: Match = null;
  const hasKey = (arr: RouteConfig[]): void => {
    for (const val of arr) {
      if (val.path) {
        const params: RouteConfig = { path: val.path };
        params.path = val.path;
        if (val.exact) params.exact = val.exact;
        if (val.strict) params.strict = val.strict;
        curRoute = matchPath(url, params);
      }

      const isObj = Object.prototype.toString.call(curRoute) === "[object Object]";
      if (isObj) return;
      if (val.routes && !isObj) {
        hasKey(val.routes);
      }
    }
  };
  hasKey(routesConfig);
  return curRoute;
};

/**
 * @desc 密码加密
 * @returns {string}
 * @Params {password}
 * @method encodePassword(password)
 */
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgGi3THYuRs9WzylwCj1LjufHOUfl
5aXI3Gf76GNGDe+9IOvVrtjjBnpFtnEekToRcA9WqH9YY5lgD4lD9zxaTvVtyGBH
APfIshIKqAiB5PK2Z8oM8mGYPF0y03JNIwhLXpC0+AT6UDXZ+pUAnlX2C/VEIPof
iJRFUuWTfVfVIDcdAgMBAAE=
-----END PUBLIC KEY-----`;
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
export const encodePassword = (password: string): string => {
  const encrypt = new JsEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(
    JSON.stringify({
      password: password.toString(),
      nonce: randomNumber(0, 1000000).toString(),
      timestamp: (new Date().getTime() / 1000).toString()
    })
  );
};

/** @desc 基于axios，根据业务需要与使用习惯封装ajax请求 */
const createLoading = (noLoading?: boolean): void => {
  let ajaxLoadingStr = `<div className="ajax-loading"><div className="component-loading"><div className="sk-spinner sk-spinner-pulse"></div></div></div>`;
  if (noLoading) ajaxLoadingStr = '<div id="ajaxLoading"></div>';
  if (!document.getElementById("ajaxLoading")) document.body.insertAdjacentHTML("beforeend", ajaxLoadingStr);
};
const removeLoading = (): void => {
  if (document.getElementById("ajaxLoading")) {
    const $ajaxLoading = document.getElementById("ajaxLoading") as HTMLElement;
    const $parent = $ajaxLoading.parentNode as Node;
    $parent.removeChild($ajaxLoading);
  }
};
type AjaxReqType = "get" | "post" | "put" | "delete";
export interface AjaxReq<P> {
  type: AjaxReqType;
  url: string;
  baseUrl?: string;
  params?: P;
  contentType?: string;
  formData?: boolean;
  noLoading?: boolean;
  noLog?: number[];
  userDefined?: BaseJson;
}
export interface AjaxRes<T> {
  code: number;
  msg: string;
  data: T;
}
export function ajax<P extends { [K in keyof P]: BaseType } = {}>({
  type,
  url,
  params,
  formData,
  contentType,
  userDefined,
  noLog,
  noLoading
}: AjaxReq<P>): Promise<AxiosResponse["data"]> {
  createLoading(noLoading);
  const config: AxiosRequestConfig = {
    url: url
  };
  if (type === "post" || type === "put" || type === "delete") {
    config.data = params;
  } else if (type === "get") {
    config.params = params;
  }
  config.method = type;

  // 文件上传时使用formData数据
  if ((type === "post" || type === "put" || type === "delete") && formData) {
    const data = new FormData();
    for (const key in params) {
      data.append(key, params[key] as string);
    }
    config.data = data;
  }

  // 设置请求头headers的contentType
  if (contentType) {
    config.headers = {
      "Content-Type": contentType
    };
  }

  // 用户自定义请求头参数
  if (userDefined) {
    config.headers = Object.assign(config.headers ? config.headers : {}, userDefined);
  }

  return new Promise(function(resolve, reject) {
    // 如果cookie不存在Authorization表明未登录，并且不是登录接口，不继续执行请求接口
    if (!Cookies.get("Authorization") && url !== auth.signin) return;

    axios(config)
      .then(function(res) {
        // 自定义是否上报日志,返回的code包含在数组中，或者为空数组时。不需要上报日志
        let noLogTrue = false;
        if (noLog && Array.isArray(noLog)) {
          if (noLog.length === 0) {
            noLogTrue = true;
          } else {
            for (const val of noLog) {
              if (res.data && res.data.code && res.data.code === val) {
                noLogTrue = true;
                break;
              }
            }
          }
        }

        if (res.data && res.data.code && res.data.code !== 1 && !noLogTrue) {
          const resCode = res.data.code;
          const resMsg = res.data.msg ? res.data.msg : "api code is not 1";
          if (resCode === -1) {
            // 登录失效时弹出登录框
            window.reduxStore.dispatch.common.signinShow(true);
            return;
          }
          if (url.indexOf("/logger") === -1) {
            logReport({
              level: "error",
              message: "client-api-msg",
              httpCode: 200,
              url: url,
              params: isJson(params as BaseJson) ? JSON.stringify(params) : params,
              resCode: resCode,
              resMsg: resMsg,
              framework: true
            });
          }
        }

        if (res.data) {
          resolve(res.data);
        } else {
          resolve({
            code: 0,
            msg: "response has no data property"
          });
        }
        removeLoading();
      })
      .catch(function(err) {
        const logParams = {
          level: "error",
          message: "client-api-msg",
          url: url,
          params: isJson(params as BaseJson) ? JSON.stringify(params) : params
        };
        if (err.response) {
          // 请求已发出，但服务器响应的状态码不在 2xx 范围内
          logReport({
            ...logParams,
            httpCode: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
            errConfig: err.config,
            framework: true
          } as LogReportParams);
        } else {
          // Something happened in setting up the request that triggered an Error
          logReport({
            ...logParams,
            httpCode: 500,
            errMsg: err.message,
            errConfig: err.config,
            framework: true
          } as LogReportParams);
        }
        removeLoading();
        reject(err);
      });
  });
}

/** @desc
 * 前端日志上报到node服务: 框架自动打印的params中会有framework:true参数(ajax)，会自动上传localstorage和sessionstorage
 */
interface LogReportParams {
  message: string;
  level?: "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";
  framework?: boolean;
  [key: string]: anyType;
}
let logArr: Array<LogReportParams> = [];
let logPreTime = Date.parse(new Date().toDateString()); // 1秒内logArr中不存在的errObj才上报。同一页面同一信息1秒内不再上报
export const logReport = (params: LogReportParams): void => {
  const logAjax = (): void => {
    const logObj = {} as {
      localStorage: string;
      sessionStorage: string;
    };
    // localStorage转为string类型防止log格式过乱
    if (window.localStorage && params.framework) {
      const localTmp = {} as BaseJson;
      for (const key of Object.keys(window.localStorage)) {
        if (key.indexOf("Hm_lvt_") === -1 && key.indexOf("Hm_lpvt_") === -1 && key.indexOf("m_unsent_") === -1) {
          // 在此排除不需要的信息
          localTmp[key] = localStorage.getItem(key);
        }
      }
      logObj.localStorage = JSON.stringify(localTmp);
    }

    // sessionStorage转为string类型防止log格式过乱
    if (window.sessionStorage && params.framework) {
      const localTmp = {} as BaseJson;
      for (const key of Object.keys(window.sessionStorage)) {
        if (key.indexOf("Hm_lvt_") === -1 && key.indexOf("Hm_lpvt_") === -1 && key.indexOf("m_unsent_") === -1) {
          // 在此排除不需要的信息
          localTmp[key] = sessionStorage.getItem(key);
        }
      }
      logObj.sessionStorage = JSON.stringify(localTmp);
    }

    const paramsObj = { ...params, ...logObj } as LogReportParams;
    if (
      // logger自身报错不上报
      (paramsObj.url && paramsObj.url.indexOf("/logger") === -1) ||
      !paramsObj.url
    ) {
      ajax({
        type: "post",
        url: "/logger",
        noLoading: true,
        params: paramsObj
      });
    }
  };

  const logCurTime = Date.parse(new Date().toDateString());
  if (logCurTime - logPreTime >= 1000 && logArr.length !== 0) {
    logArr = [];
    logArr.push(params);
    logPreTime = logCurTime;
    logAjax();
  } else {
    const hasParams = (): boolean => {
      for (const val of logArr) {
        if (isEqual(val, params)) {
          return true;
        }
      }
      return false;
    };
    if (logArr.length !== 0 && hasParams()) return;
    logArr.push(params);
    logAjax();
  }
};

/**
 * @desc 判断Json字符串是否为正确的Json格式
 */
export const isJson = (obj: string | BaseJson): boolean => {
  if (typeof obj === "string") {
    try {
      const objFormat = JSON.parse(obj);
      return typeof objFormat === "object" && objFormat;
    } catch (e) {
      return false;
    }
  } else {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
};

/**
 * @desc 数组根据数组对象中的某个属性值进行排序的方法
 * @param {filed, rev, primer} 排序的属性-如number属性, rev: true表示升序排列false降序排序
 * @method myArray.sort(sortBy('number', false, parseFloat)) 表示根据number属性降序排列
 * */
export const sortBy = (
  filed: string,
  rev?: boolean,
  primer?: (string: string) => number
): ((a: BaseJson, b: BaseJson) => number) => {
  const revTemp = rev ? 1 : -1;
  return function(a: BaseJson, b: BaseJson): number {
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
 * @desc 判断是否是正确的网址
 * @returns {Boolean}
 * @Params {phoneNumber}
 * @method isUrl()
 */
export const isUrl = (url: string): boolean => {
  const strRegex = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return RegExp(strRegex).test(url);
};
