export const auth = {
    forgetPsd: `/auth/forgetpsd`, // 忘记密码
    signup: `/auth/signup`, // 注册
    signout: `/auth/signout`, // 注销
    signin: `/auth/signin`, // 登录
    graphCode: `/auth/graph`, // 图形验证码
    emailCode: `/auth/email`, // 邮箱验证码
    setting: `/auth/setting`, // 设置
    getSetting: `/auth/getsetting`, // 获取设置
    changePsd: `/auth/changepsd`, // 修改密码
    bindEmail: `/auth/bindemail` // 绑定邮箱
}

export const user = {
    level: `/user/level`, // 我的网址分组
    site: `/user/site`, // 我的网址
    folder: `/user/folder`, // 文件夹
    levelsite: `/user/levelsite`, // 获取我的网址分组与我的网址
    outerLinkGetSetting: `/user/outerlinkgetsetting`, // 主页外链获取设置
    addToMine: `/user/site/addtomine`, // 官方网址添加到我的导航
    sitesFoldersLevelsSort: `/user/site/sort`, // 网址排序
    recommendToOffcial: `/user/site/recommendToOffcial`, // 推荐至官方
    getSiteInfo: `/user/site/getsiteinfo`, // 获取网站基本信息
    importBookmark: `/user/bookmark/import`, // 从书签栏导入
    exportBookmark: `/user/bookmark/export` // 导出我的收藏
}

export const website = {
    firstLevel: '/website/first',
    secondLevel: '/website/second',
    website: '/website/site'
}

export const article = {
    article: '/article/blog',
    articleUser: '/article/blog/user',
    tag: '/article/tag',
    comment: '/article/comment',
    channel: '/article/channel',
    album: '/article/album',
    albumByArticle: '/article/albumbyarticle' // 根据articleId获取文章所在专辑
}

export const common = {
    uploadArticleImage: '/public/upload/article',
    uploadIconImage: '/public/upload/icon',
    uploadAvatarImage: '/public/upload/avatar',
    uploadWallpaperImage: '/public/upload/wallpaper',
    uploadUrlImage: '/public/upload/imgurl'
}

export const wallpaper = {
    wallpaper: '/wallpaper'
}

export const standby = {
    // 京东万象数据---微信登录 https://wx.jdcloud.com/market/datas/26/10610
    // server中使用
    apiHost: 'https://way.jd.com',
    appkey: '7e384806e38bde79ddf2f12c69d6cf87',
    city: `/jisuapi/weather1`,
    weather: `/jisuapi/weather`,
    // browser中使用
    cityFront: '/weather/city',
    weatherFront: '/weather'
}

export const poster = {
    uploadPosterImg: '/public/upload/poster',
    uploadFont: '/public/upload/font',
    poster: '/poster',
    create: '/poster/create',
    setting: '/poster/setting',
    font: '/poster/font'
}
