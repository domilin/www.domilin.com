import axios from 'axios'
// import qs from 'qs'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'

import { apiDomain, chromeFrontend, frontendDomain } from '../../../config/config'
import { calendar } from './calendar'
import { auth } from './apis'

/**
 * @desc ajax请求
 * nodeJs接口请求错误由render.js统一处理; 前端做单独做明确提示。
 * 错误捕获在每个地方都catch并且throw Error，即使上一层已经捕获。不然error.stack不会追溯到错误位置
 * @returns {data/error}
 * @Params {args} args = {
 *  type(get/post/complexpost),
 *  url,
 *  params,
 *  contentType,
 *  urlSearchParams,
 *  formData,
 *  noLoading,
 *  userDefined,
 *  host,
 *  transformRequest,
 *  noLog,
 *  res,
 *  req
 * }
 * @method axiosAjax({
        type: get/post/complexpost,
        url: ',
        contentType: 'application/x-www-form-urlencoded',
        noLoading: true,
        userDefined: {
            'hx-cookie': Base64.encode(JSON.stringify({
                    'passportId': Cookies.get('passportId'),
                    'token': Cookies.get('token')
                }))
        },
        transformRequest: '',
        params: {
            dataone: 'one',
            datatwo: 'two'
        }
    })
 */
const removeLoading = () => {
    if (typeof window !== 'undefined' && document.getElementById('ajaxLoading')) {
        const $ajaxLoading = document.getElementById('ajaxLoading')
        $ajaxLoading &&
        $ajaxLoading.parentNode &&
        $ajaxLoading.parentNode.removeChild &&
        $ajaxLoading.parentNode.removeChild($ajaxLoading)
    }
}

export const axiosAjax = (args) => new Promise(function (resolve, reject) {
    const {
        type,
        url,
        params,
        formData,
        contentType,
        noLoading, // 是否有加载动画
        noLog, // code不等于1时是否打印日志。[]空数组为都不上报，[-4, 5, 7]当res.data.code为其中一项时就不上报
        userDefined,
        host,
        frontendApi, // 前端项目自己的api
        transformRequest
    } = args
    const response = args.res // 接口需要登录时传
    const request = args.req // 接口需要登录时传

    // then为res，cath为err
    const resNotOkLogger = (res, type) => {
        if (!res || !res.code) return

        let noLogTrue = false // 自定义是否上报日志
        if (noLog && isArray(noLog)) {
            if (noLog.length === 0) {
                noLogTrue = true
            } else {
                for (let val of noLog) {
                    if (res.data && res.data.code === val) {
                        noLogTrue = true
                        break
                    }
                }
            }
        }

        /** @desc 未登录跳转到登录页面 */
        if (res.code === -1) {
            if (typeof window === 'undefined') {
                if (response && response.redirect) response.redirect('/signin')
            } else {
                window.location.href = '/signin'
            }
        }

        /** @desc 日志打印 */
        if (res.code !== 1 && !noLogTrue) {
            const resCode = res.code
            const resMsg = res.msg || 'api code is not ok'
            if (typeof window === 'undefined') {
                throw Error(JSON.stringify({
                    message: 'api-msg',
                    httpCode: type === 'then' ? 200 : 400,
                    url,
                    resCode,
                    resMsg
                }))
            } else {
                if (url.indexOf('/logger') === -1) {
                    logReport({
                        message: 'client-api-msg',
                        httpCode: type === 'then' ? 200 : 400,
                        params: isJson(params) ? JSON.stringify(params) : params,
                        framework: true,
                        url,
                        resCode,
                        resMsg
                    })
                }
            }
        }
    }

    (async () => {
        let urlLast = url
        if (host || host === '') {
            urlLast = host + url
        } else if (frontendApi) {
            if (typeof window === 'undefined') {
                /** @desc --------------------服务器部署到同一台机器，服务端请求直接请求服务器本地地址-------------------- */
                urlLast = `http://localhost:3082${url}`
            } else {
                urlLast = frontendDomain + url
            }
        } else {
            if (typeof window === 'undefined') {
                /** @desc --------------------服务器部署到同一台机器，服务端请求直接请求服务器本地地址-------------------- */
                urlLast = `http://localhost:3080${url}`
                console.log(urlLast)
            } else {
                urlLast = apiDomain + url
            }
        }
        if (typeof window !== 'undefined') {
            let ajaxLoadingStr = `<div id="ajaxLoading" class="domilin-loader"><div class="domilin-loader-content"><div></div><div></div><div></div><div></div></div></div>`

            if (noLoading) ajaxLoadingStr = '<div id="ajaxLoading"></div>'
            if (!document.getElementById('ajaxLoading')) document.body.insertAdjacentHTML('beforeend', ajaxLoadingStr)
        }

        // 判断请求方法并做相应的参数包装
        let opt = null
        const ajaxType = type && type.toLowerCase()
        if (type === 'post' || type === 'put' || type === 'delete') {
            opt = {
                method: type,
                url: urlLast,
                data: params
                // data: qs.stringify(params)
            }
        } else if (ajaxType === 'get') {
            opt = {
                method: type,
                url: urlLast,
                params: params
            }
        }

        // 仅浏览器端支持
        if ((type === 'post' || type === 'put' || type === 'delete') && formData) {
            let fmData = new FormData()
            for (let key in params) {
                fmData.append(key, params[key])
            }

            opt = {
                method: type,
                url: urlLast,
                data: fmData
            }
        }

        if (contentType) {
            opt.headers = {
                'Content-Type': contentType
            }
        }

        if (userDefined) {
            opt.headers = { ...opt.headers, ...userDefined }
        }

        if (transformRequest) {
            opt.transformRequest = transformRequest
        }

        // 请求头带上authorization验证token
        if (typeof window === 'undefined') {
            if (request && request.cookies && request.cookies[cookiesName.token]) {
                opt.headers = { ...opt.headers, authorization: request.cookies[cookiesName.token] }
            }
        } else {
            if (Cookies.get(cookiesName.token)) {
                opt.headers = { ...opt.headers, authorization: Cookies.get(cookiesName.token) }
            }
        }

        // chrome extension 的 cookie获取，设置authorization验证token
        if (typeof window !== 'undefined' && isChromeExtension()) {
            const cookieValue = await chromeCookie.get({
                url: chromeFrontend,
                key: cookiesName.token
            })
            if (cookieValue && cookieValue.value) {
                opt.headers = { ...opt.headers, authorization: cookieValue.value }
            }
        }

        const res = await axios({
            ...opt,
            timeout: 6000
        })

        removeLoading()
        if (res.data) {
            // 登录时存储token与其他用户信息到cookie
            if (url === auth.signin && res.data.code === 1) {
                for (let key in res.data.data) {
                    const name = `${key === '_id' ? 'domilin' : 'domilin_'}${key}`
                    Cookies.set(name, res.data.data[key], { expires: 30 })
                }
            }

            // PS: code !== 1没有在此处理，让请求的地方单独处理
            // 1，可以做到错误提示与处理更加细致；
            // 2，由于在使用的地方抛出throw Error，更加准确的定位错误地方

            resNotOkLogger(res, 'then')
            resolve(res.data)
        }
    })().catch(function (err) {
        removeLoading()

        if (err.response && err.response.data && isJson(err.response.data)) {
            resNotOkLogger(err, 'catch')
            resolve(err.response.data)
        } else {
            const errMsg = typeof err.message === 'string' ? err.message.replace(/Error: /g, '') : ''
            const urlParam = err.config ? err.config.url : url
            const codeParam = err.response ? err.response.status : 500
            let errObj = { errMsg: errMsg }
            if (isJson(errMsg) && JSON.parse(errMsg).message === 'api-msg') {
                errObj = JSON.parse(errMsg)
            } else {
                errObj = {
                    message: 'api-err',
                    httpCode: codeParam,
                    url: urlParam,
                    ...errObj
                }
            }

            if (typeof window === 'undefined') {
                // console.error(errObj)
                reject(Error(JSON.stringify(errObj)))
            } else {
                errObj.message = 'client-api-err'
                errObj.params = isJson(params) ? JSON.stringify(params) : params
                if (err.stack) errObj.stack = err.stack
                url.indexOf('/logger') === -1 && logReport({ ...errObj, framework: true })

                const errStr = `[api-err] url:${urlParam}, status:${codeParam}, msg:${errMsg}`
                // console.error(errStr)
                reject(Error(errStr))
            }
        }
    })
})

