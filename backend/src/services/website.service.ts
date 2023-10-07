import { ServiceReturn } from "../interfaces/public.interface";
import { FirstLevelList, SecondLevelList, Website } from "../interfaces/website.interface";
import { firstLevelModel, secondLevelModel, websiteModel } from "../models/website.model";
import { WebsiteGetDto } from "../dtos/website.dto";
import { paginationFind, PaginationReturn } from "../utils/index";
import { anyType } from "../interfaces/types";
import { RECOMMENDFIRSTLEVELID } from "../config";

export default class WebsiteService {
  public async firstLevelGet(): ServiceReturn<FirstLevelList> {
    const data: FirstLevelList = await firstLevelModel
      .find({ recommend: false, _id: { $ne: RECOMMENDFIRSTLEVELID } })
      .sort({ sort: 1 });
    return { code: 1, msg: "FirstLevel get success", data };
  }

  public async secondLevelGet(firstLevelId: string): ServiceReturn<SecondLevelList> {
    const data: SecondLevelList = await secondLevelModel.find({ firstLevelId }).sort({ sort: 1 });
    return { code: 1, msg: "SecondLevel get success", data };
  }

  public async websiteGet({
    currentPage,
    pageSize,
    firstLevelId,
    secondLevelId,
    recommend,
    keywords,
  }: WebsiteGetDto): ServiceReturn<PaginationReturn<Website>> {
    let filter: anyType = {};
    if (keywords || keywords === "") {
      filter = {
        firstLevelId: { $ne: RECOMMENDFIRSTLEVELID },
        $or: [{ name: { $regex: keywords, $options: "$i" } }],
      };
    }

    if (recommend === "true") {
      if (firstLevelId) {
        filter = { recommendFirstLevelId: firstLevelId };
      }
      if (secondLevelId) {
        filter = { recommendSecondLevelId: firstLevelId };
      }
    } else {
      if (firstLevelId) {
        filter = { firstLevelId };
      }

      if (secondLevelId) {
        filter = { secondLevelId };
      }
    }

    const data = await paginationFind<Website>({
      model: websiteModel,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
      sort: { sort: 1 },
      filter: filter,
    });
    return { code: 1, msg: "Website get success", data };
  }
}
