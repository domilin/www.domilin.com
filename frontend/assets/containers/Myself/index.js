import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { EffectFade, Mousewheel, Keyboard } from 'swiper'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import loadable from '@loadable/component'

import './index.scss'

import Search from '../../components/Search'
import ContextMenu from '../../components/ContextMenu'
import Toast from '../../components/Toast'
import Level from './Level'
import { iconTypes, sidebars } from '../../models/public'
import { windowOffset, elementOffset, goCurType, isChromeExtension, windowScroll, scrollOffset, deepCompare } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'
import WebsiteItemRender from './WebsiteItemRender'
import WebsiteFolderRender from './WebsiteFolderRender'
import UseMemo from '../../components/UseMemo'
// import AddTitle from './AddTitle'
// import AddWebsite from './AddWebsite'
// import SearchWebsite from './SearchWebsite'
SwiperCore.use([EffectFade, Mousewheel, Keyboard])

const AddTitle = loadable(() => import('./AddTitle'))
const AddWebsite = loadable(() => import('./AddWebsite'))
const SearchWebsite = loadable(() => import('./SearchWebsite'))

export default () => {
    const dispatch = useDispatch()
    const { userInfo, curLevelId, levels, sites } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        curLevelId: state.user.curLevel,
        levels: state.user.levels,
        sites: state.user.sites
    }))

    // 当前编辑哪一个level分类
    const [curEditLevel, setCurEditLevel] = useState(null)

    // 当前编辑哪一个site
    const [curEditSite, setCurEditSite] = useState(null)

    const [addTittleShow, setAddTtileShow] = useState(false)
    const [addSiteShow, setAddSiteShow] = useState(false)

    /** @desc ------------------------自定义设置 ------------------------  */
    // 图标样式
    let cssVariable = {}
    let searchItemStyle = {}
    let siteItemStyle = {}
    let levelItemStyle = {}
    let layoutContentWidth = {}
    let layoutNavBtnShow = {}
    let layoutNavDotsShow = {}
    let iconAddShow = {}
    let levelAddShow = {}
    let searchLevelWidth = {}
    let searchOrLevelHideClass = ''

    let searchSizeRange = 0
    let levelSizeRange = 0
    let iconSizeRange = 1
    let iconRadiusRange = 0
    if (userInfo) {
        // 根据iconSize(60-180)计算icon文字大小与上边距--分阶梯: 60-80, 80-100, 100-120, 120-140, 140-180
        const iconSize = userInfo.iconSize
        let iconTextSize = 12
        if (iconSize >= 60 && iconSize < 80) {
            iconSizeRange = 0
            if (iconSize < 70) iconTextSize = 12
            if (iconSize >= 70) iconTextSize = 13
        } else if (iconSize >= 80 && iconSize < 100) {
            iconSizeRange = 1
            iconTextSize = 14
        } else if (iconSize >= 100 && iconSize < 120) {
            iconSizeRange = 2
            iconTextSize = 16
        } else if (iconSize >= 120 && iconSize < 140) {
            iconSizeRange = 3
            iconTextSize = 18
        } else if (iconSize >= 140 && iconSize <= 180) {
            iconSizeRange = 4
            iconTextSize = 20
        }

        // 根据iconRadius(0%-50%)计算文件夹关闭状态下边距--分阶梯：0-15, 15-30, 30-50
        const iconRadius = userInfo.iconRadius
        if (iconRadius >= 0 && iconRadius < 15) {
            iconRadiusRange = 0
        } else if (iconRadius >= 15 && iconRadius < 30) {
            iconRadiusRange = 1
        } else if (iconRadius >= 30 && iconRadius <= 50) {
            iconRadiusRange = 2
        }

        // 根据iconRadius(20-60)计算文件夹关闭状态下边距--分阶梯：20-35, 35-45, 45-60
        const levelSize = userInfo.levelSize
        if (levelSize >= 20 && levelSize < 35) {
            levelSizeRange = 0
        } else if (levelSize >= 35 && levelSize < 45) {
            levelSizeRange = 1
        } else if (levelSize >= 45 && levelSize <= 60) {
            levelSizeRange = 2
        }

        // 根据searchRadius(30-90)计算文件夹关闭状态下边距--分阶梯：30-50, 50-70, 70-90
        const searchSize = userInfo.searchSize
        if (searchSize >= 30 && searchSize < 50) {
            searchSizeRange = 0
        } else if (searchSize >= 50 && searchSize < 70) {
            searchSizeRange = 1
        } else if (searchSize >= 70 && searchSize <= 90) {
            searchSizeRange = 2
        }

        cssVariable = {
            '--icon__text__size': `${iconTextSize}px`,
            '--icon__size': `${userInfo.iconSize}px`,
            '--icon__radius': `${userInfo.iconRadius / 100 * userInfo.iconSize}px`,
            '--level__size': `${userInfo.levelSize}px`,
            '--level__radius': `${userInfo.levelRadius / 100 * userInfo.levelSize}px`,
            '--search__size': `${userInfo.searchSize}px`,
            '--search__radius': `${userInfo.searchRadius / 100 * userInfo.searchSize}px`,
            '--search__more__radius': `${userInfo.searchRadius / 100 * 80}px`
        }

        siteItemStyle = {
            opacity: userInfo.iconOpacity,
            gap: `${userInfo.layoutRowSpacing}px ${userInfo.layoutCloumnSpacing}px`

        }
        levelItemStyle = {
            display: userInfo.levelShow ? 'block' : 'none',
            opacity: userInfo.levelOpacity

        }
        searchItemStyle = {
            display: userInfo.searchShow ? 'block' : 'none',
            opacity: userInfo.searchOpacity

        }

        const paddingVal = `${(25 - userInfo.layoutContentWidth) * 2}%`
        layoutContentWidth = { paddingLeft: paddingVal, paddingRight: paddingVal }
        layoutNavBtnShow = { display: userInfo.layoutNavBtnShow ? 'flex' : 'none' }
        layoutNavDotsShow = { display: userInfo.layoutNavDotsShow ? 'flex' : 'none' }

        if (userInfo.iconType === iconTypes.efficient) {
            siteItemStyle.gridTemplateColumns = 'repeat(auto-fill, calc(2.6 * var(--icon__size)))'
        }

        if (userInfo.iconType === iconTypes.light || userInfo.iconType === iconTypes.classic) {
            siteItemStyle.gridTemplateColumns = 'repeat(auto-fill, calc(var(--icon__size)))'
        }

        iconAddShow = { display: userInfo.iconAddShow ? 'flex' : 'none' }
        levelAddShow = { display: userInfo.levelAddShow ? 'flex' : 'none' }
        searchLevelWidth = {
            width: userInfo.sidebarAuto
                ? `calc(100% - 240px)`
                : `calc(100% - 240px - ${userInfo.sidebarNarrow ? '80' : '212'}px)`
        }

        if (userInfo.searchShow && !userInfo.levelShow) {
            searchOrLevelHideClass = 'search-show-level-hide'
        }
        if (!userInfo.searchShow && userInfo.levelShow) {
            searchOrLevelHideClass = 'search-hide-level-show'
        }
        if (!userInfo.searchShow && !userInfo.levelShow) {
            searchOrLevelHideClass = 'search-hide-level-hide'
        }
    }

    // 右上角插件弹出框---添加按钮--->固定在第一个
    let addSiteBtnStyleAfter = {}
    let addSiteBtnStyleBefore = {}
    if (typeof window !== 'undefined' && isChromeExtension() && window.pageType === 'popup') {
        addSiteBtnStyleAfter = { display: 'none' }
        addSiteBtnStyleBefore = { display: 'flex' }
    }

    // 向下滚动时---翻页按钮样式
    let prevStyle = {}
    let nextStyle = {}
    if (userInfo) {
        const num = userInfo.sidebarAuto ? '0px' : (userInfo.sidebarNarrow ? '80px' : '212px')
        if (userInfo.sidebar === sidebars.left) {
            prevStyle = {
                left: `${parseInt(num) + 68}px`,
                right: 'initial'
            }
            nextStyle = {
                left: `initial`,
                right: `70px`
            }
        }
        if (userInfo.sidebar === sidebars.right) {
            prevStyle = {
                left: `70px`,
                right: `initial`
            }
            nextStyle = {
                left: 'initial',
                right: `${parseInt(num) + 68}px`
            }
        }
    }

    // swiper切换方式：鼠标切换、键盘左右方向键切换
    const swiperChange = {}
    if (userInfo) {
        if (userInfo.layoutPageSwitchMouse) {
            swiperChange.mousewheel = {
                releaseOnEdges: true,
                forceToAxis: true
            }
        }

        if (userInfo.layoutPageSwitchKeyboard) {
            swiperChange.keyboard = {
                enabled: true,
                onlyInViewport: false,
                pageUpDown: false
            }
        }
    }

    // 搜索网址添加
    const [searchWebsiteShow, setSearchWebsiteShow] = useState(false)

    // store swiper instance
    const pageSwitchSpeed = userInfo ? userInfo.layoutPageAnimateSpeed * 1000 : 300
    const pageSwitchEffect = userInfo ? userInfo.layoutPageAnimateEffect : null
    const [noPrev, setNoPrev] = useState(true)
    const [noNext, setNoNext] = useState(false)
    const [swiper, setSwiper] = useState(null)
    const slideChangeHandle = useCallback((swiper) => {
        dispatch.user.setCurlevel(levels[swiper.activeIndex]._id)
        setAllLevelShow(false)

        if (swiper.activeIndex === 0) {
            setNoPrev(true)
            setNoNext(false)
        } else if (swiper.activeIndex === levels.length - 1) {
            setNoPrev(false)
            setNoNext(true)
        } else {
            setNoPrev(false)
            setNoNext(false)
        }
    }, [dispatch.user, levels])
    useEffect(() => {
        if (!swiper) return
        try {
            swiper.off('slideChange')
            swiper.on('slideChange', function (swiper) {
                slideChangeHandle(swiper)
            })
        } catch {
            console.log('swiper sliderChange error')
        }
    }, [slideChangeHandle, swiper])

    /** @desc ------------------------------------------------某些设置更改时需要重新渲染swiper------------------------------------------------  */
    // icon, level, search样式发生变化时，swiper进行更新。如swiper的高度
    useEffect(() => {
        if (!swiper || !Array.isArray(levels)) return
        swiper.update()
    }, [
        userInfo.iconType,
        userInfo.iconSize,
        userInfo.levelSize,
        userInfo.searchSize,
        swiper,
        levels
    ])
    // 如sidebarAuto, sidebarNarrow页面宽度变化，swiper的宽度需要重新渲染来更改
    const [swiperRedraw, setSwiperRedraw] = useState(true)
    const [settingDone, setSettingDone] = useState(false)
    const observerSetting = useRef((userInfoObj) => ({
        levelShow: userInfoObj.levelShow,
        searchShow: userInfoObj.searchShow,
        sidebarAuto: userInfoObj.sidebarAuto,
        sidebarNarrow: userInfoObj.sidebarNarrow,
        layoutPageAnimateEffect: userInfoObj.layoutPageAnimateEffect,
        layoutPageSwitchMouse: userInfoObj.layoutPageSwitchMouse,
        layoutPageSwitchKeyboard: userInfoObj.layoutPageSwitchKeyboard
    }))
    const settingChangeOld = useRef(observerSetting.current(userInfo))
    const timerRedraw = useRef()
    // 比较原来的值是否与新值相等
    // 在此需要新增一个useEffect判断，设置是否改变
    // 如果仅仅是使用下边那个useEffect，则页面刷新默认swiper变量被设置时，也会再重新渲染一遍swiper
    useEffect(() => {
        const settingChangeNew = observerSetting.current(userInfo)
        if (!deepCompare(settingChangeOld.current, settingChangeNew)) {
            setSettingDone(true)
            settingChangeOld.current = settingChangeNew
        }
    }, [userInfo])
    useEffect(() => {
        if (!swiper) return
        if (timerRedraw.current) return
        if (!settingDone) return
        const times = 350 // 300ms与设置更改动画的过渡时间一致+50ms弹性时间

        setSwiperRedraw(false)
        timerRedraw.current = setTimeout(() => {
            setSwiperRedraw(true)
            setSettingDone(false)
            clearTimeout(timerRedraw.current)
            timerRedraw.current = null
        }, times)
    }, [settingDone, swiper])

    /** @desc ------------------------------------------------滚动固定搜索与分类 ------------------------------------------------  */
    const [scrollDown, setScrollDown] = useState(false)
    const searchLevelFixed = userInfo && userInfo.layoutScrollSearchLevelFixed
    useEffect(() => {
        if (!searchLevelFixed) return

        const searchLevel = document.querySelector('.search-level')
        const layoutContent = document.querySelector('.layout-content')
        const searchPaddingTop = parseFloat(getComputedStyle(searchLevel).paddingTop)
        const scrollFunc = windowScroll(function (direction) {
            const scrollTop = scrollOffset(layoutContent).top
            if (scrollTop > searchPaddingTop - 16) {
                setScrollDown(true)
            } else {
                setScrollDown(false)
            }

            // const scrollTop = scrollOffset(layoutContent).top
            // if (direction === 'down' && scrollTop > searchPaddingTop - 16) setScrollDown(true)

            // if (direction === 'up' && scrollTop < searchPaddingTop - 8) setScrollDown(false)
        }, layoutContent)

        return () => window.removeEventListener('scroll', scrollFunc, false)
    }, [searchLevelFixed])

    // 展示全部分类
    const [allLevelShow, setAllLevelShow] = useState(false)
    const [allShowTimer, setAllShowTimer] = useState(null)
    const levelMouseEnter = useCallback(() => {
        // 不超过一行时，也不展开
        const levelBox = document.getElementById('categoryTitle')
        const levelAll = levelBox.querySelectorAll('.context-menu-wrapper ')
        const addTtitle = document.getElementById('addTitle')
        const boxWidth = elementOffset(levelBox).width
        let levelAllWidth = 0
        for (const node of levelAll) {
            levelAllWidth += elementOffset(node).width
        }
        levelAllWidth += elementOffset(addTtitle).width
        if (levelAllWidth <= boxWidth) return

        // 延迟展开，在不想点击分类时，或从顶部搜索下滑到网址区域时，不会来回展开，这两种情况是不需要展开的，展开反而非常跳动难受
        if (allShowTimer) clearTimeout(allShowTimer)
        setAllShowTimer(setTimeout(() => setAllLevelShow(true), 240))
    }, [allShowTimer])
    const levelMouseLeave = useCallback(() => {
        if (allShowTimer) clearTimeout(allShowTimer)
        setAllLevelShow(false)
    }, [allShowTimer])

    // 分类编辑+删除
    const levelContextChange = useCallbackAsync(async (option, item) => {
        if (option.value === 1) {
            setCurEditLevel(item)
            setAddTtileShow(true)
        }

        if (option.value === 2) {
            const res = await dispatch.user.levelDelXhr({ _id: item._id })
            if (res.code !== 1) {
                Toast.info(res.msg)
                return
            }

            swiper.slideTo(0, 0, false)
        }
    }, [dispatch.user, swiper])

    // 当前分类的位置
    useEffect(() => {
        goCurType(levels, curLevelId)
    }, [curLevelId, levels])

    return <DndProvider backend={HTML5Backend}>
        <div
            className={`category-wrapper icon-size-range-${iconSizeRange} icon-radius-range-${iconRadiusRange} level-size-range-${levelSizeRange} search-size-range-${searchSizeRange} ${searchOrLevelHideClass}`}
            style={{ ...cssVariable }}>
            <div
                className={`search-level ${scrollDown && userInfo && userInfo.layoutScrollSearchLevelFixed ? 'scroll-down' : ''}`}
                style={{ ...searchLevelWidth }}>
                {/* --------------------搜索-------------------- */}
                <div
                    className="search-padding"
                    style={{ ...searchItemStyle, ...layoutContentWidth }}>
                    <UseMemo>
                        {() => <Search type="searchEngine"/>}
                    </UseMemo>
                </div>

                {/* --------------------分类-------------------- */}
                <div
                    onMouseEnter={levelMouseEnter}
                    onMouseLeave={levelMouseLeave}
                    style={{ ...levelItemStyle }}
                    id="categoryTitleScroll"
                    className={`website-category-title-scroll beautify-scroll-transparent ${allLevelShow ? 'show-all' : ''}`}>
                    <UseMemo
                        deps={[levels, swiper, pageSwitchSpeed, layoutContentWidth, levelContextChange, levelAddShow]}>
                        {() => <div
                            style={{ ...layoutContentWidth }}
                            className="website-category-title"
                            id="categoryTitle">

                            {/* 循环渲染分类 */}
                            {Array.isArray(levels) && levels.map(function (item, index) {
                                return <ContextMenu
                                    key={item._id}
                                    onChange={(option) => levelContextChange(option, item)}
                                    options={[
                                        { value: 1, name: '编辑' },
                                        { value: 2, name: '删除' }
                                    ]}>
                                    <Level {...{ itemData: item, swiper, pageSwitchSpeed }}/>
                                </ContextMenu>
                            })}

                            {/* 添加分类按钮 */}
                            <div
                                style={{ ...levelAddShow }}
                                className="title add-title"
                                id="addTitle"
                                onClick={() => {
                                    setCurEditLevel(null)
                                    setAddTtileShow(true)
                                }}>
                                <span className="iconfont">&#xe6da;</span>
                            </div>
                        </div>}
                    </UseMemo>
                </div>
            </div>

            {/* --------------------上一页按钮-------------------- */}
            <div
                style={{
                    ...prevStyle,
                    ...layoutNavBtnShow,
                    opacity: noPrev ? '0.5' : 1
                }}
                className="category-prev-wrapper"
                onClick={() => {
                    if (noPrev) return
                    swiper.slidePrev()
                }}>
                <div className="category-prev">
                    <span className="iconfont">&#xe6a3;</span>
                </div>
            </div>

            {/* --------------------网站图标-------------------- */}
            {swiperRedraw && <div className="category-content">
                <Swiper
                    {...swiperChange}
                    // 当swiper在触摸时阻止默认事件（preventDefault），用于防止触摸时触发链接跳转。
                    preventClicks={false}
                    // 鼠标模拟手机触摸。默认为true，Swiper接受鼠标点击、拖动
                    simulateTouch={false}
                    autoHeight={true}
                    speed={pageSwitchSpeed}
                    effect={pageSwitchEffect}
                    fadeEffect={{ crossFade: true }}
                    onSwiper={(swiper) => {
                        window.domilinSwiper = swiper // 挂载到全局，ImportExport组件会用到
                        setSwiper(swiper)
                    }}>
                    {Array.isArray(levels) && levels.map(function (item, index) {
                        return <SwiperSlide key={item._id}>
                            <div className="website-category-list-padding">
                                <div
                                    className="website-category-list"
                                    style={{
                                        ...siteItemStyle,
                                        ...layoutContentWidth
                                    }}>
                                    {/* popup只显示此添加按钮 */}
                                    <div
                                        style={curLevelId ? { ...addSiteBtnStyleBefore } : { display: 'none' }}
                                        className="website-item-box add-website add-website-before"
                                        onClick={() => {
                                            setCurEditSite(null)
                                            setAddSiteShow(true)
                                        }}>
                                        <span className="iconfont">&#xe6da;</span>
                                    </div>
                                    {/* 网站图标渲染 */}
                                    <UseMemo deps={[sites]}>
                                        {() => <>
                                            {Array.isArray(sites) && sites.map(function (itemIn, indexIn) {
                                                if (itemIn.levelId !== item._id) return
                                                if (itemIn.children && Array.isArray(itemIn.children) && itemIn.children.length !== 0) {
                                                    return <WebsiteFolderRender
                                                        key={itemIn._id}
                                                        {...{ itemIn, setCurEditSite, setAddSiteShow }}
                                                    />
                                                } else {
                                                    return <WebsiteItemRender
                                                        key={itemIn._id}
                                                        {...{ itemIn, setCurEditSite, setAddSiteShow }}
                                                    />
                                                }
                                            })}
                                        </>}
                                    </UseMemo>
                                    {/* popup中不显示此添加按钮，显示最开始的添加按钮 */}
                                    <div
                                        style={curLevelId ? { ...iconAddShow, ...addSiteBtnStyleAfter } : { display: 'none' }}
                                        className="website-item-box add-website"
                                        onClick={() => {
                                            setCurEditSite(null)
                                            if (windowOffset().width <= 768) {
                                                setAddSiteShow(true)
                                                return
                                            }
                                            setSearchWebsiteShow(true)
                                        }}>
                                        <span className="iconfont">&#xe6da;</span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    })}
                </Swiper>
            </div>}

            {/* --------------------下一页按钮-------------------- */}
            <div
                style={{
                    ...nextStyle,
                    ...layoutNavBtnShow,
                    opacity: noNext ? '0.5' : 1
                }}
                className="category-next-wrapper"
                onClick={() => {
                    if (noNext) return
                    swiper.slideNext()
                }}>
                <div className="category-next">
                    <span className="iconfont">&#xe6a3;</span>
                </div>
            </div>

            {/* --------------------分页器dots-------------------- */}
            <div className="website-category-dots" style={{ ...layoutNavDotsShow }}>
                {Array.isArray(levels) && levels.map(function (item, index) {
                    return <div
                        key={item._id}
                        onClick={() => swiper.slideTo(index, pageSwitchSpeed, false)}
                        className={`dots-item ${item._id === curLevelId ? 'active' : ''}`}>
                        {index}
                    </div>
                })}
            </div>
        </div>

        {/* --------------------添加分类-------------------- */}
        {addTittleShow && <AddTitle
            edit={curEditLevel}
            show={addTittleShow}
            swiper={swiper}
            close={() => setAddTtileShow(false)}
        />}

        {/* --------------------手动添加网址-------------------- */}
        {addSiteShow && <AddWebsite
            levelId={curLevelId}
            edit={curEditSite}
            show={addSiteShow}
            searchAdd={() => setSearchWebsiteShow(true)}
            close={() => setAddSiteShow(false)}
        />}

        {/* --------------------自动添加网址-------------------- */}
        <div className="auto-add-website">
            {searchWebsiteShow && <SearchWebsite
                levelId={curLevelId}
                show={searchWebsiteShow}
                addSiteShow={() => setAddSiteShow(true)}
                close={() => setSearchWebsiteShow(false)}
            />}
        </div>
    </DndProvider>
}
