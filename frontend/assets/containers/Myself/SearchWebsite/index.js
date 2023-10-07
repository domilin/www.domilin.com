import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import './index.scss'

import Popup from '../../../components/Popup'
import Toast from '../../../components/Toast'
import WebsiteItem from '../../../components/WebsiteItem'
import Search from '../../../components/Search'
import FormItemButton from '../../../components/FormItemButton'
import FormSelect from '../../../components/FormSelect'
import Pagination from '../../../components/Pagination'
import Button from '../../../components/Button'
import { trim } from '../../../public/js'
import { useCallbackAsync, useEffectAsync } from '../../../public/hooks'

export default ({ show, close, levelId, addSiteShow }) => {
    const dispatch = useDispatch()
    const { userInfo, curFirstLevel, firstLevel, secondLevel, websiteList, levels } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        curFirstLevel: state.website.curFirstLevel,
        firstLevel: state.website.firstLevel,
        secondLevel: state.website.secondLevel,
        websiteList: state.website.websiteList,
        levels: state.user.levels
    }))

    // 一级菜单
    const [curFirst, setCurFirst] = useState({ name: '', value: curFirstLevel })
    const [firstOptions, setFirstOptions] = useState([])
    useEffectAsync(async () => {
        const res = await dispatch.website.firstLevelGet()
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }

        if (Array.isArray(res.data) && res.data.length > 0) {
            // 默认一级分类
            dispatch.website.curFirstLevelSet(res.data[0]._id)
            setCurFirst({ name: res.data[0].name, value: res.data[0]._id })

            const arrTemp = []
            for (const val of firstLevel) {
                arrTemp.push({ name: val.name, value: val._id })
            }

            // 一级分类options
            setFirstOptions(arrTemp)
        }
    }, [])

    // 网址列表
    const websiteListGet = useCallbackAsync(async ({ secondLevelId, currentPage, keywords }) => {
        const params = {
            pageSize: 12,
            currentPage: currentPage || 1
        }
        if (keywords && keywords !== '') params.keywords = keywords
        if (secondLevelId) params.secondLevelId = secondLevelId
        const res = await dispatch.website.siteListGet(params)
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        dispatch.website.websiteListSet(res.data)
    }, [dispatch.website])

    const [secondLevelId, setSecondLevelId] = useState(null)
    // 搜索网址
    const searchInput = useRef()
    const [searchVal, setSearchVal] = useState(null)
    const searchArticle = useCallbackAsync(async () => {
        const val = trim(searchInput.current.value)
        if (val === '') return
        websiteListGet({
            keywords: val
        })

        setSearchVal(val)
        setSecondLevelId(null)
    }, [websiteListGet])

    // 翻页
    const [currentPage, setCurrentPage] = useState(1)
    const pageChange = useCallbackAsync(async (curPage) => {
        setCurrentPage(curPage)

        const params = {
            currentPage: curPage
        }

        if (secondLevelId !== null) {
            params.secondLevelId = secondLevelId
            searchInput.current.value = ''
        } else if (searchVal && searchVal !== '') {
            params.keywords = searchVal // 若为搜索时: 只传递关键词
        }

        websiteListGet(params)
    }, [searchVal, secondLevelId, websiteListGet])

    // 二级菜单
    useEffectAsync(async () => {
        if (!curFirstLevel) return
        const res = await dispatch.website.secondLevelGet(curFirstLevel)
        if (!res) {
            Toast.info('二级导航获取错误')
            return
        }

        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }

        if (!Array.isArray(res.data) || res.data.length === 0) return
        websiteListGet({ secondLevelId: res.data[0]._id })
        setSecondLevelId(res.data[0]._id)
    }, [curFirstLevel, websiteListGet])

    // 添加到哪个分类---添加到我的收藏完成后
    const [curLevel, setCurLevel] = useState({ name: '', value: levelId })
    const [levelOptions, setLevelOptions] = useState([])
    useEffect(() => {
        // 服务端返回全新的levels和sites，会重新设置，由于rematch-inmmer的原因，levels每一次都是全新的levels, 会导致此处重新渲染
        // 由于在此弹出窗时，levels是否不会变得，由因为每一次重新打开此弹框，levels会因此更新，故在此去掉[]中的levels监听，以简单解决
        const arrTemp = []
        for (const val of levels) {
            if (val._id === levelId) {
                // 默认添加到当前访问的分类
                setCurLevel({ name: val.name, value: val._id })
            }
            arrTemp.push({ name: val.name, value: val._id })
        }
        setLevelOptions(arrTemp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [levelId])

    // 添加到我的导航
    const addToMine = useCallbackAsync(async (siteId) => {
        if (!userInfo.userId) {
            Toast.info('请注册或登录')
            return
        }

        const res = await dispatch.user.addToMine({ levelId: curLevel.value, siteId })
        if (res.code !== 1) {
            if (res.code === 13) {
                Toast.info('主页已存在')
                return
            }
            Toast.info(res.msg)
            return
        }

        Toast.info('已添加到我的主页')
    }, [curLevel.value, dispatch.user, userInfo.userId])

    return <Popup
        wrapperClassName="search-website-wrapper"
        className="search-website-box"
        close={close}
        show={show}>
        <div className="search-website-left">
            <div className="first-level">
                <FormItemButton title="分类">
                    <FormSelect
                        defaultValue={curFirst}
                        options={firstOptions}
                        onChange={(val) => {
                            searchInput.current.value = ''
                            setCurFirst(val)
                            dispatch.website.curFirstLevelSet(val.value)
                        }}
                    />
                </FormItemButton>
            </div>
            <div className="second-level">
                {Array.isArray(secondLevel) && secondLevel.map(function (item, index) {
                    return <a
                        onClick={() => {
                            searchInput.current.value = ''
                            setSecondLevelId(item._id)
                            websiteListGet({ secondLevelId: item._id })
                        }}
                        className={`item ${secondLevelId === item._id ? 'active' : ''}`}
                        key={item._id}>
                        <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                        <i>{item.name}</i>
                    </a>
                })}
            </div>
        </div>
        <div className="search-website-right">
            <div className="search-level-popup">
                <Button onClick={() => {
                    addSiteShow()
                    close()
                }}>手动添加</Button>
                <div className="add-to-level">
                    <FormItemButton title="添加到">
                        <FormSelect
                            defaultValue={curLevel}
                            options={levelOptions}
                            onChange={(val) => setCurLevel(val)}
                        />
                    </FormItemButton>
                </div>
                <Search ref={searchInput} onSearch={searchArticle} type="website"/>
            </div>

            <div className="website-category-list-wrapper">
                <div className="website-category-list">
                    {Array.isArray(websiteList.list) && websiteList.list.map(function (item, index) {
                        return <WebsiteItem
                            page="addsite"
                            onClick={() => addToMine(item._id)}
                            key={item._id} {...item}
                        />
                    })}
                </div>
            </div>

            <div
                className="websie-pagination"
                style={{ display: websiteList.totalPage > 1 ? 'block' : 'none' }}>
                <Pagination
                    currentPage={currentPage}
                    pageSize={websiteList.pageSize}
                    totalData={websiteList.totalSize}
                    pageChange={pageChange}
                    prevNextHide={true}
                />
            </div>
        </div>
    </Popup>
}
