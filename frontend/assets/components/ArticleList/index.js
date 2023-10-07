import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useLocation } from 'react-router-dom'
import Pagination from '../Pagination'
import { formatPublishTime, goCurType, isPc } from '../../public/js'
import Toast from '../Toast'
import { useCallbackAsync } from '../../public/hooks'

import './index.scss'
export default ({ search, searchVal }) => {
    const dispatch = useDispatch()
    const { articleList, channelList, tagList, albumList, album } = useSelector((state) => ({
        articleList: state.article.articleList,
        channelList: state.article.channelList,
        tagList: state.article.tagList,
        albumList: state.article.albumList,
        album: state.article.album
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

    const { tagId, channelId, albumId } = useParams()
    const location = useLocation()
    const isTag = location.pathname.indexOf('/article/tag') > -1
    const isChannel = location.pathname.indexOf('/article/channel') > -1
    const isAlbum = location.pathname.indexOf('/album') > -1
    const isAlbumList = isAlbum && !albumId
    const isAlbumArticle = isAlbum && albumId

    let params = {}
    if (isTag) params = { tagId }
    if (isChannel) params = { channelId }
    if (search) params = { keywords: searchVal }

    // 问斩专辑列表 ----- 文章列表页面切换
    const pageChange = useCallbackAsync(async (curPage) => {
        const res = await dispatch.article.articleGet({
            currentPage: curPage,
            pageSize: articleList.pageSize,
            ...params
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        dispatch.article.articleListSet(res.data)
    }, [articleList.pageSize, dispatch.article, params])
    const loopList = articleList && ('list' in articleList) && Array.isArray(articleList.list) ? articleList.list : []

    // 文章专辑列表 ---- 文章专辑分页切换
    const albumPageChange = useCallbackAsync(async (curPage) => {
        const res = await dispatch.article.albumGet({
            currentPage: curPage,
            pageSize: albumList.pageSize
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [albumList.pageSize, dispatch.article])
    const albumLoopList = albumList && ('list' in albumList) && Array.isArray(albumList.list) ? albumList.list : []

    // 移动端文章列表，跳转到当前频道
    useEffect(() => {
        if (!isChannel || search || !Array.isArray(channelList) || isPc()) return
        goCurType(channelList, channelId, 'article')
    }, [channelId, channelList, isChannel, loopList, search])

    return <>
    {/* ---------------------------关于标签的文章--------------------------- */}
    {
        isTag &&
        tagList &&
        Array.isArray(tagList) &&
        tagList.length > 0 && <div className="website-category-title article-tag-title">
            <span className="title">标签“{tagList[0].name}”的博文</span>
        </div>
    }

    {
        isAlbumArticle && <div className="website-category-title article-album-title">
            <span className="title">专辑“{album.title}”的博文</span>
        </div>
    }

    {/* ---------------------------文章频道，文章专辑<显示频道、专辑导航>--------------------------- */}
    {(isChannel || isAlbumList) && <div className="website-category-title-scroll" id="categoryTitleScroll">
        <div className="website-category-title navigation-title" id="categoryTitle">
            {search && <a className="title active">“{searchVal}”搜索结果</a>}
            <a
                href="/article/channel"
                className={`title ${!channelId && !isAlbum && !search ? 'active' : ''}`}>
            最新博文
            </a>
            <a
                href="/article/album"
                className={`title ${isAlbumList ? 'active' : ''}`}>
            精选专辑
            </a>
            {Array.isArray(channelList) && channelList.map(function (item, index) {
                return <a
                    key={item._id}
                    className={`title ${channelId === item._id && !search ? 'active' : ''}`}
                    href={`/article/channel/${item._id}`}>
                    {item.name}
                </a>
            })}
        </div>
    </div>}

    {/* ---------------------------专辑列表--------------------------- */}
    <div className="article-list-wrapper block-wrapper" style={{ display: isAlbumList ? 'block' : 'none' }}>
        <div className="article-item-box">
            {albumLoopList && albumLoopList.length === 0 && <div className="no-article">
                暂无专辑
            </div>}
            {albumLoopList && albumLoopList.map(function (item, index) {
                return <div className="article-item album-item" key={item._id}>
                    <span className="iconfont">&#xe64d;</span>
                    <a href={`/article/album/${item._id}`}>{item.title}</a>
                </div>
            })}
        </div>
        <div className="article-pagination" style={{ display: albumList.totalPage > 1 ? 'block' : 'none' }}>
            <Pagination
                currentPage={currentPage}
                pageSize={albumList.pageSize}
                totalData={albumList.totalSize}
                pageChange={albumPageChange}
                prevNextHide={true}
            />
        </div>
    </div>

   {/* ---------------------------文章列表<搜索、标签、频道、专辑>--------------------------- */}
    <div className="article-list-wrapper block-wrapper" style={{ display: !isAlbumList ? 'block' : 'none' }}>
        <div className="article-item-box">
            {loopList && loopList.length === 0 && <div className="no-article">
                暂无博文
            </div>}
            {loopList && loopList.map(function (item, index) {
                return <div className="article-item" key={item._id}>
                    <div className="article-info">
                        <div className="article-tags">
                            {Array.isArray(item.tags) && item.tags.map(function (itemTag, indexTag) {
                                return <a href={`/article/tag/${itemTag._id}`} key={itemTag._id}>#{itemTag.name}</a>
                            })}
                        </div>
                        <em>//<time>{formatPublishTime(new Date(item.createdAt).getTime())}</time></em>
                    </div>
                    <div className="article-title">
                        <span className="iconfont">&#xe742;</span>
                        <a href={`/article/${item._id}`}>{item.title}</a>
                    </div>
                    <div className="article-conent">
                        <a href={`/article/${item._id}`}>{item.intro}</a>
                    </div>
                </div>
            })}
        </div>
        <div className="article-pagination" style={{ display: articleList.totalPage > 1 ? 'block' : 'none' }}>
            <Pagination
                currentPage={currentPage}
                pageSize={articleList.pageSize}
                totalData={articleList.totalSize}
                pageChange={pageChange}
                prevNextHide={true}
            />
        </div>
    </div>
    </>
}
