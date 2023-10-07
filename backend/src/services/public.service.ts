import * as fs from "fs";
import * as path from "path";
import * as fse from "fs-extra";
import { promisify } from "util";
import axios from "axios";
import { ServiceReturn, UploadInfo } from "../interfaces/public.interface";
import { UploadLargeDto } from "../dtos/public.dto";
import { anyType } from "../interfaces/types";
import { fileExtension } from "../utils";

const unlink = promisify(fs.unlink).bind(fs);
const staticPath = path.join(`${path.join(__dirname)}/../../static`);
export default class PublicService {
  public async upload(originalname: string, url: string, size: number): ServiceReturn<UploadInfo> {
    return {
      code: 1,
      msg: "Upload success",
      data: { filename: originalname, url, size },
    };
  }

  public async uploadUrlImage(url: string): ServiceReturn<string> {
    const isBase64Reg = /^\s*data:(?:[a-z]+\/[a-z0-9-+.]+(?:;[a-z-]+=[a-z0-9-]+)?)?(?:;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;

    if (!isBase64Reg.test(url) && url.indexOf("http://") === -1 && url.indexOf("https://") === -1)
      return { code: 11, msg: "It's not image" };

    // 图片路径与名称
    const filePath = path.join(`${path.join(__dirname)}/../../static`) + "/upload/articles";
    const fileName = `article-${new Date().getTime()}`;

    // 处理base64格式图片
    if (isBase64Reg.test(url)) {
      //过滤data:URL
      const base64Data = url.replace(/^data:image\/\w+;base64,/, "");
      const dataBuffer = Buffer.from(base64Data, "base64"); // 这是另一种写法
      const fileSuffix = url.split("base64")[0]?.split("image/")[1]?.split(";")[0] || "jpg";
      const file = `${filePath}/${fileName}.${fileSuffix}`;
      await fse.outputFile(file, dataBuffer);

      return {
        code: 1,
        msg: "Upload url image success",
        data: `/upload/articles/${fileName}.${fileSuffix}`,
      };
    }

    // 处理http链接图片
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    let fileSuffix = fileExtension(url);
    const suffixArr = ["jpeg", "jpg", "png", "gif", "svg", "webp", "ico"];
    if (suffixArr.indexOf(fileSuffix) === -1) fileSuffix = "jpg";
    const file = `${filePath}/${fileName}.${fileSuffix}`;

    if (response && response.data) {
      const writer = fs.createWriteStream(file);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    return {
      code: 1,
      msg: "Upload url image success",
      data: `/upload/articles/${fileName}.${fileSuffix}`,
    };
  }

  public async uploadDelete(fileUrl: string): ServiceReturn<void> {
    await unlink(staticPath + fileUrl);
    return { code: 1, msg: "Delete success" };
  }

  /** @desc 待重新整理思路----重做 */
  public async uploadLarge(info: UploadLargeDto, filename: string): ServiceReturn<UploadLargeDto> {
    // 清除缓存----blog.zhoushuanglong.com程序作记录
    // router.delete("/upload/cleartemps", function (req, res) {
    //   const temps = fs.readdirSync(tempPath);
    //   temps.forEach(function (file) {
    //     fs.unlinkSync(tempPath + file);
    //   });
    //   res.json({ success: true });
    // });

    const { name, total, index, size, timestamp } = info;
    console.log(size);
    const tempFileList = {} as anyType;
    const tempPath = "./static/temp/";
    const uploadPath = "./static/upload/largefiles/";

    //重命名临时文件
    const tempFileName = timestamp + "-" + index;
    const beforeFile = tempPath + filename;
    const afterFile = tempPath + tempFileName;
    fs.rename(beforeFile, afterFile, function (err) {
      console.log(err);
    });

    //文件上传临时列表
    const fileRam = "ram" + timestamp;
    if (tempFileList[fileRam]) {
      tempFileList[fileRam].push(index);
    } else {
      tempFileList[fileRam] = [index];
    }

    //合并文件
    function mergeFile(): void {
      const num = 1,
        lastFile = uploadPath + name;
      (function contactFile(num): void {
        if (num <= total) {
          const tempFileName = tempPath + timestamp + "-" + num;
          fs.readFile(tempFileName, function (err, data) {
            if (err) console.log(err.message);
            fs.appendFile(lastFile, data, function (err) {
              if (err) console.log(err.message);
              console.log("success");
              fs.unlink(tempFileName, function (err) {
                console.log(err);
              });
              num++;
              contactFile(num);
            });
          });
        }
      })(num);
    }

    //检测分片文件是否完整
    function checkSlice(): void {
      const timer = setInterval(function () {
        let count = 0;
        for (let i = 1; i <= total; i++) {
          const checkFile = tempPath + timestamp + "-" + i;
          fs.exists(checkFile, function (exists) {
            if (exists) {
              count++;
              if (count == total) {
                console.log(count);
                clearInterval(timer);
                mergeFile();
              }
            } else {
              count = 0;
            }
          });
        }
      }, 1000);
    }

    //检测当前文件分片是否上传完毕
    if (tempFileList[fileRam].length == total) {
      checkSlice();
    }

    return {
      code: 1,
      msg: "Upload success",
      data: info,
    };
  }
}