/** @desc
 * 前端日志上报到node服务: 框架自动打印的params中会有framework:true参数(axiosAjax, browser/index.js, browser/app.js)，会自动上传localstorage和sessionstorage
 * node端日志打印: 可调用/server/app/logger.js, 路由中可调用res.logger
 * @params {params} {level, message, ...其它信息}
 * @method logReport(params)
 **/
let logArr = []
let logPreTime = new Date().getTime() // 1秒内logArr中不存在的errObj才上报。同一页面同一信息1秒内不再上报
export const logReport = (params) => {
    if (typeof window === 'undefined') return

    try {
        const logCurTime = new Date().getTime()
        const logAjax = () => {
            const logObj = {}
            if (window.localStorage && params.framework) {
                const localTmp = {}
                Object.keys(window.localStorage).map(function (key, index) {
                    if (key.indexOf('Hm_lvt_') === -1 && key.indexOf('Hm_lpvt_') === -1 && key.indexOf('m_unsent_') === -1) { // 在此排除不需要的信息
                        localTmp[key] = localStorage.getItem(key)
                    }
                })
                logObj.localStorage = JSON.stringify(localTmp)
            }

            if (window.sessionStorage && params.framework) {
                const localTmp = {}
                Object.keys(window.sessionStorage).map(function (key, index) {
                    if (key.indexOf('Hm_lvt_') === -1 && key.indexOf('Hm_lpvt_') === -1 && key.indexOf('m_unsent_') === -1) { // 在此排除不需要的信息
                        localTmp[key] = sessionStorage.getItem(key)
                    }
                })
                logObj.sessionStorage = JSON.stringify(localTmp)
            }

            const paramsObj = { ...params, ...logObj }
            if ((paramsObj.url && paramsObj.url.indexOf('/logger') === -1) || !paramsObj.url) {
                axiosAjax({
                    type: 'post',
                    url: '/logger',
                    noLoading: true,
                    host: `${window.location.protocol}//${window.location.host}`,
                    params: paramsObj
                })
            }
        }

        if (logCurTime - logPreTime >= 1000 && logArr.length !== 0) {
            logArr = []
            logArr.push(params)
            logPreTime = logCurTime
            logAjax()
        } else {
            const hasParams = () => {
                for (let val of logArr) {
                    if (deepCompare(val, params)) {
                        return true
                    }
                }
                return false
            }
            if (logArr.length !== 0 && hasParams()) return
            logArr.push(params)
            logAjax()
        }
    } catch (err) {
        console.error(err)
    }
}

/** -------------------------------------------- chrome-extension (start) -------------------------------------------- */
/**
 * @desc chrome-extension 获取cookie
 * @method cookies.set(), cookies.get(), cookies.remove()
 */
export const chromeCookie = {
    set: (params) => new Promise(function (resolve, reject) {
        const { url, key, value, expireSecond } = params
        try {
            const param = {
                url: url,
                name: key,
                value: value,
                path: '/'
            }
            if (expireSecond) {
                param.expirationDate = new Date().getTime() / 1000 + expireSecond
            }
            chrome.cookies.set(param, function (data) {
                resolve(data)
            })
        } catch (err) {
            reject(err)
        }
    }),
    get: (params) => new Promise(function (resolve, reject) {
        const { url, key, isAutoDelay } = params
        try {
            chrome.cookies.get({
                url: url,
                name: key
            }, function (data) {
                if (data && data.value && isAutoDelay) {
                    // 自动延长cookie时间
                    chromeCookie.set(url, key, data.value, 30 * 12 * 60 * 60)
                }
                resolve(data)
            })
        } catch (err) {
            reject(err)
        }
    }),
    remove: (params) => new Promise(function (resolve, reject) {
        const { url, key } = params
        try {
            chrome.cookies.remove({
                url: url,
                name: key
            }, function (data) {
                resolve(data)
            })
        } catch (err) {
            reject(err)
        }
    })
}

/**
 * @desc 获取当前选项卡ID
 * @method getCurrentTabId(callback)
 */
export const getCurrentTabId = (callback) => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (callback) callback(tabs.length ? tabs[0].id : null)
        })
    } catch (err) {
        console.error(err)
    }
}

/**
 * @desc popup或者bg向content主动发送消息
 * @method sendMessageToContentScript(message, callback)
 */
export const sendMessageToContentScript = (message, callback) => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
                if (!chrome.runtime.lastError) {
                    if (callback) callback(response)
                }
            })
        })
    } catch (err) {
        console.error(err)
    }
}

