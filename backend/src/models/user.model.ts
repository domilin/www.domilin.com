import * as bcrypt from "bcrypt";
import { Schema, Document, Error, model } from "mongoose";
import { User, ComparePasswordFunction } from "../interfaces/user.interface";

// 我的网址分类
const levelSchema = new Schema(
  {
    name: { required: true, type: String, index: true },
    sort: { required: true, type: Number },
    icon: { required: true, type: String },
  },
  { timestamps: true }
);

// 我的网址文件夹
const folderSchema = new Schema(
  {
    levelId: { required: true, type: Schema.Types.ObjectId },
    name: { required: true, type: String, index: true },
    sort: { required: true, type: Number },
    type: { required: true, type: String, default: "folder" },
  },
  { timestamps: true }
);

// 我的网址
const siteSchema = new Schema(
  {
    // 公共
    levelId: { required: true, type: Schema.Types.ObjectId },
    folderId: { type: Schema.Types.ObjectId },
    name: { required: true, type: String, index: true },
    sort: { required: true, type: Number },
    // 图标
    icon: { type: String }, // 图标地址、文字、 ‘official’--->则去取officialIcon字段
    iconType: { type: String }, // 'official', 'character', 'image'
    officialIcon: { type: String },
    intro: { type: String },
    url: { type: String },
    background: { type: String },
  },
  { timestamps: true }
);

// 我的用户信息
const userSchema = new Schema(
  {
    userName: { required: true, type: String, trim: true, unique: true },
    password: { required: true, type: String, trim: true, index: true },
    email: { type: String, trim: true },
    levels: [levelSchema],
    folders: [folderSchema],
    sites: [siteSchema],
    nickName: { type: String }, // 昵称
    avatar: { type: String }, // 头像
    engine: { type: String, default: "baidu" }, // 搜索引擎
    theme: { type: String, default: "night" }, // 主题: night, light
    themeFollowSys: { type: Boolean, default: true }, // 主题跟随系统
    wallpaperType: { type: String, default: "official" }, // official官方，color纯色，custom自定义
    wallpaper: { type: String }, // 壁纸地址或颜色值
    wallpaperBlur: { type: Boolean, default: false }, // 壁纸模糊--Number类型  ？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
    iconType: { type: String, default: "efficient" }, // 网站图标类型: efficient高效，light轻巧，classic经典
    sidebar: { type: String, default: "left" }, // 侧边栏位置: left, right
    sidebarAuto: { type: Boolean, default: false }, // 侧边栏自动隐藏
    sidebarNarrow: { type: Boolean, default: false }, // 窄距侧边栏
    outerLink: { type: Boolean, default: false }, // 是否开放主页外链
    /* ----------- */
    outerLinkName: { type: String }, // 外链自定义名称
    lastWatchLevel: { type: Boolean, default: true }, // 最后访问的分类
    /* -----bing壁纸------ */
    wallpaperBing: { type: Boolean, default: false }, // 必应壁纸
    /* -----布局------ */
    layoutScrollSearchLevelFixed: { type: Boolean, default: true }, // 滚定时搜索与分类固定到顶部
    layoutContentWidth: { type: Number, default: 25 }, // 显示宽度(内容宽度)
    layoutRowSpacing: { type: Number, default: 20 }, // 行间距
    layoutCloumnSpacing: { type: Number, default: 20 }, // 列间距
    layoutNavBtnShow: { type: Boolean, default: true }, // 显示分页按钮
    layoutNavDotsShow: { type: Boolean, default: true }, // 显示分页器
    layoutPageAnimateSpeed: { type: Number, default: 0.3 }, // 分页切换动画速度
    layoutPageAnimateEffect: { type: String, default: "slide" }, // 分页切换效果
    layoutPageSwitchMouse: { type: Boolean, default: true }, // 支持鼠标切换
    layoutPageSwitchKeyboard: { type: Boolean, default: true }, // 支持键盘切换
    /* -----分类------ */
    levelShow: { type: Boolean, default: true }, // 显示分类
    levelAddShow: { type: Boolean, default: true }, // 显示添加分类按钮
    levelIconShow: { type: Boolean, default: true }, // 分类显示图标
    levelTextShow: { type: Boolean, default: true }, // 分类显示文字
    levelSize: { type: Number, default: 36 }, // 分类大小
    levelRadius: { type: Number, default: 12 }, // 分类圆角
    levelOpacity: { type: Number, default: 1 }, // 分类不透明度
    levelShadow: { type: Boolean, default: true }, // 分类阴影
    /* -----搜索框------ */
    searchSize: { type: Number, default: 60 }, // 搜索框大小
    searchRadius: { type: Number, default: 12 }, // 搜索框圆角
    searchWidth: { type: Number, default: 40 }, // 搜索框宽度
    searchOpacity: { type: Number, default: 1 }, // 搜索框不透明度
    searchShow: { type: Boolean, default: true }, // 显示搜索框
    searchShadow: { type: Boolean, default: true }, // 搜索框阴影
    searchOpenWay: { type: String, default: "blank" }, // 搜索结果打开方式
    /* -----图标------ */
    iconAddShow: { type: Boolean, default: true }, // 显示添加网址按钮
    iconRadius: { type: Number, default: 8 }, // 图标圆角
    iconSize: { type: Number, default: 96 }, // 图标大小
    iconShadow: { type: Boolean, default: true }, // 图标阴影
    iconOpacity: { type: Number, default: 1 }, // 图标不透明度
    iconOpenWay: { type: String, default: "blank" }, // 点击打开方式
    /* -----待机页------ */
    standbyOpen: { type: Boolean, default: true }, // 开启待机页
    standbyNewShow: { type: Boolean, default: true }, // 新建标签页，新打开网页，刷新页面时是否显示
    standbyFreeShow: { type: Number, default: 60 * 1000 }, // 空闲时显示, 默认一分钟
    standbyBgBlur: { type: Boolean, default: true }, // 待机页背景图片是否模糊
    standbyTime: { type: Boolean, default: true }, // 开启时钟
    standbyTimeLunar: { type: Boolean, default: true }, // 开启农历
    standbyTime24: { type: Boolean, default: true }, // 时间显示制 HH-->24小时制度，hh-->12小时
    standbyWeather: { type: Boolean, default: true }, // 开启天气
    standbyWeatherCity: { type: String, default: "101010100" }, // 天气定位城市: 默认北京
  },
  { timestamps: true }
);

type UserDocument = User & Document;
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err: Error, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

const comparePassword: ComparePasswordFunction = function (candidatePassword) {
  const password = this.password;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, password, (err, success) => {
      if (err) return reject(err);
      return resolve(success);
    });
  });
};
userSchema.methods.comparePassword = comparePassword;

const userModel = model<UserDocument>("User", userSchema);

export default userModel;
