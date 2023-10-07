import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './index.scss'
import { useParams } from 'react-router-dom'
import WebsiteItem from '../WebsiteItem'
import ContextMenu from '../ContextMenu'
import AddToMine from './AddToMine'
import Toast from '../Toast'
import Pagination from '../Pagination'
import { isPc, goCurType } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'

export default ({ page, search, searchVal }) => {
    const dispatch = useDispatch()
    const { firstLevelId, secondLevelId } = useParams()
    const { secondLevel, websiteList, userInfo } = useSelector((state) => ({
        secondLevel: state.website.secondLevel,
        websiteList: state.website.websiteList,
        userInfo: state.public.userInfo
    }))

    // 进入页面，首次搜索时把当前页面设置为1
    const searchTick = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)
    useEffect(() => {
        if (!search) return
        if (searchTick.current) return
        searchTick.current = true
        setCurrentPage(1)
    }, [search])

    // 添加到我的导航
    const [addToMineShow, setAddToMineShow] = useState(false)
    const [addId, setAddId] = useState(null)

    const pageChange = useCallbackAsync(async (curPage) => {
        setCurrentPage(curPage)

        const params = {
            currentPage: curPage,
            pageSize: websiteList.pageSize
        }
        if (search) params.keywords = searchVal // 若为搜索时: 只传递关键词
        if (!search) params.secondLevelId = secondLevelId || secondLevel[0]._id

        const res = await dispatch.website.siteListGet(params)
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch.website, search, searchVal, secondLevel, secondLevelId, websiteList.pageSize])

    const websiteCategory = useCallback(
        (siteList) => <div className="website-category-list">
            {Array.isArray(siteList) && siteList.map(function (item, index) {
                return <ContextMenu
                    key={item._id}
                    onChange={(option) => {
                        if (option.value === 1) {
                            if (!userInfo.userId) {
                                Toast.info('请先登录或注册')
                                return
                            }
                            setAddId(item._id)
                            setAddToMineShow(true)
                        }
                    }}
                    options={[
                        { value: 1, name: '添加到我的主页' }
                    ]}>
                    <WebsiteItem {...item}/>
                </ContextMenu>
            })}
        </div>,
        [userInfo.userId]
    )

    const curSecondLevel = secondLevelId ||
    (secondLevel && Array.isArray(secondLevel) && secondLevel.length > 0 && secondLevel[0]._id)

    // 移动端网站列表，跳转到当前分类
    useEffect(() => {
        if (page !== 'career' || search || !Array.isArray(secondLevel) || isPc()) return
        goCurType(secondLevel, curSecondLevel)
    }, [curSecondLevel, page, search, secondLevel])
    return <div className="website-wrapper">
        {/* 主页推荐导航 */}
        {page === 'home' && Array.isArray(websiteList.list) && websiteList.list.map(function (item, index) {
            return <div className="website-category" key={item._id}>
                <div className="website-category-title">
                    <div className="title" key={item._id}>
                        <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                        {item.name}
                    </div>
                </div>
                {item.children && websiteCategory(item.children)}
            </div>
        })}

        {/* 职业导航页面: 默认 */}
        {page === 'career' && !search && <div className="website-category-title-scroll" id="categoryTitleScroll">
            <div className="website-category-title navigation-title" id="categoryTitle">
                {Array.isArray(secondLevel) && secondLevel.map(function (item, index) {
                    return <a
                        href={`/career/${firstLevelId}/${item._id}`}
                        className={`title ${curSecondLevel === item._id ? 'active' : ''}`}
                        key={item._id}>
                        <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                        {item.name}
                    </a>
                })}
            </div>
        </div>}

        {/* 职业导航页面: 搜索 */}
        {page === 'career' && search && <div className="website-category-title-scroll">
            <div className="website-category-title navigation-title">
                <a className="title active">
                    <span className="iconfont">&#xe7f5;</span>
                “{searchVal}”搜索结果
                </a>
            </div>
        </div>}

        {page === 'career' && websiteCategory(websiteList.list)}

        <div
            className="websie-pagination"
            style={{ display: websiteList.totalPage > 1 && page === 'career' ? 'block' : 'none' }}>
            <Pagination
                currentPage={currentPage}
                pageSize={websiteList.pageSize}
                totalData={websiteList.totalSize}
                pageChange={pageChange}
                prevNextHide={true}
            />
        </div>

        <AddToMine
            addId={addId}
            close={() => setAddToMineShow(false)}
            show={addToMineShow}
        />
    </div>
}
