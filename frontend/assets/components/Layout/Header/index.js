import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import loadable from '@loadable/component'

import './index.scss'
import logo from '../../../public/imgs/logo-white.png'
import { staticDomain, frontendDomain } from '../../../../config/config'
import { sidebars } from '../../../models/public'
import { isChromeExtension } from '../../../public/js'
import MenuButton from './MenuButton'
// import Setting from '../Setting'

const Setting = loadable(() => import('../Setting'))

export default () => {
    const { userInfo, firstLevel } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        firstLevel: state.website.firstLevel,
        curFirstLevel: state.website.curFirstLevel
    }))
    const { pathname } = useLocation()
    const isArticle = pathname.indexOf('/article') > -1

    // ---------------设置侧边导航栏位置, 侧边栏二级导航样式--------------------
    let headerStyle = {}
    let headerAutoStyle = {}
    let headerNavMoreStyle = {}
    let headerItemIconStyle = {}
    let headerItemWordsStyle = {}
    let avatarStyle = {}
    let narrowHide = {}
    const [headerShow, setHeaderShow] = useState(false)
    if (userInfo) {
        const isNarrow = userInfo.sidebarNarrow
        const isAuto = userInfo.sidebarAuto

        headerItemIconStyle = isNarrow
            ? { margin: 0, display: 'block', textAlign: 'center', width: '100%' }
            : { margin: '0 10px 0 32px' }
        headerItemWordsStyle = isNarrow ? { display: 'none' } : { display: 'block' }
        avatarStyle = isNarrow ? { width: '55px', height: '55px' } : { width: '70px', height: '70px' }
        narrowHide = isNarrow ? { display: 'none' } : {}

        if (userInfo.sidebar === sidebars.left) {
            headerStyle = {
                left: !isAuto || headerShow ? '0' : (isNarrow ? '-80px' : '-212px'),
                right: 'initial'
            }
            headerAutoStyle = {
                left: '0',
                right: 'initial'
            }
            headerNavMoreStyle = {
                left: 'initial',
                right: '-160px',
                borderRight: 'none',
                borderLeft: '1px solid #1778f0'
            }
        }

        if (userInfo.sidebar === sidebars.right) {
            headerStyle = {
                left: 'initial',
                right: !isAuto || headerShow ? '0' : (isNarrow ? '-80px' : '-212px')
            }
            headerAutoStyle = {
                left: 'initial',
                right: '0'
            }
            headerNavMoreStyle = {
                left: '-160px',
                right: 'initial',
                borderRight: '1px solid #1778f0',
                borderLeft: 'none'
            }
        }

        headerStyle.width = isNarrow ? '80px' : '212px'
    }

    // ---------------移动端适配--------------------
    const [menuShow, setMenuShow] = useState(false)

    const [mounted, setMounted] = useState(null)
    useEffect(() => {
        if (isChromeExtension() && window.pageType && window.pageType === 'popup') return
        setMounted(true)
    }, [])

    // 弹出设置层
    const [settingShow, setSettingShow] = useState(false)

    // layout-content 如果侧边栏自动隐藏，则移入隐藏
    useEffect(() => {
        if (!userInfo || !userInfo.sidebarAuto) return
        const layoutContent = document.querySelector('.layout-content')
        layoutContent && layoutContent.addEventListener('mouseenter', function () {
            setHeaderShow(false)
        }, false)
    }, [userInfo])

    return <>
    {mounted && <MenuButton {...{ menuShow, setMenuShow }}/>}
    <div
        onClick={() => setMenuShow(false)}
        className={`layout-header-auto ${menuShow ? 'active' : ''}`}
        onMouseOver={() => setHeaderShow(true)}
        style={{ ...headerAutoStyle }}
    />
    <div
        onMouseLeave={() => setHeaderShow(false)}
        className={`layout-header ${menuShow ? 'active' : ''}`}
        style={{ ...headerStyle }}
    >
        <div className="user-info">
            <div className="avatar" style={{ ...avatarStyle }}>
                <img
                    style={{ transform: userInfo.avatar ? 'scale(1)' : 'scale(0.75)' }}
                    src={userInfo.avatar ? staticDomain + userInfo.avatar : logo}
                    alt="domilin"
                />
            </div>
            {userInfo.userId
                ? <div className="user-content">{userInfo.nickName || userInfo.email || userInfo.userName}</div>
                : <div className="login">
                    <a href={`${frontendDomain}/login/signin`}>登录</a>
                    <span style={{ ...narrowHide }}>/</span>
                    <a style={{ ...narrowHide }} href={`${frontendDomain}/login/signup`}>注册</a>
                </div>}
        </div>

        {/* ----------------------哆咪书签---------------------- */}
        <div className="navigation" style={{ display: !isArticle ? 'block' : 'none' }}>
            <a
                href={`${frontendDomain}`}
                className={`item ${pathname === '/' ? 'active' : ''}`}>
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe6f1;</span>
                <i style={{ ...headerItemWordsStyle }}>我的主页</i>
            </a>
            <div className="nav-career">
                {Array.isArray(firstLevel) && firstLevel.map(function (item, index) {
                    return <a
                        href={`${frontendDomain}/career/${item._id}`}
                        className={`item ${pathname.indexOf(item._id) > -1 ? 'active' : ''}`}
                        key={item._id}>
                        <span
                            style={{ ...headerItemIconStyle }}
                            className="iconfont"
                            dangerouslySetInnerHTML={{ __html: item.icon }}
                        />
                        <i style={{ ...headerItemWordsStyle }}>{item.name}</i>
                    </a>
                })}
            </div>
        </div>

        {/* ----------------------哆咪博文---------------------- */}
        <div className="navigation" style={{ display: isArticle ? 'block' : 'none' }}>
            <a
                onClick={(event) => {
                    localStorage.removeItem('domilinArticle')
                    window.location.href = `${frontendDomain}/article/submit`
                }}
                className={`item ${pathname === '/article/submit' ? 'active' : ''}`}>
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe761;</span>
                <i style={{ ...headerItemWordsStyle }}>我的创作</i>
            </a>
            <a
                href={`${frontendDomain}/article/channel`}
                className={`item ${pathname.indexOf('/article/channel') > -1 ? 'active' : ''}`}>
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe73d;</span>
                <i style={{ ...headerItemWordsStyle }}>发现博文</i>
            </a>
            <a
                href={`${frontendDomain}/article/album`}
                className={`item ${pathname.indexOf('/article/album') > -1 ? 'active' : ''}`}>
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe64d;</span>
                <i style={{ ...headerItemWordsStyle }}>精选专辑</i>
            </a>
        </div>

        <div className="bottom">
            {/* ----------------------设置---------------------- */}
            <a className="item setting" onClick={() => {
                setSettingShow(true)
                setMenuShow(false)
            }}>
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe729;</span>
                <i style={{ ...headerItemWordsStyle }}>设置</i>
            </a>

            {/* ----------------------更多---------------------- */}
            <div className="nav-more-wrapper">
                <a className="item">
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe778;</span>
                    <i style={{ ...headerItemWordsStyle }}>更多</i>
                    <em className="iconfont">&#xe7ee;</em>
                </a>
                <div className="nav-more" style={{ ...headerNavMoreStyle }}>
                    <a
                        target="_blank"
                        href={`${frontendDomain}/about`} className="item">
                        <span className="iconfont">&#xe741;</span>
                        <i>联系哆咪</i>
                    </a>
                    <a
                        target="_blank"
                        href={`${frontendDomain}/poster`} className="item">
                        <span className="iconfont">&#xe889;</span>
                        <i>哆咪海报</i>
                    </a>
                    <a
                        target="_blank"
                        style={{ display: !isArticle ? 'flex' : 'none' }}
                        href={`${frontendDomain}/article/channel`} className="item">
                        <span className="iconfont">&#xe742;</span>
                        <i>哆咪博文</i>
                    </a>
                    <a
                        target="_blank"
                        style={{ display: isArticle ? 'flex' : 'none' }}
                        href={`${frontendDomain}`} className="item">
                        <span className="iconfont">&#xe669;</span>
                        <i>哆咪书签</i>
                    </a>
                    {!isChromeExtension() && <>
                        <a className="item" target="_blank" href="https://chrome.google.com/webstore/detail/domilin-%E5%93%86%E5%92%AA%E6%94%B6%E8%97%8F/hdcgjmncpjljfbklfenmolahdmcbelmb?hl=zh-CN">
                            <span className="iconfont">&#xe723;</span>
                            <i>Chrome扩展</i>
                        </a>
                        <a className="item" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/domilin-%E5%93%86%E5%92%AA%E6%94%B6%E8%97%8F/nkmabclooecmniliohnmognpendnhoea?hl=zh-CN">
                            <span className="iconfont" style={{ transform: 'scale(1.22)' }}>&#xe953;</span>
                            <i>Edge扩展</i>
                        </a>
                        <a className="item" target="_blank" href={`/resource/extension/domilin-1-133.zip?v=${new Date().getDay()}`}>
                            <span className="iconfont" style={{ transform: 'scale(1.2)' }}>&#xe967;</span>
                            <i>下载扩展</i>
                        </a>
                    </>}
                </div>
            </div>
        </div>
    </div>
    <Setting show={settingShow} close={() => setSettingShow(false)}/>
    </>
}
