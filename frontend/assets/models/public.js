import { axiosAjax, isJson, defaultWeatherCity } from '../public/js/index'
import { auth, common, wallpaper, standby } from '../public/js/apis'

// 默认设置
export const engines = { baidu: 'baidu', bing: 'bing', google: 'google', sogou: 'sogou', '360': '360' }
export const themes = { night: 'night', light: 'light' }
export const wallTypes = { official: 'official', color: 'color', custom: 'custom' }
export const iconTypes = { efficient: 'efficient', light: 'light', classic: 'classic' }
export const sidebars = { left: 'left', right: 'right' }
export const wallDefColor = '#eee'
export const defSet = {
    email: null, // 绑定邮箱
    nickName: null, // 昵称
    avatar: null, // 头像
    engine: engines.baidu, // 搜索引擎
    theme: themes.night, // 主题: night, light
    themeFollowSys: true, // 主题跟随系统
    wallpaperType: wallTypes.official, // official官方，color纯色，custom自定义
    wallpaper: wallDefColor, // 壁纸地址或颜色值
    wallpaperBlur: false, // 壁纸模糊
    iconType: iconTypes.efficient, // 网站图标类型: efficient高效，light轻巧，classic经典
    sidebar: sidebars.left, // 侧边栏位置: left, right
    sidebarAuto: false, // 侧边栏自动隐藏
    sidebarNarrow: false, // 窄距侧边栏
    outerLink: false, // 是否开启外
    /* ----------- */
    outerLinkName: null, // 外链自定义名称
    lastWatchLevel: 0, // 最后访问的分类
    /* -----bing壁纸------ */
    wallpaperBing: false, // 必应壁纸
    /* -----布局------ */
    layoutScrollSearchLevelFixed: true, // 滚定时搜索与分类固定到顶部
    layoutContentWidth: 25, // 显示宽度(内容宽度)
    layoutRowSpacing: 20, // 行间距
    layoutCloumnSpacing: 20, // 列间距
    layoutNavBtnShow: true, // 显示分页按钮
    layoutNavDotsShow: true, // 显示分页器
    layoutPageAnimateSpeed: 0.3, // 分页切换动画速度
    layoutPageAnimateEffect: 'slide', // 分页切换动画效果
    layoutPageSwitchMouse: true, // 支持鼠标切换
    layoutPageSwitchKeyboard: true, // 支持键盘切换
    /* -----搜索框------ */
    searchSize: 60, // 搜索框大小
    searchRadius: 12, // 搜索框圆角
    searchWidth: 40, // 搜索框宽度
    searchOpacity: 1, // 搜索框不透明度
    searchShow: true, // 显示搜索框
    searchShadow: true, // 搜索框阴影
    searchOpenWay: 'blank', // 搜索结果打开方式
    /* -----分类------ */
    levelShow: true, // 显示分类
    levelAddShow: true, // 显示添加分类按钮
    levelIconShow: true, // 显示图标
    levelTextShow: true, // 显示文字
    levelOpacity: 1, // 分类不透明度
    levelSize: 36, // 分类大小
    levelRadius: 12, // 分类圆角
    levelShadow: true, // 分类阴影
    /* -----图标------ */
    iconAddShow: true, // 显示添加网址按钮
    iconRadius: 8, // 图标圆角
    iconSize: 96, // 图标大小
    iconShadow: true, // 图标阴影
    iconOpacity: 1, // 图标不透明度
    iconOpenWay: 'blank', // 打开方式
    /* -----待机页------ */
    standbyOpen: true, // 开启待机页
    standbyNewShow: true, // 新建标签页，新打开网页，刷新页面时是否显示
    standbyFreeShow: 60 * 1000, // 空闲时显示，默认一分钟
    standbyBgBlur: true, // 待机页背景模糊
    standbyTime: true, // 开启待机页时间
    standbyTimeLunar: true, // 开启农历
    standbyTime24: true, // 时间显示制 HH-->24小时制度，hh-->12小时
    standbyWeather: true, // 开启待机页天气
    standbyWeatherCity: defaultWeatherCity, // 天气定位城市
    /* ----------- */
    preview: false // 预览设置
}

