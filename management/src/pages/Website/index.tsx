import React, { useState, useCallback } from "react";
import { useMount } from "@umijs/hooks/lib";
import { useDispatch } from "react-redux";
import { Divider, message } from "antd/lib";
import "./index.scss";
import FirstLevel from "./FirstLevel";
import SecondLevel from "./SecondLevel";
import Website from "./Website";
import { RootDispatch } from "../../models/store";
import {
  CurrentLevel,
  FirstLevelPostParams,
  SecondLevelPostParams,
  WebsitePostParams,
  WebsiteGetParams
} from "../../models/website";
import { AjaxRes } from "../../public";

export default function Count(): JSX.Element {
  const dispatch: RootDispatch = useDispatch();
  const [curLevel, setCurLevel] = useState<CurrentLevel>({
    firstLevel: undefined,
    secondLevel: undefined
  });

  const getFirstLevelList = useCallback(async (): Promise<AjaxRes<FirstLevelPostParams[]> | undefined> => {
    const res = await dispatch.website.firstLevelGet();
    if (!res) {
      message.info("获取一级导航错误");
      return;
    }
    if (res.code !== 1) {
      message.info(res.msg);
      return;
    }
    return res;
  }, [dispatch]);

  const getSecondLevelList = useCallback(
    async (firstLevelId: string): Promise<AjaxRes<SecondLevelPostParams[]> | undefined> => {
      const res = await dispatch.website.secondLevelGet(firstLevelId);
      if (!res) {
        message.info("获取二级导航错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
      dispatch.website.secondLevelData(res.data);
      return res;
    },
    [dispatch]
  );

  const getWebsiteList = useCallback(
    async (params: WebsiteGetParams): Promise<AjaxRes<WebsitePostParams[]> | undefined> => {
      const res = await dispatch.website.websiteGet(params);
      if (!res) {
        message.info("获取网站地址错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
      return res;
    },
    [dispatch]
  );

  // 获取默认数据
  const getDefaultData = useCallback(
    async function(params?: CurrentLevel): Promise<void> {
      // 获取一级导航当前id
      let curFirstLevelId = null;
      let curRecommend = true;
      if (params && "recommend" in params) curRecommend = params.recommend || false;
      if (params && params.firstLevel) {
        curFirstLevelId = params.firstLevel;
      } else {
        const firstLevelList = await getFirstLevelList();
        if (!firstLevelList || (firstLevelList as AjaxRes<FirstLevelPostParams[]>).data.length === 0) return;
        curFirstLevelId = firstLevelList.data[0]._id;
      }
      setCurLevel({ ...curLevel, firstLevel: curFirstLevelId, recommend: curRecommend });

      // 获取二级导航当前id
      let curSecondLevelId = null;
      if (params && params.secondLevel) {
        curSecondLevelId = params.secondLevel;
      } else {
        const secondLevelList = await getSecondLevelList(curFirstLevelId);
        if (!secondLevelList || (secondLevelList as AjaxRes<SecondLevelPostParams[]>).data.length === 0) {
          dispatch.website.websiteData([]);
          return;
        }
        curSecondLevelId = secondLevelList.data[0]._id;
      }
      setCurLevel({ ...curLevel, firstLevel: curFirstLevelId, secondLevel: curSecondLevelId, recommend: curRecommend });

      // 获取网站地址当前id
      await getWebsiteList({ secondLevelId: curSecondLevelId, recommend: curRecommend });
    },
    [getSecondLevelList, getFirstLevelList, getWebsiteList, curLevel, dispatch]
  );
  useMount(() => {
    getDefaultData();
  });
  return (
    <div className="page-website">
      <Divider orientation="left">一级导航</Divider>
      <FirstLevel {...{ curLevel, getDefaultData, getFirstLevelList }} />
      <Divider orientation="left">二级导航</Divider>
      <SecondLevel {...{ curLevel, getDefaultData, getSecondLevelList }} />
      <Divider orientation="left">网址列表</Divider>
      <Website {...{ curLevel, getWebsiteList }} />
    </div>
  );
}