/**
 * @desc content.js发送消息
 * @method onMessageContentScript(message, callback)
 */
export const onMessageContentScript = (cmd, callback) => {
    try {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.cmd && message.cmd === cmd) {
                if (callback) {
                    const res = callback()
                    sendResponse(res)
                }
            } else {
                sendResponse(`response: ${cmd}`)
            }
        })
    } catch (err) {
        console.error(err)
    }
}

/**
 * @desc 是否是chrome-extension扩展环境
 * @returns {Boolean}
 * @method isChromeExtension()
 */
export const isChromeExtension = (req) => {
    return typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:'
}

/**
 * @desc newTab 或 popup设置更新后，同步state到backgrou
 */
export const syncStateToBackground = () => {
    if (!isChromeExtension()) return
    const background = chrome.extension.getBackgroundPage()
    background.storeState = window.reduxStore.getState()
}

// message cmd
export const getSiteInfo = 'getSiteInfo'
/** -------------------------------------------- chrome-extension (end) -------------------------------------------- */

/**
 * @desc websocket连接
 * @params {args} args = {
 *    host 如果不是默认域名添加此参数,
 *    url 接口路由,
 *    params 发送的参数,
 *    binaryType 指定接收数据类型: blob,arraybuffer，
 *    https true支持https传此参数，
 *    success 连接成功，返回event,
 *    message 接收消息，返回event,
 *    close 连接关闭时，返回此event,
 *    error 连接错误，返回此event,
 * }
 * @returns {ws} ws: 此websocket对象，用于后续其它操作。
 * ws.message(callback)
 * ws.message(function (event) {
            console.log(event)
   })
 * ws.send()
 * ws.close()
 * ws.bufferedAmount 0发送完毕，else发送中
 * ws.readyState CONNECTING：值为0，表示正在连接。OPEN：值为1，表示连接成功，可以通信了。CLOSING：值为2，表示连接正在关闭。CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
 * @method websocket(args)
 * */
export const websocket = (args) => new Promise(function (resolve, reject) {
    let messageEventProxy = {}
    try {
        const { host, url, params, binaryType, https, success, message, close, error } = args

        const wssUrl = `${(https || process.env.NODE_ENV === 'production') ? 'wss' : 'ws'}://${(host || (apiDomain.indexOf('http') > -1 ? apiDomain.split('://')[1] : apiDomain)) + (url || '')}`

        let ws
        let lockReconnect = false // 避免重复连接
        if (window.WebSocket || window.MozWebSocket) {
            // onopen, onmessage心跳检测
            const heartCheck = {
                timeout: 25000,
                timeoutObj: null,
                serverTimeoutObj: null,
                reset: function () {
                    clearTimeout(this.timeoutObj)
                    clearTimeout(this.serverTimeoutObj)
                    return this
                },
                start: function () {
                    const This = this
                    this.timeoutObj = setTimeout(function () {
                        ws.send('ping')
                        // 如果再timeout时间内没有重置，认为后端主动断开连接，则进行重连
                        This.serverTimeoutObj = setTimeout(function () {
                            // onclose会执行reconnect，执行ws.close()就行了
                            // 如果直接执行reconnect 会触发onclose导致重连两次
                            ws.close()
                        }, This.timeout)
                    }, this.timeout)
                }
            }

            // onerror, onclose时重新连接
            const reconnect = () => {
                if (lockReconnect) return
                lockReconnect = true
                setTimeout(function () {
                    createWebSocket()
                    lockReconnect = false
                }, 2000)
            }

            const createWebSocket = () => {
                const BrowserWebSocket = window.WebSocket || window.MozWebSocket
                // ws = new BrowserWebSocket(wssUrl, 'protocol')
                ws = new BrowserWebSocket(wssUrl)
                if (binaryType) ws.binaryType = binaryType

                /** @desc 自定义message事件
                 * 增加代理当onmessage返回消息时，触发自定义事件message的参数callback执行
                 * 由于会多次调用message，为了保证proxy唯一性，uuid生成eventProxyKey，监听并执行
                 * 若直接改变messageEventProxy，则后边调用message会覆盖上次调用的值，则监听无效
                 *
                 * 思路:
                 * 1,创建messageEventProxy对象，保存要被监听的自定义message对象
                 * 2,定义message方法参数，回调函数callback
                 * 3,方法内定义proxy代理，监听uuid生成唯一key值eventProxyKey值更新时，执行callback函数
                 */
                ws.message = (callback) => {
                    const eventProxyKey = uuid()
                    messageEventProxy[eventProxyKey] = new Proxy({ event: null }, {
                        set: function (target, propKey, value, receiver) {
                            target[propKey] = value

                            callback(value)
                            return receiver
                        }
                    })
                }

                ws.onopen = (event) => {
                    heartCheck.reset().start()
                    ws.send(JSON.stringify({
                        action: 'auth'
                    }))
                    if (params) ws.send(JSON.stringify(params))
                    if (success) success(event)

                    resolve(ws)
                }

                ws.onmessage = (event) => {
                    heartCheck.reset().start()
                    if (event.data === 'pong') return
                    if (message) message(event)
                    for (const key in messageEventProxy) {
                        messageEventProxy[key].event = event
                    }
                }
                ws.onclose = (event) => {
                    reconnect()
                    if (close) close(event)
                }
                ws.onerror = (err) => {
                    reconnect()
                    if (error) error(err)
                }

                // 页面关闭或刷新前关闭ws连接
                window.onbeforeunload = () => {
                    ws.close()
                }
            }

            createWebSocket()
        } else {
            const tips = '当前浏览器不支持WebSocket'
            // console.error(tips)
            reject(new Error(tips))
        }
    } catch (err) {
        // console.error(err)
        reject(err)
    }
})

/**
 * @desc 获取浏览器用户代理字符串（服务端/浏览器端）
 * @returns {userAgent}
 * @Params {req} req 用户请求数据
 * @method uerserAgent(req)
 */
export const uerserAgent = (req) => {
    return req ? (req.headers['user-agent'] || '') : window.navigator.userAgent
}

/**
 * @desc 判断是否是PC（服务端/浏览器端）
 * @returns {Boolean}
 * @Params {req} req服务端需要
 * @method isPc(req)
 */
