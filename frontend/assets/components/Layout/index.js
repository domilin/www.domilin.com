import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import Cookies from 'js-cookie'

import { propsInherit, cookiesName, isChromeExtension, chromeCookie } from '../../public/js/index'
import { useEffectAsync } from '../../public/hooks'
import Toast from '../Toast'
import { chromeFrontend } from '../../../config/config'
import { sidebars, themes } from '../../models/public'

import Header from './Header'
import Background from './Background'
import Standby from './Standby'
// import Footer from './Footer'

import './index.scss'

const Layout = (props) => {
    const { route } = props
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }))

    // --------------------------自定义设置对应的样式--------------------------
    // 侧边栏
    let contentStyle = {}
    if (userInfo) {
        const num = userInfo.sidebarAuto ? '0px' : (userInfo.sidebarNarrow ? '80px' : '212px')
        if (userInfo.sidebar === sidebars.left) {
            contentStyle = {
                paddingRight: '0',
                paddingLeft: num
            }
        }
        if (userInfo.sidebar === sidebars.right) {
            contentStyle = {
                paddingRight: num,
                paddingLeft: 0
            }
        }
    }

    // 主题跟随系统
    const darkMode = useRef(null)
    useEffectAsync(async () => {
        if (!window || !window.matchMedia) return
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (darkMode.current === isDark) return
        darkMode.current = isDark

        if (!userInfo || !('themeFollowSys' in userInfo) || !userInfo.themeFollowSys) return
        let theme = themes.light
        if (isDark) theme = themes.night
        if (isChromeExtension()) {
            await chromeCookie.set({
                url: chromeFrontend,
                key: cookiesName.theme,
                value: theme
            })
        } else {
            Cookies.set(cookiesName.theme, theme)
        }
        document.body.setAttribute('data-theme', theme)
        dispatch.public.settingData({ theme })

        if (!userInfo.userId) return
        const res = await dispatch.public.setting({ theme, noLoading: true })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch.public, userInfo])

    return <>
    <div className="layout-content" style={{ ...contentStyle }}>
        {renderRoutes(route.routes, { ...propsInherit(props) })}
    </div>
    <Background comp="layout"/>
    <Header/>
    {userInfo && userInfo.standbyOpen && userInfo.standbyOpen && <Standby/>}
    {/* <Footer/> */}
    </>
}

export default Layout
