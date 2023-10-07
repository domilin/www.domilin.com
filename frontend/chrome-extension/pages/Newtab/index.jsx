import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { logReport } from '@/public/js'
import ErrorBoundary from '@/components/ErrorBoundary'
import configureStore from '@browser/store'
import App from './App'

// 引入manifest.json，让webpack拷贝进build目录，否则manifest.json无法找到此图片
import '../../public/icons/extension-icon-x16.png'
import '../../public/icons/extension-icon-x32.png'
import '../../public/icons/extension-icon-x48.png'
import '../../public/icons/extension-icon-x128.png'
import '../../public/icons/logo-blue.png'

const background = chrome.extension.getBackgroundPage()
const state = background.window.storeState
if (state) {
    document.body.setAttribute('data-theme', state.public.userInfo.theme || 'light')
}
const store = configureStore(state)
window.reduxStore = store // 挂载到全局对象上，ajax未登录时使用
window.pageType = 'newTab' // 页面类型，用户通过类型判断交互行为，如：我的主页网址在newtab为当前页面打开，popup为新标签页打开

// ErrorBoundary不能捕获异步与事件处理错误，用原生JS的error监控
// const logErrorToServer = () => {}
window.onerror = function (message, source, lineno, colno, error) {
    logReport({
        message: 'client-app-err-window',
        errMsg: message,
        timestampClient: new Date().getTime(),
        source,
        lineno,
        colno,
        stack: error && error.stack,
        framework: true
    })
}

ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </HashRouter>
    </Provider>,
    document.getElementById('root')
)