export const isPc = (req) => {
    const userAgent = uerserAgent(req).toLowerCase()

    const Agents = ['android', 'iphone', 'ipod', 'windows phone', 'ipad']
    let flag = true
    for (let i = 0; i < Agents.length; i++) {
        if (userAgent.indexOf(Agents[i]) > -1) {
            flag = false
            break
        }
    }
    return flag
}

/**
 * @desc 判断是否是iOS（服务端/浏览器端）
 * @returns {Boolean}
 * @Params {req} req服务端需要
 * @method isIos(req)
 */
export const isIos = (req) => {
    const userAgent = uerserAgent(req).toLowerCase()
    return (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) || false
}

/**
 * @desc 判断是否是iphonex
 * @returns {Boolean}
 * @method isIphoneX()
 */
export const isIphoneX = () => /iphone/gi.test(navigator.userAgent) && (screen.height === 812 && screen.width === 375)

/**
 * @desc 判断是否是Android（服务端/浏览器端）
 * @returns {Boolean}
 * @Params {req} req服务端需要
 * @method isAndroid(req)
 */
export const isAndroid = (req) => {
    const userAgent = uerserAgent(req).toLowerCase()
    return userAgent.indexOf('android') > -1 || false
}

/**
 * @desc 判断是否是微信/Wechat（服务端/浏览器端）
 * @returns {Boolean}
 * @Params {req} req服务端需要
 * @method isWechat(req)
 */
export const isWechat = (req) => {
    const userAgent = uerserAgent(req).toLowerCase()
    return userAgent.indexOf('micromessenger') > -1 || false
}

/**
 * @desc 判断是否为正确的密码规则: 密码6-16位字符，必须包含大小写字母和数字
 * @returns {boolean}
 * @Params {password} string
 * @method isPsd(password)
 */
export const isPsd = (password) => {
    const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,16}$/
    return reg.test(password) || false
}

/**
 * @desc 判断是否是符合规则邮箱地址
 * @returns {Boolean}
 * @Params {email}
 * @method isEmail(email)
 */
export const isEmail = (email) => {
    const myreg = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
    return myreg.test(email) || false
}

/**
 * @desc 判断是否是正确的手机号
 * @returns {Boolean}
 * @Params {phoneNumber}
 * @method isPhone()
 */
export const isPhone = (phoneNumber) => {
    const myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
    return myreg.test(phoneNumber) || false
}

/**
 * @desc 判断是否是正确的网址
 * @returns {Boolean}
 * @Params {phoneNumber}
 * @method isUrl()
 */
export const isUrl = (url) => {
    const strRegex = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/
    return RegExp(strRegex).test(url)
}

/**
 * @desc 判断是否为数字
 * @returns {boolean}
 * @Params {string} string
 * @method isNum(string)
 */
export const isNum = (string) => {
    const reg = /^[0-9]+.?[0-9]*$/
    return reg.test(string)
}

/**
 * @desc 判断用户名不能包含中文跟特殊字符
 * @returns {boolean}
 * @Params {string} string
 * @method isUsername(string)
 */
export const isUsername = (string) => {
    const reg = /^[a-zA-Z0-9_]{0,}$/
    return reg.test(string)
}

/**
 * @desc 判断是否为object
 * @Params {obj}
 * @returns {boolean}
 * @method isObject(obj)
 */
export const isObject = (obj) => {
    return (obj && typeof obj === 'object' && !Array.isArray(obj))
}

/**
 * @desc 判断Json字符串是否为正确的Json格式
 * @returns {boolean}
 * @Params {obj}
 * @method isJson(obj)
 */
export const isJson = (obj) => {
    if (typeof obj === 'string') {
        try {
            const objFormat = JSON.parse(obj)
            return typeof objFormat === 'object' && objFormat
        } catch (e) {
            return false
        }
    } else {
        return Object.prototype.toString.call(obj) === '[object Object]'
    }
}

/**
 * @desc 判断是否为数组
 * @returns {boolean}
 * @Params {arr}
 * @method isArray(arr)
 */
export const isArray = (arr) => {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(arr)
    } else {
        return Object.prototype.toString.call(arr) === '[object Array]'
    }
}

/**
 * @desc 判断是否为ArrayBuffer
 * @returns {boolean}
 * @Params {buffer}
 * @method isArrayBuffer(buffer)
 */
export const isArrayBuffer = (buffer) => {
    return Object.prototype.toString.call(buffer) === '[object ArrayBuffer]'
}

/**
 * @desc 格式化时间，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * @returns {string}
 * @Params {date, fmt}
 * @method formatTime(time, "yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *         formatTime(time, "yyyy.M.d h:m:s.S")      ==> 2006.7.2 8:9:4.18
 */
export const formatTime = (date, fmt) => {
    const This = new Date(date)
    const o = {
        'M+': This.getMonth() + 1, // 月份
        'd+': This.getDate(), // 日
        'h+': This.getHours(), // 小时
        'm+': This.getMinutes(), // 分
        's+': This.getSeconds(), // 秒
        'q+': Math.floor((This.getMonth() + 3) / 3), // 季度
        'S': This.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (This.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
    }
    return fmt
}

/**
 * @desc 格式化时间: 小于1分钟-刚刚, 小于1小时-多少分钟前, 小于1天-多少小时前, 其它-年/月/日
 * @returns {string}
 * @Params {publishTime, requestTime, mode} publishTime当前时间, requestTime服务器时间, mode参考formatTime格式{hour, day, year}
 * @method formatPublishTime(publishTime, requestTime, mode)
 */
export const formatPublishTime = (publishTime, requestTime, mode) => {
    let hourMode = 'hh:mm'
    let dayMode = 'MM月dd日 hh:mm'
    let yearMode = 'yyyy-MM-dd hh:mm'
    if (mode) {
        if (mode.hour) hourMode = mode.hour
        if (mode.day) dayMode = mode.day
        if (mode.year) yearMode = mode.year
    }
    requestTime = !requestTime ? new Date().getTime() : requestTime
    const limit = parseInt((requestTime - publishTime)) / 1000
    if (limit < 60) {
        return '刚刚'
    } else if (limit >= 60 && limit < 3600) {
        return Math.floor(limit / 60) + '分钟前'
    } else if (limit >= 3600 && limit < 86400) {
        return Math.floor(limit / 3600) + '小时前'
    } else {
        const timeFormat = isThisYear(publishTime, requestTime) ? (isToday(publishTime, requestTime) ? hourMode : dayMode) : yearMode
        return formatTime(publishTime, timeFormat)
    }
}

/**
 * @desc 判断是否为今日
 * @returns {boolean}
 * @Params {timestamp}
 * @method isToday(timestamp)
 */
export const isToday = (date, serverTime) => {
    return new Date(date).toDateString() === (serverTime ? new Date(serverTime).toDateString() : new Date().toDateString())
}

/**
 * @desc 判断是否为今年
 * @returns {boolean}
 * @Params {timestamp}
 * @method isThisYear(timestamp)
 */
export const isThisYear = (date, serverTime) => {
    return new Date(date).getFullYear() === (serverTime ? new Date(serverTime).getFullYear() : new Date().getFullYear())
}

/**
 * @desc 图片转blob
 * @returns {blob}
 * @Params {dataurl}
 * @method dataURLtoBlob(dataurl)
 */
export const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}