export default {
    state: {
        language: 'zh',
        wallpaper: null,
        standbyTime: {
            solar: null,
            time: null,
            lunar: null
        },
        wetherInfo: {
            weather: null,
            temp: null,
            temphigh: null,
            templow: null
        },
        userInfo: {
            userId: null,
            token: null,
            userName: null,
            ...defSet
        }
    },
    reducers: {
        setUserInfo: (state, { userId, token, userName }) => {
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    userId: userId || null,
                    token: token || null,
                    userName: userName || null
                }
            }
        },
        settingData: (state, payload) => {
            state.userInfo = {
                ...state.userInfo,
                ...payload
            }
        },
        setWallpaper: (state, payload) => {
            state.wallpaper = payload
        },
        setStandbyTime: (state, payload) => {
            state.standbyTime = payload
        },
        setWetherInfo: (state, payload) => {
            state.wetherInfo = payload
        }
    },
    effects: (dispatch) => ({
        async setting (payload, rootState) {
            dispatch.public.settingData(payload)
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: 1, msg: 'unlogin' }

            // layout.js主题跟随等----->设置时不显示加载中样式
            let noLoading = false
            if (payload && payload.noLoading) {
                noLoading = payload.noLoading
                delete payload.noLoading
            }

            const res = await axiosAjax({
                type: 'post',
                url: auth.setting,
                noLoading,
                params: payload
            })
            return res
        },
        async getSetting (payload, rootState) {
            const params = {
                type: 'post',
                noLoading: true,
                url: auth.getSetting
            }
            if (payload && payload.req) {
                params.req = payload.req
            }
            const res = await axiosAjax(params)
            if (res.code === 1) dispatch.public.settingData(res.data)
            return res
        },
        async getWallpaper (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                noLoading: true,
                url: wallpaper.wallpaper
            })
            if (res.code === 1) dispatch.public.setWallpaper(res.data && res.data.url)
            return res
        },
        async changePsd (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.changePsd,
                params: payload
            })
            if (res.code === 1) dispatch.public.settingData(res.data)
            return res
        },
        async bindEmail (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.bindEmail,
                params: payload
            })
            return res
        },
        async getGraphCode ({ uuidKey }, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: auth.graphCode,
                params: { uuidKey }
            })
            return res
        },
        async getEmailCode ({ uuidKey, email }, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.emailCode,
                params: { uuidKey, email }
            })
            return res
        },
        async signUp (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.signup,
                params: payload
            })
            return res
        },
        async signIn (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.signin,
                params: payload
            })
            return res
        },
        async signOut (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.signout
            })
            return res
        },
        async forgetPsd (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: auth.forgetPsd,
                params: payload
            })
            return res
        },
        async uploadIconImage (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: common.uploadIconImage,
                formData: true,
                params: payload
            })
            return res
        },
        async uploadAvatarImage (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: common.uploadAvatarImage,
                formData: true,
                params: payload
            })
            return res
        },
        async uploadWallpaperImage (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: common.uploadWallpaperImage,
                formData: true,
                params: payload
            })
            return res
        },
        async uploadArticleImage (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                noLoading: true,
                url: common.uploadArticleImage,
                formData: true,
                params: payload
            })
            return res
        },
        async uploadUrlImage ({ url }, rootState) {
            const res = await axiosAjax({
                type: 'post',
                noLoading: true,
                url: common.uploadUrlImage,
                params: { url }
            })
            return res
        },
        async getCityInfo (payload, rootState) {
            const resCity = await axiosAjax({
                type: 'get',
                noLoading: true,
                frontendApi: true,
                url: standby.cityFront
            })
            if (resCity.code !== 1) return
            if (!isJson(resCity.data)) return
            return JSON.parse(resCity.data)
        },
        async getWetherInfo ({ citycode }, rootState) {
            const resWeather = await axiosAjax({
                type: 'get',
                noLoading: true,
                frontendApi: true,
                url: standby.weatherFront,
                params: { citycode }
            })
            if (resWeather.code !== 1) return
            if (!isJson(resWeather.data)) return
            const result = JSON.parse(resWeather.data)
            dispatch.public.setWetherInfo({
                weather: result.weather,
                temp: result.temp,
                temphigh: result.temphigh,
                templow: result.templow
            })
            return resWeather
        }
    })
}
