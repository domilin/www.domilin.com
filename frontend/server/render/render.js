import path from 'path'
import React from 'react'
// import { renderToNodeStream } from 'react-dom/server'
import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router-dom'
import { Provider } from 'react-redux'
import { matchRoutes } from 'react-router-config'
import { ChunkExtractor } from '@loadable/server'
import { I18nextProvider } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

import { isWechat, isJson, cookiesName, getStandbyTime, defaultWeatherCity } from '../../assets/public/js/index'
import layout from './layout'
import serverStore from './store'
import configServer from '../../config/config-server'

/**
 * @Desc 匹配当前请求url是否跟客户端路由一致 不一致则执行next 进行静态资源处理等
 * @param {url, routesParam}
 */
const urlMatch = (url, routesParam) => {
    let isExit = false
    const hasKey = (arr) => {
        for (let val of arr) {
            let hasPath = null
            if (val.path) {
                const params = {}
                params.path = val.path
                if (val.exact) params.exact = val.exact
                if (val.strict) params.strict = val.strict
                hasPath = matchPath(url, params)
            }

            const isObj = Object.prototype.toString.call(hasPath) === '[object Object]'
            if (isObj) {
                isExit = true
                return true
            }
            if (val.routes && !isObj) {
                hasKey(val.routes)
            }
        }
    }
    hasKey(routesParam)
    return isExit
}

/**
 * @Desc 服务端渲染
 */
const devEnv = process.env.NODE_ENV === 'development'
const rootPath = path.join(__dirname).split('server')[0]
const stasFileFolder = devEnv ? '_dist' : 'build'
const nodeStats = path.join(`${rootPath}server/${stasFileFolder}/loadable-stats.json`)
const webStats = path.join(`${rootPath}static/${stasFileFolder}/loadable-stats.json`)