/**
 * @desc 数组根据数组对象中的某个属性值进行排序的方法
 * @param {filed, rev, primer} 排序的属性-如number属性, rev: true表示升序排列false降序排序
 * @method myArray.sort(sortBy('number', false, parseFloat)) 表示根据number属性降序排列
 * */
export const sortBy = (filed, rev, primer) => {
    rev = rev ? 1 : -1
    return function (a, b) {
        a = a[filed]
        b = b[filed]
        if (typeof (primer) !== 'undefined') {
            a = primer(a)
            b = primer(b)
        }
        if (a < b) {
            return rev * -1
        }
        if (a > b) {
            return rev * 1
        }
        return 1
    }
}

/**
 * @desc js除法，避免任何数字除以0为Infinity
 * @returns {number}
 * @Params {divisor, dividend} divisor除数, dividend被除数
 * @method numDivision(divisor, dividend)
 */
export const numDivision = (divisor, dividend) => {
    if (!dividend) return dividend
    return dividend === 0 ? 0 : divisor / dividend
}

/**
 * @desc 去除字符串两边空格
 * @returns {string}
 * @Params {string} string
 * @method trim(string)
 */
export const trim = (string) => {
    return string.replace(/(^\s*)|(\s*$)/g, '')
}

/**
 * @desc 获取地址栏参数
 * @returns {value}
 * @Params {key}
 * @method queryParam(key)
 */
export const queryParam = (key) => {
    let reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)')
    let result = window.location.search.substr(1).match(reg)
    return result ? decodeURIComponent(result[2]) : null
}

/**
 * @desc 自定义属性继承，去除route相关：history、location、match、staticContext、route、 dispatch
 * @returns {props}
 * @Params {props}
 * @method propsInherit(props)
 */
export const propsInherit = (props) => {
    const newsProps = {}
    for (let key in props) {
        if (key !== 'history' && key !== 'location' && key !== 'match' && key !== 'staticContext' && key !== 'route' && key !== 'dispatch') {
            newsProps[key] = props[key]
        }
    }

    return newsProps
}

/**
 * @desc 滚动条的滚动位置
 * @returns {top,  left}
 * @method scrollOffset(ele)
 */
export const scrollOffset = (ele) => {
    if (ele) {
        return {
            left: ele.scrollLeft,
            top: ele.scrollTop
        }
    }
    if (window.pageXOffset) {
        return {
            left: window.pageXOffset,
            top: window.pageYOffset
        }
    } else {
        const el = document.scrollingElement || document.documentElement
        return {
            left: el.scrollLeft,
            top: el.scrollTop
        }
    }
}

/**
 * @desc 可视区域高宽
 * @returns {width,  height}
 * @method windowOffset()
 */
export const windowOffset = () => {
    if (window.innerHeight) {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    } else {
        if (document.compatMode === 1) {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeght
            }
        } else {
            return {
                width: document.body.clientWidth,
                height: document.body.clientHeght
            }
        }
    }
}

/**
 * @desc 获取元素相对于文档的绝对位置和高宽/getBoundingClientRect元素相对于可视区域的位置与高宽
 * @returns {top,  left}
 * @method elementOffset()
 */
export const elementOffset = (ele, scrollEle) => {
    const scrollTop = scrollEle ? scrollOffset(scrollEle).top : scrollOffset().top
    const scrollLeft = scrollEle ? scrollOffset(scrollEle).left : scrollOffset().left
    return {
        top: (ele && ele.getBoundingClientRect().top) + scrollTop,
        left: (ele && ele.getBoundingClientRect().left) + scrollLeft,
        bottom: (ele && ele.getBoundingClientRect().bottom) + scrollTop,
        right: (ele && ele.getBoundingClientRect().right) + scrollLeft,
        height: ele && ele.getBoundingClientRect().height,
        width: ele && ele.getBoundingClientRect().width,
        naturalWidth: ele && ele.naturalWidth,
        naturalHeight: ele && ele.naturalHeight
    }
}

/**
 * @desc 获取鼠标相对于文档的坐标/离可视区域的用clientX+clientY
 * @returns {top,  left}
 * @method mouseOffset()
 */
export const mouseOffset = (event) => {
    const e = event || window.event
    if (!e) return { x: 0, y: 0 }
    const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
    const scrollY = document.documentElement.scrollTop || document.body.scrollTop
    return {
        x: e.pageX || e.clientX + scrollX || 0,
        y: e.pageY || e.clientY + scrollY || 0
    }
}

/**
 * @desc window滚动，可判断滚动方向：上下
 * @method windowScroll(function(direction){
 * direction === 'down' / 'up'
 * })
 */
export const windowScroll = (callback, element) => {
    let beforeScrollTop = scrollOffset().top

    const scrollFunc = () => {
        const afterScrollTop = element ? scrollOffset(element).top : scrollOffset().top
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) return false
        callback.call(this, delta > 0 ? 'down' : 'up')
        beforeScrollTop = afterScrollTop
    }
    if (element) {
        element.addEventListener('scroll', scrollFunc, false)
    } else {
        window.addEventListener('scroll', scrollFunc, false)
    }

    return scrollFunc
}

/**
 * @desc 动画函数: 暂未实现贝塞尔, 恒定速度。不传time则直接系统默认动画
 * @params {from, to, speed, callback}
 * @method animation()
 */
