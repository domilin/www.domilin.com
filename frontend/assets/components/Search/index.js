import React, { useState, useEffect, forwardRef, useCallback, useRef } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { engines } from '../../models/public'

import './index.scss'
import { isChromeExtension, trim } from '../../public/js'
import PureInput from '../PureInput'

const searchEngineArr = [
    // { name: '我的收藏', icon: '&#xe873;' },
    { name: engines.baidu, icon: '&#xe66d;' },
    { name: engines.google, icon: '&#xe625;' },
    { name: engines.bing, icon: '&#xe63f;' },
    { name: engines.sogou, icon: '&#xe64e;' },
    { name: engines['360'], icon: '&#xe602;' }
]
// type: searchEngine索索引擎，article搜索博文，website搜索网址
export default forwardRef(({ type, onSearch }, ref) => {
    const searchEngine = type === 'searchEngine'
    const searchArticle = type === 'article'
    const searchSite = type === 'website'
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }), shallowEqual)
    const [engine, setEngine] = useState(searchEngineArr[0])
    const [iconShow, setIconShow] = useState(0)

    // 确认搜索
    const [searchVal, setSearchVal] = useState('')
    const searchLink = useRef()
    const searchHandle = useCallback(() => {
        if (onSearch) {
            onSearch()
            document.getElementById('domilinSearchInput').value = ''
            return
        }

        if (searchVal === '') return
        // 新页面打开搜索结果
        // document.getElementById('domilinSearchInput').value = ''
        const clickEvent = document.createEvent('MouseEvents')
        clickEvent.initEvent('click', true, true)
        searchLink.current.dispatchEvent(clickEvent)
    }, [onSearch, searchVal])

    // 搜索地址
    let searchUrl = ''
    if (engine.name === engines.baidu) {
        searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(searchVal)}`
    }
    if (engine.name === engines.google) {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchVal)}`
    }
    if (engine.name === engines.bing) {
        searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(searchVal)}`
    }
    if (engine.name === engines.sogou) {
        searchUrl = `https://www.sogou.com/web?query=${encodeURIComponent(searchVal)}`
    }
    if (engine.name === engines['360']) {
        searchUrl = `https://www.so.com/s?q=${encodeURIComponent(searchVal)}`
    }

    // input提示语
    let placeholderStr = ''
    if (searchArticle) placeholderStr = '请输入博文标题关键字'
    if (searchSite) placeholderStr = '请输入网站名称关键字'

    // ---------------默认搜索引擎--------------------
    const isSetting = userInfo && 'engine' in userInfo
    useEffect(() => {
        if (isSetting) {
            for (let val of searchEngineArr) {
                if (val.name === userInfo.engine) {
                    setIconShow(1)
                    setEngine(val)
                    break
                }
            }
        }
    }, [isSetting, userInfo])

    // 自定义设置
    let searchWidth = {}
    let searchShadow = {}
    let searchOpenWay = { target: '_blank' }
    if (userInfo) {
        searchWidth = { width: `${userInfo.searchWidth}%` }
        searchShadow = !userInfo.searchShadow ? { boxShadow: 'none' } : {}
        searchOpenWay = { target: `_${userInfo.searchOpenWay}` }
    }

    // chrome-extension中popup.html总为新标签页打开，当前标签页无法打开
    if (isChromeExtension() && window.pageType && window.pageType === 'popup') {
        searchOpenWay = { target: '_blank' }
    }

    // 点击显示更多搜索方式，鼠标移开整个搜索框+更多搜索下来框+点击完某个搜索方式后--->隐藏更多搜索下拉框
    const [engineMoreShow, setEngineMoreShow] = useState(false)

    return <div className="search-engine-wrapper">
        <div
            onMouseLeave={() => setEngineMoreShow(false)}
            className="search-engine"
            style={{
                ...searchWidth,
                ...searchShadow
            }}>
            {searchEngine && <div className="engine">
                <span
                    onClick={() => setEngineMoreShow(!engineMoreShow)}
                    style={{ opacity: isSetting ? iconShow : 1 }}
                    className="iconfont current-engine"
                    dangerouslySetInnerHTML={{ __html: engine.icon }}
                />
                <div
                    className="engine-more"
                    style={{ display: engineMoreShow ? 'flex' : 'none' }}>
                    {searchEngineArr.map(function (item, index) {
                        return <div
                            // className={`engine-more-item engine-${index === 0 ? 'favorite' : item.name}`}
                            className={`engine-more-item engine-${item.name}`}
                            key={index}
                            onClick={() => {
                                setEngine(item)
                                setEngineMoreShow(false)
                            }}>
                            <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}/>
                            <em>{item.name}</em>
                        </div>
                    })}
                </div>
            </div>}
            <PureInput
                onClick={() => setEngineMoreShow(false)}
                onInputValue={(value) => setSearchVal(trim(value))}
                onEnterKeyUp={(value) => searchHandle(trim(value))}
                ref={ref}
                placeholder={placeholderStr}
                id="domilinSearchInput"
                type="text"
            />
            <a href={searchUrl} ref={searchLink} {...searchOpenWay}/>
        </div>
    </div>
})
