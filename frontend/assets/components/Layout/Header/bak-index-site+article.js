import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import './index.scss'
import logo from '../../../public/imgs/logo-white.png'
import { staticDomain, frontendDomain } from '../../../../config/config'
import { sidebars } from '../../../models/public'
import { isChromeExtension } from '../../../public/js'
import MenuButton from './MenuButton'

export default () => {
    const dispatch = useDispatch()
    const { userInfo, firstLevel, curFirstLevel } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        firstLevel: state.website.firstLevel,
        curFirstLevel: state.website.curFirstLevel
    }))
    const { pathname } = useLocation()
    const [subItemShow, setSubItemShow] = useState(false)

    // 由于在useParams在Layout中获取不到路由参数，故需要自行截取firstLevelId
    useEffect(() => {
        if (pathname.indexOf('career/') === -1 || !firstLevel) return

        const path = pathname.split('career/')[1]
        let curFirstLevelId = ''
        if (path.indexOf('/') > -1) {
            curFirstLevelId = path.split('/')[0]
        } else {
            curFirstLevelId = path
        }

        for (let val of firstLevel) {
            if (curFirstLevelId === val._id) {
                dispatch.website.curFirstLevelSet(val)
                break
            }
        }
    }, [dispatch.website, firstLevel, pathname])

    // ---------------设置侧边导航栏位置, 侧边栏二级导航样式--------------------
    let headerStyle = {}
    let headerAutoStyle = {}
    let subItemStyle = {}
    let headerItemIconStyle = {}
    let headerItemWordsStyle = {}
    let avatarStyle = {}
    let curFirstLevelStyle = {}
    const [headerShow, setHeaderShow] = useState(false)
    if (userInfo && ('sidebar' in userInfo) && ('sidebarNarrow' in userInfo) && ('sidebarAuto' in userInfo)) {
        const isNarrow = userInfo.sidebarNarrow
        const isAuto = userInfo.sidebarAuto

        headerItemIconStyle = isNarrow
            ? { margin: 0, display: 'block', textAlign: 'center', width: '100%' }
            : { margin: '0 10px 0 32px' }
        headerItemWordsStyle = isNarrow ? { display: 'none' } : { display: 'block' }
        avatarStyle = isNarrow ? { width: '55px', height: '55px' } : { width: '70px', height: '70px' }
        curFirstLevelStyle = isNarrow ? { display: 'none' } : { display: 'block' }

        if (userInfo.sidebar === sidebars.left) {
            headerStyle = {
                left: !isAuto || headerShow ? '0' : (isNarrow ? '-80px' : '-212px'),
                right: 'initial'
            }
            headerAutoStyle = {
                left: '0',
                right: 'initial'
            }
            subItemStyle = {
                borderLeft: '1px solid #1778f0',
                borderRight: 'none',
                left: isNarrow ? '80px' : '212px',
                right: 'initial'
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
            subItemStyle = {
                borderLeft: 'none',
                borderRight: '1px solid #1778f0',
                left: 'initial',
                right: isNarrow ? '80px' : '212px'
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
                    <span>/</span>
                    <a href={`${frontendDomain}/login/signup`}>注册</a>
                </div>}
        </div>
        <div className="navigation">
            {/* <div className="item-up"><span className="iconfont">&#xe865;</span></div> */}
            <div className="item-content">
                {/* <a
                    href="/"
                    className={`item ${pathname === '/' ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe6b8;</span>
                    <i style={{ ...headerItemWordsStyle }}>哆咪推荐</i>
                </a> */}
                <a
                    href={`${frontendDomain}`}
                    className={`item ${pathname === '/' ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe6f1;</span>
                    <i style={{ ...headerItemWordsStyle }}>我的主页</i>
                </a>
                <a
                    href={`${frontendDomain}/article/channel`}
                    className={`item ${pathname.indexOf('/article/') > -1 ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe73d;</span>
                    <i style={{ ...headerItemWordsStyle }}>发现博文</i>
                </a>
                <div className="nav-career">
                    <a
                        className={`item ${pathname.indexOf('/career') > -1 ? 'active' : ''}`}>
                        <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe6c3;</span>
                        <i style={{ ...headerItemWordsStyle }}>严选优站</i>
                        <em className="iconfont">&#xe7ee;</em>
                        <div
                            style={{ ...curFirstLevelStyle }}
                            className="current-first-level">
                            {curFirstLevel && curFirstLevel.name}
                        </div>
                        <div
                            className="nav-career-button-mask"
                            onClick={() => {
                                const curFirstLevelId = Array.isArray(firstLevel) && firstLevel.length > 0 && firstLevel[0]._id
                                window.location.href = `${frontendDomain}/career/${curFirstLevelId || ''}`
                            }}
                            onMouseEnter={() => setSubItemShow(true)}
                            onMouseLeave={() => setSubItemShow(false)}
                        />
                    </a>
                    <div
                        onMouseEnter={() => setSubItemShow(true)}
                        onMouseLeave={() => setSubItemShow(false)}
                        className="sub-item"
                        style={{ ...subItemStyle, display: subItemShow ? 'flex' : 'none' }}>
                        {Array.isArray(firstLevel) && firstLevel.map(function (item, index) {
                            return <a
                                href={`${frontendDomain}/career/${item._id}`}
                                className={`item ${pathname.indexOf(item._id) > -1 ? 'active' : ''}`}
                                key={item._id}>
                                <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                                <i>{item.name}</i>
                            </a>
                        })}
                    </div>
                </div>
            </div>
            {/* <div className="item-down"><span className="iconfont">&#xe864;</span></div> */}
        </div>
        <div className="bottom">
            <a
                onClick={(event) => {
                    localStorage.removeItem('domilinArticle')
                    window.location.href = `${frontendDomain}/article/submit`
                }}
                className={`item ${pathname === '/article/submit' ? 'active' : ''}`}
                title="记录成长"
            >
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe761;</span>
                <i style={{ ...headerItemWordsStyle }}>创作</i>
            </a>
            <a
                href={`${frontendDomain}/setting`}
                className={`item ${pathname === '/setting' ? 'active' : ''}`}
            >
                <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe729;</span>
                <i style={{ ...headerItemWordsStyle }}>设置</i>
            </a>
        </div>
    </div>
    </>
}