export const animation = (params) => {
    const { from, to, time, callback } = params

    if (typeof from === 'undefined') throw Error('from is required')
    if (typeof to === 'undefined') throw Error('to is required')
    if (!callback) throw Error('callback is required')

    const startNum = parseFloat(from)
    const endNum = parseFloat(to)
    const totalTime = parseFloat(time)
    let currentVal = startNum

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

    function getReqCallback () {
        // let count = 0 // 记录总共运行次数
        let start = null // 标识是否第一次调用，首次复制给lastTimestamp
        let lastTimestamp = null // 记录每次调用时间
        let delta = 0 // 相邻调用相隔时间
        return function req (timestamp) {
            if (time !== 0 && !time) { // 此逻辑是为了如果不传time，则系统自动动画。添加贝塞尔和恒定速度功能之后，此逻辑可删除
                const residueDistance = Math.abs(currentVal - endNum)
                const calNum = (residueDistance > 1 && currentVal / 8 > 1) ? (residueDistance < currentVal / 8 ? residueDistance : currentVal / 8) : 1

                const recursionFunc = () => {
                    callback.call(this, currentVal)
                    if (currentVal === endNum || currentVal < 1) return false
                    requestAnimationFrame(req)
                }
                if (startNum > endNum) {
                    currentVal = currentVal - calNum
                    if (currentVal >= endNum) {
                        recursionFunc()
                    }
                }
                if (startNum < endNum) {
                    currentVal = currentVal + calNum
                    if (currentVal <= endNum) {
                        recursionFunc()
                    }
                }
            } else {
                // 获取每次调用时间间隔
                if (start === null) {
                    start = timestamp
                    lastTimestamp = timestamp
                }
                delta = timestamp - lastTimestamp
                // count ++

                // @desc 计算每次帧刷新偏移量
                // 以秒s为计算单位
                // 速度speed = 里程totalDistance / 时间totalTime
                // 帧率fps = 1000 / delta:requestAnimationFrame调用时间间隔
                // 每次帧刷新变化数量everyTimeDistance: 速度/帧率
                const totalDistance = Math.abs(startNum - endNum)
                const speed = totalTime !== 0 ? totalDistance / totalTime * 1000 : 0
                const fps = delta !== 0 ? 1000 / delta : 0
                const everyTimeDistance = (fps !== 0 && speed !== 0) ? speed / fps : 0

                // 是否为第一次调用，不是则判断剩余可偏移值是否大于everyTimeDistance(大于则取everyTimeDistance否则取剩余值)，是则用everyTimeDistance
                const distance = Math.abs(currentVal - endNum) > everyTimeDistance ? everyTimeDistance : Math.abs(currentVal - endNum)

                // js中任何数除以0 都是 Infinity
                if (totalTime < delta) {
                    currentVal = endNum
                    callback.call(this, currentVal)
                    return
                }

                // 递归调用
                const recursionFunc = () => {
                    callback.call(this, currentVal)
                    if (currentVal === endNum) return false
                    lastTimestamp = timestamp
                    requestAnimationFrame(req)
                }

                // 开始数字>结束数字
                if (startNum > endNum) {
                    currentVal = currentVal - distance
                    if (currentVal >= endNum) {
                        recursionFunc()
                    }
                }

                // 开始数字<结束数字
                if (startNum < endNum) {
                    currentVal = currentVal + distance
                    if (currentVal <= endNum) {
                        recursionFunc()
                    }
                }
            }
        }
    }

    requestAnimationFrame(getReqCallback())
}

/**
 * @desc 到达dom元素位置
 * @params {} args: ($ele, time);
 * 传一个参数若数据类型为string/number则为time，否则为js选择器$ele;
 * 传俩参数($ele, time);
 * 传仨参数($ele, time, { add: -100 }更多的参数放在此对象中传递，add表示在$ele位置加或者减去一定的距离--避免共用头部遮挡等情况)
 * @method arriveAtDom($ele, time)
 * @eg arriveAtDom(document.getElementById('test'), 500, { add: -100 })
 */
export const arriveAtDom = (...args) => {
    let $ele
    let time
    let additionalParams = { // 更多的参数放在此对象中传递
        add: false
    }
    if (typeof args[0] === 'string' || typeof args[0] === 'number') {
        time = args[0]
    } else {
        $ele = args[0]
        time = args[1]
        if (args[2]) additionalParams = Object.assign(additionalParams, args[2])
    }
    animation({
        from: document.documentElement.scrollTop || document.body.scrollTop,
        to: $ele ? (additionalParams.add ? elementOffset($ele).top + additionalParams.add : elementOffset($ele).top) : 0,
        time: time,
        callback: function (currentVal) {
            document.documentElement.scrollTop = currentVal
            document.body.scrollTop = currentVal
        }
    })
}

/**
 * @desc 深度比较object是否相等
 * @params {x, y}
 * @method deepCompare(x, y)
 */
export const deepCompare = function (x, y) {
    let i
    let l
    let leftChain
    let rightChain

    function compare2Objects (x, y) {
        let p

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') return true

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) return true

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString()
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) return false

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) return false

        if (x.constructor !== y.constructor) return false

        if (x.prototype !== y.prototype) return false

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) return false

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false
            } else if (typeof y[p] !== typeof x[p]) {
                return false
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false
            } else if (typeof y[p] !== typeof x[p]) {
                return false
            }
            switch (typeof (x[p])) {
                case 'object':
                case 'function':
                    leftChain.push(x)
                    rightChain.push(y)
                    if (!compare2Objects(x[p], y[p])) return false
                    leftChain.pop()
                    rightChain.pop()
                    break
                default:
                    if (x[p] !== y[p]) return false
                    break
            }
        }
        return true
    }

    if (arguments.length < 1) {
        return true
        // Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }
    for (i = 1, l = arguments.length; i < l; i++) {
        leftChain = [] // Todo: this can be cached
        rightChain = []
        if (!compare2Objects(arguments[0], arguments[i])) return false
    }
    return true
}

/**
 * @desc 深度合并对象immutable
 * @params {...objects}
 * @return object
 * @method deepMerge(...objects)
 */
export const deepMerge = (...objects) => {
    const isObject = obj => obj && typeof obj === 'object'

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key]
            const oVal = obj[key]

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal)
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = deepMerge(pVal, oVal)
            } else {
                prev[key] = oVal
            }
        })

        return prev
    }, {})
}

/**
 * @desc 获取数组最大最小值
 * @params {arr}
 * @return {max, min}
 */
export const arrayMaxMin = (arr) => {
    return {
        max: Math.max.apply(null, arr),
        min: Math.min.apply(null, arr)
    }
}

/**
 * @desc 将科学计数法转换为小数
 * @params {num}
 * @return {num}
 */
