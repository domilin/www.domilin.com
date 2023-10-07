import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { matchRoutes } from 'react-router-config'
import Cookies from 'js-cookie'

import { webTdk, propsInherit, logReport, cookiesName } from '../assets/public/js/index'
import App from '../assets/App'

const { title, description, keywords } = webTdk

class AppWrapper extends Component {
    constructor (props) {
        super(props)
        this.state = { hasError: false, error: null, errHtml: null }
        const { history, dispatch } = props

        /** @desc 前端路由更改时一般使用react-router的Link跳转，走此逻辑跟node的render.js逻辑一致 */
        const store = { dispatch: dispatch }
        const This = this
        history.listen((location) => {
            const routesParam = App.routes().routes
            const branch = matchRoutes(routesParam, location.pathname)
            const promises = branch.map(({ route, match }) => {
                const getInitialProps = route.component.getInitialProps
                return getInitialProps instanceof Function ? getInitialProps({
                    history,
                    match,
                    store,
                    isServer: false
                }) : Promise.resolve(null)
            })

            // 用户登录信息
            promises.push(
                store.dispatch.public.setUserInfo({
                    userId: Cookies.get(cookiesName.userId),
                    userName: Cookies.get(cookiesName.userName),
                    token: Cookies.get(cookiesName.token)
                })
            )

            // 默认数据请求
            let initProps = {}
            Promise.all(promises).then((data) => {
                data.map((item) => {
                    const isObj = Object.prototype.toString.call(item) === '[object Object]' // 排除undefined，null等
                    const notGetUserInfo = isObj && (!item.hasOwnProperty('type') || item.type !== 'get-user-info') && !item.hasOwnProperty('data') // 排除获取用户登录信息actions返回
                    if (isObj && notGetUserInfo) {
                        initProps = Object.assign(initProps, item)
                    }
                })

                // 设置默认state，跟server/render中传递到app属性initProps功能相同，此处用在前端路由Link切换
                This.setState({
                    ...initProps
                })

                const defTitle = initProps.title ? initProps.title : title
                const defDescription = initProps.description ? initProps.description : description
                const defKeywords = initProps.keywords ? initProps.keywords : keywords

                const metas = document.getElementsByTagName('meta')
                metas[0].content = defKeywords
                metas[1].content = defDescription
                document.title = defTitle

                // 前端跳转未实现以下更新: wxShareTitle, wxShareDesc, wxShareIcon, clientLink, meta-itemprop, myStyles, myScripts, scripts, styles
            }).catch((err) => {
                throw Error(err)
            })
        })
    }

    static getDerivedStateFromError (err) {
        // 更新state使下一次渲染能够显示降级后的 UI
        return {
            hasError: true,
            error: err,
            errHtml: document.getElementById('root').innerHTML.replace(/<script.*?>.*?<\/script>/ig, '') // 获取到当前展示的默认页面内容，出现错误后仍然展示此内容。移除掉其中素有的script标签
        }
    }

    componentDidCatch (err, errInfo) {
        // 将错误日志上报给服务器，此处上报react搜集的错误信息，可定位到具体组件更好定位
        // 在broswer/index.js中同时又window.onerror事件错误捕获。同时可捕获异步错误
        // 运行时错误此处与window.onerror都能捕获，可通过timestampClient+userAgent(node添加)+ip(node添加)更加精确的定位错误信息
        // 注: 不能捕获异步错误, 不能捕获事件错误
        logReport({
            message: 'client-app-err-react',
            errMsg: err.message,
            timestampClient: new Date().getTime(),
            componentStack: errInfo.componentStack,
            stack: err.stack,
            framework: true
        })
    }

    render () {
        if (this.state.hasError) {
            // 这里自定义降级后的UI并渲染
            const { message, stack } = this.state.error
            // error-component-did-catch移动与pc的样式分别放在component-m/Layout与component/Layout中
            return <div className={`error-component-did-catch`}>
                <div className="error-message"><span>意外错误请稍等：{message}</span></div>
                <pre>{stack}</pre>
                {this.state.errHtml && <div dangerouslySetInnerHTML={{ __html: this.state.errHtml }} />}
            </div>
        }

        const combineProps = { ...propsInherit(this.props), ...this.state }
        return <App {...combineProps} />
    }
}

export default connect()(withRouter(AppWrapper))
