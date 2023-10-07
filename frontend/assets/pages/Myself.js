import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkFavorite, cookiesName, noLoginDefaultLevelsSites, getStandbyTime, defaultWeatherCity } from '../public/js/index'
import { mineRecommendId } from '../../config/config'

const Page = loadable(() => import('../containers/Myself'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { store, req, match, res } = context

        /* -------------------- 开启主页外链功能且访问的是外链页面--->设置+分类与网址--信息获取 -------------------- */
        const isUserOuterLink = match.url.indexOf('/people/') > -1
        if (isUserOuterLink) {
            const userNameObj = { userName: decodeURIComponent(match.params.userName) }
            const setting = await store.dispatch.user.outerLinkGetSetting(userNameObj)
            if (setting.code !== 1) {
                res.redirect('/')
                return { customRes: true }
            }

            if (setting.data && setting.data.standbyOpen) {
                await store.dispatch.public.getWetherInfo({ citycode: setting.data.standbyWeatherCity || defaultWeatherCity })

                // 待机页时间制式
                const timeArr = getStandbyTime(setting.data.standbyTime24 ? 'HH' : 'hh')
                store.dispatch.public.setStandbyTime(timeArr)
            }

            return { ...webTdkFavorite }
        } else {
            /* -------------------- 未开启外链--登录展示推荐网址 -------------------- */

            const userId = req.cookies[cookiesName.userId]
            // 登录情况下，则请求该用户的导航
            // 未登录情况下，则请求新用户推荐内容，且转化为我的导航所需要数据结构
            // 外链页面则由render.js中与setting一起获取
            if (userId) {
                const res = await Promise.all([
                    store.dispatch.user.levelSiteGet({ req, userId })
                ]).catch(function (err) {
                    throw Error(err)
                })

                const levels = res && res[0] && res[0].data && res[0].data.levels
                if (levels && res[0].code === 1) {
                    store.dispatch.user.setCurlevel(levels.length > 0 ? levels[0]._id : null)
                } else {
                    throw Error(levels.msg)
                }
            } else {
                const levelSite = await Promise.all([
                    store.dispatch.website.secondLevelGet(mineRecommendId),
                    store.dispatch.website.siteListGet({
                        currentPage: 1,
                        pageSize: 100,
                        firstLevelId: mineRecommendId,
                        recommend: true
                    })
                ])

                noLoginDefaultLevelsSites({ levelSite, dispatch: store.dispatch })
            }
        }

        return {
            ...webTdkFavorite
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