export const toNonExponential = (num) => {
    const newNum = Number(num)
    const m = newNum.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
    return newNum.toFixed(Math.max(0, (m[1] || '').length - m[2]))
}

/**
 * @desc 添加事件
 * @params {ele, evType, fn, useCapture}
 */
export const addEvent = (ele, evType, fn, useCapture) => {
    if (ele.addEventListener) {
        ele.addEventListener(evType, fn, useCapture || !1)
        return true
    } else if (ele.attachEvent) {
        var r = ele.attachEvent('on' + evType, fn)
        return r
    } else {
        ele['on' + evType] = fn
    }
}

/**
 * @desc 字符串截取，一个中文和中文字符占2个字节
 * @params {text, length字节数}
 * @method textOverflow(text, length)
 * */
export const textOverflow = (text, length) => {
    if (text.replace(/[^\x00-\xff]/g, 'aa').length <= length) {
        return text
    } else {
        let _length = 0
        let outputText = ''
        for (let i = 0; i < text.length; i++) {
            if (/[^\x00-\xff]/.test(text[i])) {
                _length += 2
            } else {
                _length += 1
            }
            if (_length > length) {
                break
            } else {
                outputText += text[i]
            }
        }
        return outputText + '...'
    }
}

/**
 * @desc 字符串长度
 * @params {text}
 * @method textLength(text)
 * */
export const textLength = (text) => text.replace(/[^\x00-\xff]/g, 'aa').length

/**
 * @desc 加载图片，直到加载完成后才调用回调函数
 * @param url 后面读取图片流的url
 * @param callback 回调函数
 */
export const loadImage = (url, callback) => {
    const img = new Image()
    img.src = url
    if (img.complete) {
        if (callback) callback(img)
    } else {
        img.onload = function () {
            if (callback) callback(img)
        }
    }
    img.onerror = function () {}
}

/**
 * @desc 对查询关键字中的特殊字符进行编码
 * @params {key}
 * @method encodeSearchKey(key)
 * */
export const encodeSearchKey = (key) => {
    if (!key) return
    const encodeArr = [{
        code: '%',
        encode: '%25'
    }, {
        code: '?',
        encode: '%3F'
    }, {
        code: '#',
        encode: '%23'
    }, {
        code: '&',
        encode: '%26'
    }, {
        code: '=',
        encode: '%3D'
    }]
    return key.replace(/[%?#&=]/g, ($, index, str) => {
        for (const k of encodeArr) {
            if (k.code === $) return k.encode
        }
    })
}

/**
 * @desc 生成uuid 全局唯一标识符（GUID，Globally Unique Identifier）也称作 UUID(Universally Unique IDentifier)
 * @method uuid()
 * */
export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

/**
 * @desc 生成uuid，自定义长度与基数
 * @params {len, radix} len长度, radix基数
 * @method uuidDiy(len, radix)
 * @eg
 // 8 character ID (base=2)
 uuid(8, 2) => "01001010"
 // 8 character ID (base=10)
 uuid(8, 10) => "47473046"
 // 8 character ID (base=16)
 uuid(8, 16) => "098F4D35"
 * */
export const uuidDiy = (len, radix) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    let uuid = []
    let i
    radix = radix || chars.length

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
        // rfc4122, version 4 form
        let r

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        // Fill in random data. At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }
    return uuid.join('')
}

/**
 * @desc 移动计算宽高
 * @Params {Value}
 * @method rem(Value) // Value像素值
 */
export const rem = ($pixelValue) => {
    return ($pixelValue / 24) + 'rem'
}

/**
 * @desc 四舍五入法
 * @Params {Value}
 * @method numToFixed(Value, n)
 */
export const numToFixed = (value, n) => {
    return Math.round(parseFloat(value).toFixed(10) * Math.pow(10, n)) / Math.pow(10, n)
}

/**
 * @desc 去尾法
 * @Params {Value, n}
 * @method numToFloor(value, n)
 */
export const numToFloor = function (value, n) {
    return Math.floor(parseFloat(value).toFixed(10) * Math.pow(10, n)) / Math.pow(10, n)
}

/**
 * @desc 进一法
 * @Params {Value}
 * @method numToCeil(value, n)
 */
export const numToCeil = function (value, n) {
    return Math.ceil(parseFloat(value).toFixed(10) * Math.pow(10, n)) / Math.pow(10, n)
}

/**
 * @desc rgb颜色转16进制表示法
 * @Params {#****}
 * @method colorHex(color)
 */
export const colorHex = (color) => {
    const that = color
    // 十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(that)) {
        const aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
        let strHex = '#'
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16)
            if (hex === '0') {
                hex += hex
            }
            strHex += hex
        }
        if (strHex.length !== 7) {
            strHex = that
        }
        return strHex
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/, '').split('')
        if (aNum.length === 6) {
            return that
        } else if (aNum.length === 3) {
            var numHex = '#'
            for (let i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i])
            }
            return numHex
        }
    }
    return that
}

/**
 * @desc 颜色16进制表示法转rgb
 * @Params {rgba()}
 * @method colorRgb(color)
 */
export const colorRgb = (color) => {
    let sColor = color.toLowerCase()
    // 十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            let sColorNew = '#'
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
            }
            sColor = sColorNew
        }
        // 处理六位的颜色值
        var sColorChange = []
        for (let i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
        }
        return 'RGB(' + sColorChange.join(',') + ')'
    }
    return sColor
}

/**
 * @desc 全站默认TDK
 */
export const webTdk = {
    title: 'DOMILIN-品质源于用心',
    keywords: '哆咪严选,哆咪精选,哆咪书签,哆咪博文,哆咪海报',
    description: '原创优质应用，与用户共同成长'
}
export const webTdkFavorite = {
    title: 'DOMILIN 哆咪书签',
    keywords: '哆咪书签,哆咪收藏,哆咪主页,哆咪自定义主页,哆咪个性主页,哆咪新标签页,哆咪起始页,哆咪网址导航',
    description: '哆咪书签-应用随处可用：手机、平板、PC、浏览器扩展多端适用，随心自定义个性主页'
}
export const webTdkArticle = {
    title: 'DOMILIN 哆咪博文',
    keywords: '哆咪博文,哆咪教程,哆咪前端',
    description: '哆咪博文-精选优质博文：简单纯粹的博文发布平台'
}
// 前端开发导航,后端开发导航,UI设计导航,平面设计导航,影视后期导航

/**
 * @desc 公用cookie全部存以此为出口。
 */
