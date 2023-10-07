import { Schema, Document, model } from "mongoose";
import {
  Article,
  Tag,
  TagMap,
  Channel,
  Album,
  AlbumArticle,
} from "../interfaces/article.interface";

// 标签
const tagSchema = new Schema({
  name: { required: true, type: String },
  num: { required: true, type: Number, index: true, default: 0 },
});
export const tagModel = model<Tag & Document>("Tag", tagSchema);

const tagMapSchema = new Schema({
  tagId: { required: true, type: Schema.Types.ObjectId, index: true },
  articleId: { required: true, type: Schema.Types.ObjectId, index: true },
});
export const tagMapModel = model<TagMap & Document>("TagMap", tagMapSchema);

// 评论
const commentSchema = new Schema(
  {
    content: { required: true, type: String },
    user: {
      id: { required: true, type: Schema.Types.ObjectId },
      name: { required: true, type: String },
      avatar: { required: true, type: String },
    },
    quote: {
      content: String,
      user: {
        id: Schema.Types.ObjectId,
        name: String,
        avatar: String,
      },
    },
  },
  { timestamps: true }
);

// 文章
const articleSchema = new Schema(
  {
    title: { required: true, type: String, unique: true },
    content: { required: true, type: String },
    userId: { required: true, type: Schema.Types.ObjectId },
    channelId: { required: true, type: Schema.Types.ObjectId },
    intro: { required: true, type: String },
    audit: { required: true, type: Boolean, default: false },
    delete: { required: true, type: Boolean, default: false },
    tags: [tagSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const articleModel = model<Article & Document>("Article", articleSchema);

// 文章频道
const channelSchema = new Schema(
  {
    name: { required: true, type: String },
    sort: { required: true, type: Number },
    delete: { required: true, type: Boolean, default: false },
  },
  { timestamps: true }
);

export const channelModel = model<Channel & Document>("Channel", channelSchema);

// 文章专辑
const albumSchema = new Schema(
  {
    title: { required: true, type: String },
    sort: { required: true, type: Number },
  },
  { timestamps: true }
);

export const albumModel = model<Album & Document>("Album", albumSchema);

// 文章专辑下--->的文章
const albumArticleSchema = new Schema(
  {
    articleId: { required: true, type: Schema.Types.ObjectId },
    articleTitle: { required: true, type: String },
    albumId: { required: true, type: Schema.Types.ObjectId },
    sort: { required: true, type: Number },
  },
  { timestamps: true }
);

export const albumArticleModel = model<AlbumArticle & Document>("AlbumArticle", albumArticleSchema);
