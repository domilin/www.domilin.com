import React from 'react'
import { useSelector } from 'react-redux'

import './index.scss'

import bgTemp from '../../../../static/resource/images/layout-background-grey.jpg'
import { staticDomain } from '../../../../config/config'
import { wallTypes, themes } from '../../../models/public'

// type: layout/standby分别代表两个组件引入
export default ({ comp }) => {
    const { userInfo, officialWallpaper } = useSelector((state) => ({
        officialWallpaper: state.public.wallpaper,
        userInfo: state.public.userInfo
    }))

    // 背景
    let backgroundStyle = officialWallpaper
        ? { backgroundImage: `url(${staticDomain + officialWallpaper})` }
        : { backgroundImage: `url(${bgTemp})` }
    let backgroundEffectStyle = {}
    if (userInfo) {
        const type = userInfo.wallpaperType
        const bg = userInfo.wallpaper
        if (type === wallTypes.official) backgroundStyle = { backgroundImage: `url(${staticDomain + officialWallpaper})` }
        if (type === wallTypes.color) backgroundStyle = { backgroundColor: bg }
        if (type === wallTypes.custom) backgroundStyle = { backgroundImage: `url(${staticDomain + bg})` }
        if ((comp === 'layout' && userInfo.wallpaperBlur) || (comp === 'standby' && (!('standbyBgBlur' in userInfo) || userInfo.standbyBgBlur))) {
            backgroundEffectStyle.filter = 'blur(16px)'
            backgroundEffectStyle.transform = 'scale(1.2)'
        }
    }

    // 夜晚模式下背景图片也做相应的暗调处理
    let backgroundMaskStyle = userInfo && userInfo.theme === themes.night ? { opacity: 0.16 } : {}

    return <div
        className="layout-background-effect"
        style={{ ...backgroundEffectStyle }}>
        <div className="layout-background" style={{ ...backgroundStyle }}/>
        <div className="background-mask" style={{ ...backgroundMaskStyle }}></div>
    </div>
}