export const cookiesName = {
    userId: 'domilin_id',
    userName: 'domilin_userName',
    token: 'domilin_token',
    uuidkey: 'domilin_uuidkey',
    theme: 'domilin_theme',
    lang: 'domilin_lang'
}

/**
 * @desc 网址图标: 选择与显示类型
 */
export const siteIconType = ['official', 'character', 'image']

/**
 * @desc 网址图标背景颜色
 */
export const iconBackgroundColor = [
    'rgb(0, 168, 45)',
    'rgb(238, 59, 59)',
    'rgb(252, 177, 56)',
    'rgb(133, 215, 36)',
    'rgb(22, 217, 196)',
    'rgb(39, 108, 230)',
    'rgb(147, 38, 233)',
    'rgb(51, 51, 51)',
    'rgb(245, 245, 245)',
    'transparent'
]

/**
 * @desc 点击图标、搜索结果打开方式
 */
export const openWayOtions = [
    { value: 'blank', name: '新标签页' },
    { value: 'self', name: '当前标签页' }
]

/**
 * @desc 天气默认城市---北京
 */
export const defaultWeatherCity = '101010100'

/**
 * @desc 移动端文章列表、网站列表，跳转到当前频道或分类
 */
export const goCurType = (arr, curId, type) => {
    if (typeof window === 'undefined') return

    const scroll = document.getElementById('categoryTitleScroll')
    let curKey = null
    for (let key in arr) {
        if (arr[key]._id === curId) {
            curKey = parseInt(key) + (type === 'article' ? 1 : 0) // 文章需要加上“全部”按钮宽度
            break
        }
    }
    if (curKey === null) return

    const titleEle = document.getElementById('categoryTitle').children
    const curStyle = elementOffset(titleEle[curKey])
    const eleLeft = curStyle.left
    const winWidth = windowOffset().width - 32 - 20 // css宽度 - 左右边距 - 16px的容差(当前频道可视范围内)
    if (eleLeft < 16) {
        scroll.scrollLeft = 0
    }
    if (eleLeft > winWidth) {
        // 减去左边距 - 分类之间的间距 - 单个分类的右边距(使其左边上一个分类在可视范围内)
        scroll.scrollLeft = curStyle.left - 32 - 20
    }
}

/**
 * @desc 我的主页,未登录默认展示分类与网址
 */
export const noLoginDefaultLevelsSites = ({ levelSite, dispatch }) => {
    // 分类
    if (!levelSite[0] || levelSite[0].code !== 1 || !Array.isArray(levelSite[0].data)) throw Error('FirstLevel Get Error')
    const secondLevels = []
    levelSite[0].data.map(function (item, index) {
        secondLevels.push({
            _id: item._id,
            name: item.name,
            icon: item.icon,
            sort: item.sort
        })
    })
    dispatch.user.levelsSet(secondLevels)
    dispatch.user.setCurlevel(secondLevels.length > 0 ? secondLevels[0]._id : null)

    // 生成网站图标
    if (!levelSite[1] || levelSite[1].code !== 1 || !Array.isArray(levelSite[1].data.list)) throw Error('Website Get Error')
    let websiteList = []
    if (levelSite[1].data.list.length > 5) { // 大于5个创建文件夹
        const folderIdTmp = new Date().getTime()
        const folderChildrenList = []
        const siteList = []

        levelSite[1].data.list.map(function (item, index) {
            const itemSite = {
                _id: item._id,
                name: item.name,
                sort: index,
                icon: item.icon,
                iconType: 'official',
                officialIcon: item.icon,
                intro: item.intro,
                url: item.url,
                background: item.background,
                levelId: item.recommendSecondLevelId
            }
            if (index < 4) {
                itemSite.folderId = folderIdTmp
                folderChildrenList.push(itemSite)
            } else {
                siteList.push(itemSite)
            }
        })

        const folderExample = {
            _id: folderIdTmp,
            levelId: secondLevels[0]._id,
            name: '文件夹',
            sort: 0,
            type: 'folder',
            children: folderChildrenList
        }
        websiteList = [folderExample].concat(siteList)
    } else { // 小于5个默认直接展示
        levelSite[1].data.list.map(function (item, index) {
            websiteList.push({
                _id: item._id,
                name: item.name,
                sort: index,
                icon: item.icon,
                iconType: 'official',
                officialIcon: item.icon,
                intro: item.intro,
                url: item.url,
                background: item.background,
                levelId: item.recommendSecondLevelId
            })
        })
    }

    dispatch.user.sitesSet(websiteList)
}

/**
 * @desc 待机页获取时间
 */
const weeksChinese = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
export const getStandbyTime = (hours) => {
    const day = weeksChinese[dayjs().day()]
    const solar = dayjs().format(`YYYY/MM/DD-${hours}:mm:ss`).split('-')

    const solarArr = solar[0].split('/')
    const year = solarArr[0]
    const mouth = solarArr[1]
    const date = solarArr[2]
    const lunar = calendar.solar2lunar(year, mouth, date)
    return {
        solar: `${year}年${mouth}月${date}日${day}`,
        time: solar[1],
        lunar: `${lunar.gzYear}年${lunar.IMonthCn}${lunar.IDayCn}`
    }
}

export default {
    axiosAjax,
    websocket,
    uerserAgent,
    isPc,
    isIos,
    isIphoneX,
    isAndroid,
    isWechat,
    isChromeExtension,
    isPhone,
    isUrl,
    isPsd,
    isEmail,
    isNum,
    isJson,
    isArrayBuffer,
    isArray,
    isObject,
    isToday,
    isThisYear,
    formatTime,
    formatPublishTime,
    numDivision,
    trim,
    toNonExponential,
    encodeSearchKey,
    dataURLtoBlob,
    sortBy,
    queryParam,
    propsInherit,
    scrollOffset,
    windowOffset,
    elementOffset,
    mouseOffset,
    windowScroll,
    animation,
    arriveAtDom,
    deepCompare,
    deepMerge,
    webTdk,
    webTdkArticle,
    webTdkFavorite,
    cookiesName,
    siteIconType,
    textOverflow,
    textLength,
    loadImage,
    arrayMaxMin,
    rem,
    uuid,
    uuidDiy,
    logReport,
    addEvent,
    numToFixed,
    numToFloor,
    numToCeil,
    colorHex,
    colorRgb,
    goCurType,
    chromeCookie,
    noLoginDefaultLevelsSites,
    getStandbyTime
}
