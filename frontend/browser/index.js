import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { loadableReady } from '@loadable/component'
import Cookies from 'js-cookie'
import { I18nextProvider } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

import { isJson, logReport, cookiesName } from '../assets/public/js/index'
import configureStore from './store'
import AppWrapper from './AppWrapper'
import App from '../assets/App'
import i18n from './i18n'

// 默认语言
let lang = (navigator.language || navigator.userLanguage || 'zh').toLowerCase()
if (Cookies.get(cookiesName.lang)) lang = Cookies.get(cookiesName.lang)
i18n.changeLanguage(lang)
dayjs.locale(lang)

// import registerServiceWorker from './registerServiceWorker'

const store = configureStore(window.__INITIAL_STATE__)
const initProps = window.__INITIAL_PROPS__
const errObjProps = window._ERROBJPROPS_
window.reduxStore = store // 挂载到全局对象上，ajax未登录时使用

// 错误日志上报，可与browser/AppWrapper.js中react的componentDidCatch捕获一起组合查看。
// timestampClient+userAgent(node添加)+ip(node添加)
window.onerror = function (message, source, lineno, colno, error) {
    logReport({
        message: 'client-app-err-window',
        errMsg: message,
        timestampClient: new Date().getTime(),
        source: source,
        lineno: lineno,
        colno: colno,
        stack: error && error.stack,
        framework: true
    })
}

if (errObjProps && isJson(errObjProps)) { // 如果后端运行报错,会把报错信息存到全局变量_ERROBJPROPS_，前端运行时发现错误运行错误展示组件。逻辑跟后台一样
    const ErrorPage = App.ErrorPage
    loadableReady(() => {
        hydrate(<Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <ErrorPage {...errObjProps} />
                </BrowserRouter>
            </I18nextProvider>
        </Provider>, document.getElementById('root'))
    })
} else {
    loadableReady(() => {
        hydrate(<Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <AppWrapper {...initProps} />
                </BrowserRouter>
            </I18nextProvider>
        </Provider>, document.getElementById('root'))
        // registerServiceWorker()
    })
}
