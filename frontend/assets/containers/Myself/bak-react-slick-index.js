import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Slider from 'react-slick'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import './index.scss'
import Search from '../../components/Search'
import ContextMenu from '../../components/ContextMenu'
import AddTitle from './AddTitle'
import AddWebsite from './AddWebsite'
import SearchWebsite from './SearchWebsite'
import Toast from '../../components/Toast'
import Level from './Level'
import { iconTypes, sidebars } from '../../models/public'
import { windowScroll, windowOffset, elementOffset, scrollOffset, goCurType, isChromeExtension } from '../../public/js'
import WebsiteItemRender from './WebsiteItemRender'
import WebsiteFolderRender from './WebsiteFolderRender'

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
    let itemStyle = {}
    let addBtnStyle = {}
    if (userInfo && 'iconType' in userInfo && 'iconAddShow' in userInfo) {
        if (userInfo.iconType === iconTypes.efficient) {
            itemStyle = {
                gridTemplateColumns: 'repeat(auto-fill, calc(2.6 * var(--icon__size)))',
                gap: '31px 40px',
                '--icon__size': '96px',
                '--icon__radius': '7px'
            }
        }
        if (userInfo.iconType === iconTypes.light) itemStyle = { gridTemplateColumns: 'repeat(auto-fill, 86px)' }

        if (userInfo.iconAddShow) {
            addBtnStyle = { display: 'flex' }
        } else {
            addBtnStyle = { display: 'none' }
        }
    }
    let addSiteBtnStyleAfter = {}
    let addSiteBtnStyleBefore = {}
    if (typeof window !== 'undefined' && isChromeExtension() && window.pageType === 'popup') {
        addSiteBtnStyleAfter = { display: 'none' }
        addSiteBtnStyleBefore = { display: 'flex' }
    }
    // 向下滚动时搜索框与分类样式 + 翻页按钮样式
    let searchLevelStyle = {}
    let prevStyle = {}
    let nextStyle = {}
    if (userInfo && ('sidebar' in userInfo) && ('sidebarNarrow' in userInfo) && ('sidebarAuto' in userInfo)) {
        const num = userInfo.sidebarAuto ? '0px' : (userInfo.sidebarNarrow ? '80px' : '212px')
        if (userInfo.sidebar === sidebars.left) {
            searchLevelStyle = {
                left: 'initial',
                right: '0',
                width: `calc(100% - ${num})`
            }
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
            searchLevelStyle = {
                left: '0',
                right: 'initial',
                width: `calc(100% - ${num})`
            }
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

    /** @desc ------------------------滚动固定搜索与分类 ------------------------  */
    const [scrollDown, setScrollDown] = useState(false)
    const [searchLevelInsteadStyle, setSearchLevelInsteadStyle] = useState({})
    useEffect(() => {
        const searchBox = document.querySelector('.search-engine')
        const searchMarginTop = parseInt(getComputedStyle(searchBox).marginTop)
        setSearchLevelInsteadStyle({ height: `${elementOffset(document.getElementById('searchLevel')).height}px` })
        const scrollFunc = windowScroll(function (direction) {
            const scrollTop = scrollOffset(document.querySelector('.layout-wrapper')).top
            if (direction === 'down' && scrollTop > searchMarginTop) setScrollDown(true)

            const searchLevelHeight = elementOffset(document.getElementById('searchLevel')).height
            if (direction === 'up' && scrollTop < searchLevelHeight) setScrollDown(false)
        }, document.querySelector('.layout-wrapper'))

        return () => window.removeEventListener('scroll', scrollFunc, false)
    }, [])

    // 展示全部分类
    const [allLevelShow, setAllLevelShow] = useState(false)
    const [allShowTimer, setAllShowTimer] = useState(null)

    // 当前分类的位置
    useEffect(() => {
        goCurType(levels, curLevelId)
    }, [curLevelId, levels])

    // 搜索网址添加
    const [searchWebsiteShow, setSearchWebsiteShow] = useState(false)

    // 移动端激活拖动切换分类
    const [mobDragChangeLevel, setMobDragChangeLevel] = useState(false)
    useEffect(() => {
        if (windowOffset().width <= 768 && !isChromeExtension()) {
            setMobDragChangeLevel(true)
        }
    }, [])

    // slider
    const slider = useRef()
    const settings = {
        arrows: false,
        dots: false,
        infinite: false,
        speed: 300,
        // useCSS: true,
        // fade: true,
        // useTransform: false,
        draggable: mobDragChangeLevel,
        easing: 'linear',
        initialSlide: 0,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        beforeChange: (current, next) => {
            dispatch.user.setCurlevel(levels[next]._id)
            setAllLevelShow(false)
        }
    }

    return <div className={`mine-wrapper ${scrollDown ? 'scroll-down' : ''}`}>
        <DndProvider backend={HTML5Backend}>
            <div className="search-level-instead" style={{ ...searchLevelInsteadStyle }}>
                <div className="search-level" id="searchLevel" style={scrollDown ? { ...searchLevelStyle } : {}}>
                    <Search type="searchEngine"/>
                    <div
                        onMouseEnter={() => {
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
                            setAllShowTimer(setTimeout(() => setAllLevelShow(true), 160))
                        }}
                        onMouseLeave={() => {
                            if (allShowTimer) clearTimeout(allShowTimer)
                            setAllLevelShow(false)
                        }}
                        id="categoryTitleScroll"
                        className={`website-category-title-scroll beautify-scroll-transparent ${allLevelShow ? 'show-all' : ''}`}>
                        <div className="website-category-title" id="categoryTitle">
                            {Array.isArray(levels) && levels.map(function (item, index) {
                                return <ContextMenu
                                    key={item._id}
                                    onChange={async (option) => {
                                        if (option.value === 1) {
                                            setCurEditLevel(item)
                                            setAddTtileShow(true)
                                        }

                                        if (option.value === 2) {
                                            const res = await dispatch.user.levelDelXhr({ _id: item._id })
                                            if (res.code !== 1) {
                                                Toast.info(res.msg)
                                            }
                                        }
                                    }}
                                    options={[
                                        { value: 1, name: '编辑' },
                                        { value: 2, name: '删除' }
                                    ]}>
                                    <Level {...{ itemData: item, slider }}/>
                                </ContextMenu>
                            })}
                            <div
                                style={{ ...addBtnStyle }}
                                className="title add-title"
                                id="addTitle"
                                onClick={() => {
                                    setCurEditLevel(null)
                                    setAddTtileShow(true)
                                }}>
                                <span className="iconfont">&#xe6da;</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {useMemo(() => {
                return <div className="website-category-list-wrapper" id="websiteCategoryList">
                    <div
                        style={{ ...prevStyle }}
                        className="category-prev-wrapper"
                        onClick={() => slider.current.slickPrev()}>
                        <div className="category-prev">
                            <span className="iconfont">&#xe6a3;</span>
                        </div>
                    </div>
                    <Slider {...settings} ref={slider}>
                        {Array.isArray(levels) && levels.map(function (item, index) {
                            return <div key={item._id} className="slider-page">
                                <div className="website-category-list" style={{ ...itemStyle }}>
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
                                    {/* popup中不显示此添加按钮，显示最开始的添加按钮 */}
                                    <div
                                        style={curLevelId ? { ...addBtnStyle, ...addSiteBtnStyleAfter } : { display: 'none' }}
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
                        })}
                    </Slider>
                    <div
                        style={{ ...nextStyle }}
                        className="category-next-wrapper"
                        onClick={() => slider.current.slickNext()}>
                        <div className="category-next">
                            <span className="iconfont">&#xe6a3;</span>
                        </div>
                    </div>
                </div>
            }, [addBtnStyle, addSiteBtnStyleAfter, addSiteBtnStyleBefore, curLevelId, itemStyle, levels, nextStyle, prevStyle, settings, sites])}
            <div className="website-category-dots">
                {Array.isArray(levels) && levels.map(function (item, index) {
                    return <div
                        key={item._id}
                        onClick={() => slider.current.slickGoTo(index)}
                        className={`dots-item ${item._id === curLevelId ? 'active' : ''}`}>
                        {index}
                    </div>
                })}
            </div>
            {addTittleShow && <AddTitle
                edit={curEditLevel}
                show={addTittleShow}
                close={() => setAddTtileShow(false)}
            />}
            {addSiteShow && <AddWebsite
                levelId={curLevelId}
                edit={curEditSite}
                show={addSiteShow}
                searchAdd={() => setSearchWebsiteShow(true)}
                close={() => setAddSiteShow(false)}
            />}
            {searchWebsiteShow && <SearchWebsite
                levelId={curLevelId}
                show={searchWebsiteShow}
                addSiteShow={() => setAddSiteShow(true)}
                close={() => setSearchWebsiteShow(false)}
            />}
        </DndProvider>
    </div>
}