export default async (req, res, next) => {
    /**  生成服务端extractor */
    const extractorParams = { statsFile: nodeStats, entrypoints: ['App'] }
    if (!devEnv) extractorParams.outputPath = configServer.loadableStatsOutputPath
    const nodeExtractor = new ChunkExtractor(extractorParams)
    const { default: App } = nodeExtractor.requireEntrypoint()
    const routes = App.routes().routes
    const ErrorPage = App.ErrorPage

    /**  生成客户端extractor */
    const webExtractor = new ChunkExtractor({ statsFile: webStats, entrypoints: ['index'] })

    const routesParam = routes
    const isMatch = urlMatch(req.path, routesParam)
    if (!isMatch) {
        await next()
    } else {
        /** 默认语言 */
        let lang = (req.language || 'zh').toLowerCase()
        if (req.cookies[cookiesName.lang]) lang = req.cookies[cookiesName.lang]
        req.i18n.changeLanguage(lang)
        dayjs.locale(lang)

        /** 默认主题 */
        let theme = 'night'
        if (req.cookies[cookiesName.theme]) theme = req.cookies[cookiesName.theme]

        /** 生成默认数据与路由匹配 */
        const store = serverStore()
        const branch = matchRoutes(routesParam, req.path)
        const promises = branch.map(({ route, match }) => {
            const getInitialProps = route.component.getInitialProps
            return getInitialProps instanceof Function ? getInitialProps({
                req,
                res,
                match,
                store,
                isServer: true
            }) : Promise.resolve(null)
        })
        global.reduxStore = store // 挂载到全局对象上，ajax未登录时使用

        /** @desc 默认数据获取 */
        // 访问外链的话就算登录也不设置个人信息
        const isUserOuterLink = req.originalUrl.indexOf('/people/') > -1
        const canSetPersonalInfo = req.cookies[cookiesName.userId] && !isUserOuterLink
        if (canSetPersonalInfo) {
            // 设置登录信息
            promises.push(
                store.dispatch.public.setUserInfo({
                    token: req.cookies[cookiesName.token],
                    userName: req.cookies[cookiesName.userName],
                    userId: req.cookies[cookiesName.userId]
                })
            )

            // 获取个人设置
            promises.push(
                store.dispatch.public.getSetting({
                    req,
                    userId: req.cookies[cookiesName.userId]
                })
            )
        } else {
            // 未登录同步reudx的theme到前端设置
            store.dispatch.public.settingData({ theme })
            // 未登录设置待机页时间--默认24小时制
            store.dispatch.public.setStandbyTime(getStandbyTime('HH'))
            // 未登录默认获取北京天气
            promises.push(
                store.dispatch.public.getWetherInfo({ citycode: defaultWeatherCity })
            )
        }

        // 获取一级导航
        promises.push(
            store.dispatch.website.firstLevelGet()
        )
        // 获取壁纸
        promises.push(
            store.dispatch.public.getWallpaper()
        )

        // api接口错误日志
        const errReport = (err) => {
            if (!(err instanceof Error)) return
            const errMsg = err.message.replace(/Error: /g, '')
            if (isJson(errMsg)) {
                res.logger.error({
                    ...JSON.parse(errMsg),
                    stack: err.stack
                })
            } else {
                res.logger.error({
                    message: errMsg,
                    stack: err.stack
                })
            }
            return errMsg
        }

        // 默认数据请求
        let initProps = {}
        let settingSlef = {}
        await Promise.all(promises).then((res) => {
            const wallpaper = res && res[res.length - 1]
            if (wallpaper && wallpaper.code && wallpaper.code !== 1) throw Error(wallpaper.msg)
            const firstLevels = res && res[res.length - 2]
            if (firstLevels && firstLevels.code && firstLevels.code !== 1) throw Error(firstLevels.msg)

            if (canSetPersonalInfo) {
                const setting = res && res[res.length - 3]
                if (setting && setting.code && setting.code !== 1) throw Error(setting.msg)

                if (setting && setting.code && setting.code === 1) {
                    settingSlef = setting.data

                    // 登录并获取到设置信息后，使用用户自己设置的主题
                    if ('theme' in setting.data) {
                        theme = setting.data.theme
                    }

                    // 待机页时间制式
                    if (setting.data && setting.data.standbyOpen) {
                        const timeArr = getStandbyTime(setting.data.standbyTime24 ? 'HH' : 'hh')
                        store.dispatch.public.setStandbyTime(timeArr)
                    }
                }
            }

            res.map((item) => {
                const isObj = Object.prototype.toString.call(item) === '[object Object]' // 排除undefined，null等
                const notSetUserInfo = isObj && (!('type' in item) || item.type !== 'public/setUserInfo') && !('payload' in item) // 排除获取用户登录信息models返回
                const notGetSetting = isObj && !('code' in item) // 排除获取用户设置，一级导航的 models返回
                if (notSetUserInfo && notGetSetting) {
                    initProps = Object.assign(initProps, item)
                }
            })
        }).catch((err) => {
            // apiErr 请求错误,打印日志
            errReport(err)
        })

        // 登录状态下获取用户设置的待机页城市天气
        if (canSetPersonalInfo) {
            if (settingSlef && settingSlef.standbyOpen && settingSlef.standbyWeather) {
                await store.dispatch.public
                    .getWetherInfo({ citycode: settingSlef.standbyWeatherCity || defaultWeatherCity })
                    .catch((err) => {
                    // apiErr 请求错误,打印日志
                        errReport(err)
                    })
            }
        }

        // 网站除了首页，其它页面均不渲染待机页
        if (req.path !== '/' && req.path !== '') {
            store.dispatch.public.settingData({ standbyOpen: false })
        }

        /** 利用extractor生成主要jsx内容 */
        let jsx = null
        let html = ''

        let errObjProps = null
        try {
            /** 当前没有错误情况下才开始尝试渲染正式App */
            jsx = webExtractor.collectChunks(<Provider store={store}>
                <StaticRouter
                    location={req.originalUrl}
                    context={{}}>
                    <I18nextProvider i18n={req.i18n}>
                        <App {...initProps} />
                    </I18nextProvider>
                </StaticRouter>
            </Provider>)

            /** 建立stream渲染中部 */
            // const stream = renderToNodeStream(jsx)
            html = renderToString(jsx)
        } catch (err) {
            /** 错误组件渲染
             * 如果node程序或者不是react程序报错则使用express的errorHandle，也就是404页面
             * 如果是react组件报错则使用此错误处理组件
             * 如果是此错误组件出错则也使用express的errorHandle
             * */
            errObjProps = {
                message: 'unknown error',
                stack: 'unknown stack'
            }
            if (err instanceof Error) {
                const errMsg = errReport(err)

                errObjProps = {
                    ...errObjProps,
                    message: errMsg,
                    stack: err.stack
                }
            }

            jsx = webExtractor.collectChunks(<Provider store={store}>
                <I18nextProvider i18n={req.i18n}>
                    <StaticRouter
                        location={req.originalUrl}
                        context={{}}>
                        <ErrorPage {...errObjProps} />
                    </StaticRouter>
                </I18nextProvider>
            </Provider>)
            html = renderToString(jsx)
        }

        /** 利用extractor获取js+css，并生成html骨架，并渲染头部 */
        let scripts = ''
        const links = webExtractor.getLinkTags()
        const styles = webExtractor.getStyleTags()
        if (devEnv) {
            // 开发环境静态资源在另外一个端口需要添加crossorigin属性
            const scriptCreate = (item) => {
                let scriptsStr = `<script `
                let scriptsStrEnd = `crossorigin></script>`
                Object.keys(item.props).map(function (key, index) {
                    if (key === 'dangerouslySetInnerHTML') {
                        scriptsStrEnd = `crossorigin>${item.props[key]['__html']}</script>`
                    } else {
                        scriptsStr += `${key}="${item.props[key]}" `
                    }
                })
                scripts += scriptsStr + scriptsStrEnd
            }
            webExtractor.getScriptElements().map(function (item, index) {
                if (Array.isArray(item)) {
                    item.map(function (itemIn, indexIn) {
                        scriptCreate(itemIn)
                    })
                } else {
                    scriptCreate(item)
                }
            })
        } else {
            scripts = webExtractor.getScriptTags()
        }

        // 获取redux默认state
        const initState = store.getState()

        // 如果开启外链，并且是/people外链路由，则设置theme为外链设置的setting.theme
        if (req.path.indexOf('/people/') > -1 && initState && initState.public && initState.public.userInfo && 'theme' in initState.public.userInfo) {
            theme = initState.public.userInfo.theme
        }

        const isWx = isWechat(req)
        const layoutParams = { initState, initProps, styles, scripts, links, isWx, errObjProps, theme }
        let htmlTemplate = layout(layoutParams)

        /** getInitialProps中返回customRes=true时，不使用这里的res.send，执行其中的res调用 */
        !initProps.customRes && res.send(htmlTemplate.header + html + htmlTemplate.footer)

        // res.write(htmlTemplate.header)
        //
        // stream.pipe(res, { end: false })
        //
        // /** stream完成后渲染尾部 */
        // stream.on('end', () =>
        //     res.end(htmlTemplate.footer)
        // )
    }
}
