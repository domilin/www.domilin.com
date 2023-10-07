import { Schema, Document, model } from "mongoose";
import { Poster, Setting, Font } from "../interfaces/poster.interface";

const settingSchema = new Schema(
  {
    value: { type: String },
    posterId: { required: true, type: String },
    title: { required: true, type: String },
    left: { type: Number },
    top: { type: Number },
    textAlign: { type: String },
    fontFamily: { id: Schema.Types.ObjectId, name: String, value: String },
    fontSize: { type: Number },
    fontColor: { type: String },
  },
  { timestamps: true }
);
export const SettingModel = model<Setting & Document>("PosterSetting", settingSchema);

const posterSchema = new Schema(
  {
    name: { required: true, type: String },
    url: { required: true, type: String },
  },
  { timestamps: true }
);
export const PosterModel = model<Poster & Document>("Poster", posterSchema);

const fontSchema = new Schema(
  {
    name: { required: true, type: String },
    url: { required: true, type: String },
  },
  { timestamps: true }
);
export const FontModel = model<Font & Document>("Font", fontSchema);
