import { Schema, Document, model } from "mongoose";
import { FirstLevel, SecondLevel, Website } from "../interfaces/website.interface";

// 一级导航
const firstLevelSchema = new Schema(
  {
    icon: { required: true, type: String },
    name: { required: true, type: String, trim: true, index: true },
    sort: { required: true, type: Number, index: true },
    recommend: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
export const firstLevelModel = model<FirstLevel & Document>("FirstLevel", firstLevelSchema);

// 二级导航
const secondLevelSchema = new Schema(
  {
    icon: { required: true, type: String },
    name: { required: true, type: String, trim: true, index: true },
    sort: { required: true, type: Number, index: true },
    firstLevelId: { required: true, type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: true }
);
export const secondLevelModel = model<SecondLevel & Document>("SecondLevel", secondLevelSchema);

// 网站地址
const websiteSchema = new Schema(
  {
    name: { required: true, type: String, trim: true, unique: true },
    intro: { required: true, type: String, index: true },
    url: { required: true, type: String, index: true },
    background: { required: true, type: String, default: "#333" },
    icon: { type: String, default: "&#xe7d4" },
    sort: { type: Number, default: 1, index: true },
    firstLevelId: { type: Schema.Types.ObjectId, index: true },
    secondLevelId: { type: Schema.Types.ObjectId, index: true },
    recommendFirstLevelId: { type: String, index: true }, // 此id可为(string/ObjectId)。可能是空字符串""，故在此使用string
    recommendSecondLevelId: { type: String, index: true }, // 同上
  },
  { timestamps: true }
);
export const websiteModel = model<Website & Document>("Websiete", websiteSchema);
