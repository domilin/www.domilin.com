import React, { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Toast from '../Toast'
import Button from '../Button'
import Comfirm from '../Comfirm'
import './index.scss'
import { formatPublishTime } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'

export default ({ keywords, user, title }) => {
    const dispatch = useDispatch()
    const { articleList } = useSelector((state) => ({
        articleList: state.article.articleList
    }))
    const articleEdit = useCallback((articleId) => {
        window.location.href = `/article/submit/${articleId}`
    }, [])
    const articleDel = useCallbackAsync(async (articleId) => {
        const res = await dispatch.article.articleDel({ articleId })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        Toast.info('删除成功')
        window.location.reload()
    }, [dispatch])
    const articleMore = useCallbackAsync(async () => {
        const { currentPage, totalPage } = articleList
        if (currentPage >= totalPage) return
        const params = {
            currentPage: currentPage + 1,
            pageSize: 10,
            keywords
        }
        const res = user ? await dispatch.article.articleUserGet(params) : await dispatch.article.articleGet(params)
        if (!res) {
            Toast.error('博文获取错误')
            return
        }
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        dispatch.article.articleListAdd(res.data)
    }, [articleList, dispatch.article, keywords, user])

    const [curId, setCurId] = useState(null)
    const [delVisible, setDelVisible] = useState(false)

    const loopList = articleList && ('list' in articleList) && Array.isArray(articleList.list) ? articleList.list : []
    return <>
    <div className="article-list-left-title">
        {title || '我的博文' }
    </div>
    <div className="article-list-left-wrapper">
        <ul className="article-list-left">
            {loopList.length !== 0 ? loopList.map(function (item, index) {
                const href = item.audit && !item.delete ? { href: `/article/${item._id}` } : {}
                const cusor = !item.audit || item.delete ? { cusor: 'default' } : {}
                return <li key={item._id}>
                    <div className="list-left-info">
                        <time>{formatPublishTime(new Date(item.createdAt).getTime())}</time>
                        {user && !item.audit && <span className="list-item-audit">待审核</span>}
                        {/* 未通过---->在后台为已删除状态 */}
                        {user && item.delete && <span className="list-item-delete">未通过</span>}
                    </div>
                    <a {...href} style={{ ...cusor }}>{item.title}</a>
                    {user && <div className="preview-delete">
                        <Button size="small" onClick={() => articleEdit(item._id)}>编辑</Button>
                        <Button type="grey" size="small" onClick={() => {
                            setDelVisible(true)
                            setCurId(item._id)
                        }}>删除</Button>
                    </div>}
                </li>
            }) : <div className="list-item-no">暂无博文</div>}
        </ul>
        <Comfirm
            visible={delVisible}
            title="删除博文"
            content='删除后将无法恢复，确认删除？'
            onCancel={() => setDelVisible(false)}
            onOk={() => articleDel(curId)}
        />
        <div
            className="article-more"
            style={{ display: articleList.currentPage < articleList.totalPage ? 'block' : 'none' }}
            onClick={articleMore}>
            查看更多
            <span className="iconfont">&#xe867;</span>
        </div>
    </div>
    </>
}
