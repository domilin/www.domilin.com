import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Toast from '../../../components/Toast'
import './index.scss'
import logo from '../../../public/imgs/logo-white.png'
import { staticDomain } from '../../../../config/config'
import { sidebars } from '../../../models/public'
import { useCallbackAsync } from '../../../public/hooks'

export default () => {
    const { userInfo, firstLevel, secondLevel } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        firstLevel: state.website.firstLevel,
        secondLevel: state.website.secondLevel
    }))
    const dispatch = useDispatch()
    const { pathname } = useLocation()

    // 由于在useParams在Layout中获取不到路由参数，故需要自行截取firstLevelId
    const [firstLevelId, setFirstLevelId] = useState('')
    useEffect(() => {
        if (pathname.indexOf('career/') > -1) {
            const path = pathname.split('career/')[1]
            if (path.indexOf('#career') > -1) {
                setFirstLevelId(path.split('career/')[0])
            } else {
                setFirstLevelId(path)
            }
        }
    }, [pathname])

    const [subItemShow, setSubItemShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [curFirstLevel, setCurFirstLevel] = useState(firstLevelId)
    const getSecondLevel = useCallbackAsync(async (event) => {
        // 阻止合成事件的冒泡
        event.stopPropagation()
        // 阻止与原生事件的冒泡
        event.nativeEvent.stopImmediatePropagation()
        // 阻止默认事件
        event.preventDefault()

        if (loading) return

        const id = event.target.getAttribute('data-id')
        setCurFirstLevel(id)
        setLoading(true)

        const res = await dispatch.website.secondLevelGet(id)
        setLoading(false)
        setSubItemShow(true)

        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch.website, loading])

    // ---------------设置侧边导航栏位置, 侧边栏二级导航样式--------------------
    let headerStyle = {}
    let headerAutoStyle = {}
    let subItemStyle = {}
    let headerItemIconStyle = {}
    let headerItemWordsStyle = {}
    let avatarStyle = {}
    const [headerShow, setHeaderShow] = useState(false)
    if (userInfo && ('sidebar' in userInfo) && ('sidebarNarrow' in userInfo) && ('sidebarAuto' in userInfo)) {
        const isNarrow = userInfo.sidebarNarrow
        const isAuto = userInfo.sidebarAuto

        headerItemIconStyle = isNarrow
            ? { margin: 0, display: 'block', textAlign: 'center', width: '100%' }
            : { margin: '0 10px 0 32px' }
        headerItemWordsStyle = isNarrow ? { display: 'none' } : { display: 'block' }
        avatarStyle = isNarrow ? { width: '55px', height: '55px' } : { width: '70px', height: '70px' }

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

    return <>
    <div
        className="layout-header-auto"
        onMouseOver={() => setHeaderShow(true)}
        style={{ ...headerAutoStyle }}
    />
    <div
        onMouseLeave={() => setHeaderShow(false)}
        className="layout-header"
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
                    <a href="/login/signin">登录</a>
                    <span>/</span>
                    <a href="/login/signup">注册</a>
                </div>}
        </div>
        <div className="navigation">
            {/* <div className="item-up"><span className="iconfont">&#xe865;</span></div> */}
            <div className="item-content">
                <a
                    href="/"
                    className={`item ${pathname === '/' ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe6b8;</span>
                    <i style={{ ...headerItemWordsStyle }}>主页</i>
                </a>
                <a
                    href="/mine"
                    className={`item ${pathname === '/mine' ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe7d5;</span>
                    <i style={{ ...headerItemWordsStyle }}>我的导航</i>
                </a>
                <div className="nav-career">
                    {Array.isArray(firstLevel) && firstLevel.map(function (item, index) {
                        return <a
                            onMouseLeave={() => setSubItemShow(false)}
                            key={item._id}
                            href={`/career/${item._id}`}
                            className={`item ${item._id === firstLevelId ? 'active' : ''}`}>
                            <span style={{ ...headerItemIconStyle }} className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                            <i style={{ ...headerItemWordsStyle }}>{item.name}</i>
                            <div style={{ opacity: loading ? '1' : 0 }} data-id={item._id} onMouseEnter={getSecondLevel} className="load-second-level"><div className="domilin-loader"></div></div>
                            <em style={{ display: loading ? 'none' : 'flex' }} className="iconfont">&#xe7ee;</em>
                        </a>
                    })}
                    <div
                        className="sub-item"
                        style={{ ...subItemStyle, display: subItemShow ? 'block' : 'none' }}
                        onMouseLeave={() => setSubItemShow(false)}
                        onMouseOver={() => setSubItemShow(true)}>
                        {Array.isArray(secondLevel) && secondLevel.map(function (item, index) {
                            return <a
                                href={`/career/${curFirstLevel}/${item._id}`}
                                className="item"
                                key={item._id}>
                                <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                                <i>{item.name}</i>
                            </a>
                        })}
                    </div>
                </div>
                <a
                    href="/article/tag"
                    className={`item ${pathname.indexOf('/article/') > -1 ? 'active' : ''}`}>
                    <span style={{ ...headerItemIconStyle }} className="iconfont">&#xe742;</span>
                    <i style={{ ...headerItemWordsStyle }}>精选博文</i>
                </a>
            </div>
            {/* <div className="item-down"><span className="iconfont">&#xe864;</span></div> */}
        </div>
        <div className="bottom">
            <a
                onClick={(event) => {
                    localStorage.removeItem('domilinArticle')
                    window.location.href = '/article/submit'
                }}
                className={`item ${pathname === '/article/submit' ? 'active' : ''}`}
                title="写博文,推荐您觉得不错的网站"
            >
                <span data-path="/article/submit" style={{ ...headerItemIconStyle }} className="iconfont">&#xe75d;</span>
                <i data-path="/article/submit" style={{ ...headerItemWordsStyle }}>写"推荐"</i>
            </a>
            <a
                href="/setting"
                className={`item ${pathname === '/setting' ? 'active' : ''}`}
            >
                <span data-path="/setting" style={{ ...headerItemIconStyle }} className="iconfont">&#xe729;</span>
                <i data-path="/setting" style={{ ...headerItemWordsStyle }}>设置</i>
            </a>
        </div>
    </div>
    </>
}
