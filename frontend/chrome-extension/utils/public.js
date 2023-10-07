import { defSet, themes } from '@/models/public'
import { chromeCookie, cookiesName, noLoginDefaultLevelsSites, getStandbyTime, defaultWeatherCity } from '@/public/js'
import { chromeFrontend, mineRecommendId } from '../../config/config'

/**
 * @desc 检测是否已登录
 */
export async function isLogin () {
    const userId = await chromeCookie.get({ url: chromeFrontend, key: cookiesName.userId })
    return userId
}

/**
 * @desc 登录情况下获取自定义数据
 */
export async function loginedInitialState (dispatch) {
    const res = await Promise.all([
        chromeCookie.get({ url: chromeFrontend, key: cookiesName.userId }),
        chromeCookie.get({ url: chromeFrontend, key: cookiesName.userName }),
        chromeCookie.get({ url: chromeFrontend, key: cookiesName.token }),
        dispatch.public.getWallpaper(),
        dispatch.public.getSetting(),
        dispatch.user.levelSiteGet(),
        dispatch.website.firstLevelGet()
    ])

    // 设置主题
    const setting = res[4]
    if (setting && setting.code === 1 && setting.data) {
        document.body.setAttribute('data-theme', setting.data.theme || 'light')

        if (setting.data.standbyOpen) {
            const timeArr = getStandbyTime(setting.data.standbyTime24 ? 'HH' : 'hh')
            dispatch.public.setStandbyTime(timeArr)

            if (setting.data.standbyWeather) {
                await dispatch.public.getWetherInfo({ citycode: setting.data.standbyWeatherCity || defaultWeatherCity })
            }
        }
    }

    // userInfo
    dispatch.public.setUserInfo({
        userId: res[0] && res[0].value,
        userName: res[1] && res[1].value,
        token: res[2] && res[2].value
    })

    // 设置当前分类
    const levelsSites = res[5]
    if (levelsSites && levelsSites.code === 1) {
        const levels = levelsSites.data.levels
        if (levels && Array.isArray(levels) && levels.length > 0) {
            dispatch.user.setCurlevel(levels[0]._id)
        }
    }

    return res
}

/**
 * @desc 未登录情况下设置自定义数据
 */
export async function noLoginInitailState (dispatch) {
    dispatch.public.setUserInfo({
        userId: null,
        userName: null,
        token: null
    })
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        defSet.theme = themes.night
    } else {
        defSet.theme = themes.light
    }
    dispatch.public.settingData(defSet)
    dispatch.public.setStandbyTime(getStandbyTime('HH'))

    const levelSite = await Promise.all([
        dispatch.website.secondLevelGet(mineRecommendId),
        dispatch.website.siteListGet({
            currentPage: 1,
            pageSize: 100,
            firstLevelId: mineRecommendId,
            recommend: true
        }),
        dispatch.public.getWallpaper(),
        dispatch.website.firstLevelGet(),
        dispatch.public.setStandbyTime(getStandbyTime('HH')),
        dispatch.public.getWetherInfo({ citycode: defaultWeatherCity })
    ])

    if (!levelSite) throw Error('Site Get Error')

    /* -------------------- 展示默认分类与网址：此处逻辑与/assets/pages/Myself.js 未开启外链/未登录逻辑与代码一直 -------------------- */
    noLoginDefaultLevelsSites({ levelSite, dispatch })

    return levelSite
}
