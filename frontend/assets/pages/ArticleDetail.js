import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkArticle } from '../public/js/index'

const Page = loadable(() => import('../containers/ArticleDetail'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { store, match } = context

        let title = webTdkArticle.title
        const articleDetail = await store.dispatch.article.articleGet({ articleId: match.params.articleId })
        if (!articleDetail || articleDetail.code !== 1) {
            throw Error((articleDetail && articleDetail.msg) || '文章详情获取错误')
        }
        store.dispatch.article.articleDetailSet(articleDetail.data)
        title = `${articleDetail.data.title}-哆咪博文`

        // 获取所有tagId，请求相关新闻
        let tagIdStr = ''
        if (articleDetail.data && articleDetail.data.tags && Array.isArray(articleDetail.data.tags)) {
            for (const val of articleDetail.data.tags) {
                tagIdStr += `${val._id},`
            }
        }
        const res = await Promise.all([
            store.dispatch.article.articleGet({
                currentPage: 1,
                pageSize: 10,
                tagId: tagIdStr
            }),
            store.dispatch.article.albumGetByArticleId({ articleId: match.params.articleId })
        ]).catch(function (err) {
            throw Error(err)
        })

        const articleList = res[0]
        if (articleList && articleList.code === 1) {
            store.dispatch.article.articleListSet(articleList.data)
        }

        return {
            ...webTdkArticle,
            title
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
