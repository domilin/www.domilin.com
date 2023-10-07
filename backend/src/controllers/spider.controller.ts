import { Request, Response } from "express";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import { websiteModel, secondLevelModel } from "../models/website.model";

export default class SpiderController {
  public monknow = async (req: Request, res: Response): Promise<void> => {
    const { cateId, secret, firstLevelId, secondLevelId } = req.query;
    const data = await axios({
      method: "get",
      url: `https://dynamic-api.monknow.com/icon/list`,
      headers: {
        secret,
      },
      params: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        cate_id: cateId,
        keyword: "",
        size: 300,
        lang: "zh-CN",
      },
    });
    const arrTemp = data.data.data.list;
    let hasErr = false;
    for (const val of arrTemp) {
      if (val.lang === "zh-CN" || cateId === "25") {
        const siteFound = await websiteModel.findOne({ name: val.title });

        if (!siteFound) {
          const response = await axios({
            method: "get",
            url: val.imgUrl,
            responseType: "stream",
          }).catch(function (err) {
            // console.log(err);
            hasErr = true;
          });

          const filePath = path.join(`${path.join(__dirname)}/../../static`) + "/upload/icons";
          const fileSuffix = val.mimeType.split("image/")[1];
          const fileName = `icon-${new Date().getTime()}`;
          const file = `${filePath}/${fileName}.${fileSuffix}`;

          if (response && response.data) {
            const writer = fs.createWriteStream(file);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
              writer.on("finish", resolve);
              writer.on("error", reject);
            });
          }

          const secondSites = await websiteModel.find({ secondLevelId });
          const siteHad = await websiteModel.findOne({ name: val.title });
          if (!siteHad) {
            await websiteModel.create({
              name: val.title,
              intro: val.description,
              icon: !hasErr ? `/upload/icons/${fileName}.${fileSuffix}` : "null",
              background: val.bgColor,
              url: val.url,
              sort: secondSites.length,
              firstLevelId,
              secondLevelId,
            });
          }
        }
      }
    }
    res.json({ code: 1, msg: "Get success", data: data.data.data.list });
  };

  public xiaodai = async (req: Request, res: Response): Promise<void> => {
    const { type, firstLevelId } = req.query;
    const data = await axios({
      method: "get",
      url: `https://www.webjike.com/${type}.html`,
    });

    const $ = cheerio.load(data.data);
    const $ele = $(".duty-item");
    $ele.map(async function (index, item) {
      const title = $(item).find(".duty-item-name").text();
      const secondFound = await secondLevelModel.findOne({ name: title });

      if (!secondFound) {
        // const secondLevels = await secondLevelModel.find({ firstLevelId: firstLevelId });
        const secondLevel = await secondLevelModel.create({
          name: title,
          icon: "&#xe6cd;",
          sort: index,
          firstLevelId,
        });

        const $siteList = $(item).find(".duty-card");
        $siteList.map(async function (indexIn, itemIn) {
          const $icon = $(itemIn);

          const imgUrl = $icon.find("img").attr("data-original");
          let hasErr = false;
          const response = await axios({
            method: "get",
            url: `https://www.webjike.com/${imgUrl}`,
            responseType: "stream",
          }).catch(function (err) {
            // console.log(err);
            hasErr = true;
          });

          const filePath = path.join(`${path.join(__dirname)}/../../static`) + "/upload/icons";
          const fileName = `icon-${new Date().getTime()}`;
          const fileSuffix = imgUrl.split(".")[1];
          const file = `${filePath}/${fileName}.${fileSuffix}`;

          if (response && response.data) {
            const writer = fs.createWriteStream(file);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
              writer.on("finish", resolve);
              writer.on("error", reject);
            });
          }

          const secondSites = await websiteModel.find({ secondLevelId: secondLevel._id });
          const siteHad = await websiteModel.findOne({ name: $icon.find(".duty-card-tit").text() });
          if (!siteHad && $icon.attr("href")) {
            await websiteModel.create({
              name: $icon.find(".duty-card-tit").text(),
              intro: $icon.find(".duty-card-des").text(),
              icon: !hasErr ? `/upload/icons/${fileName}.${fileSuffix}` : "null",
              background: "transparent",
              url: $icon.attr("href"),
              sort: secondSites.length,
              secondLevelId: secondLevel._id,
              firstLevelId,
            });
          }
        });
      }
    });

    res.json({ code: 1, msg: "Get success" });
  };
}
