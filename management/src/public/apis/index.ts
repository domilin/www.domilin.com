export const auth = {
  signin: `/admin/auth/signin` // 登录
};

export const communal = {
  uploadDelete: `/public/upload/delete`, // 删除文件
  uploadIcon: `/public/upload/icon`, // 图标上传
  uploadAvatar: `/public/upload/avatar`, // 头像上传
  wallpaperOfficial: `/public/upload/wallpaper/official` // 官方壁纸上传
};

export const site = {
  firstLevel: `/admin/website/firstlevel`, // 一级导航管理
  secondLevel: `/admin/website/secondlevel`, // 二级导航管理
  website: `/admin/website/site` // 网站地址
};

export const wallpaper = {
  wallpaper: `/admin/wallpaper`, // 壁纸管理
  setMain: `/admin/wallpaper/setmain` // 设为前端展示壁纸
};

export const article = {
  channel: `/admin/article/channel`, // 频道管理
  blog: `/admin/article/blog`, // 文章管理
  album: `/admin/article/album`, // 专辑管理
  albumArticle: `/admin/article/albumarticle` // 专辑文章管理
};
