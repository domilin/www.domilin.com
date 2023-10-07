import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkArticle } from '../public/js/index'

const Page = loadable(() => import('../containers/ArticleList'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { store, match, res } = context
        const isTag = match.path.indexOf('/article/tag') > -1
        const isChannnel = match.path.indexOf('/article/channel') > -1
        const isAlbum = match.path.indexOf('/album') > -1
        const isAlbumList = isAlbum && !match.params.albumId
        const isAlbumArticle = isAlbum && match.params.albumId

        if (isTag && !match.params.tagId) {
            res.redirect('/article/channel')
            return { customRes: true }
        }

        if (isAlbumList) {
            await Promise.all([
                store.dispatch.article.channelGet(),
                store.dispatch.article.albumGet({
                    currentPage: 1
                })
            ]).catch(function (err) {
                throw Error(err)
            })
            return {
                ...webTdkArticle,
                title: `哆咪博文-精选专辑`
            }
        }

        const params = {}
        if (isTag) params.tagId = match.params.tagId
        if (isChannnel && match.params.channelId) params.channelId = match.params.channelId
        if (isAlbumArticle) params.albumId = match.params.albumId

        const promiseArr = [
            store.dispatch.article.articleGet({
                currentPage: 1,
                pageSize: 10,
                ...params
            })
        ]
        if (isChannnel) promiseArr.push(store.dispatch.article.channelGet())
        if (isTag) promiseArr.push(store.dispatch.article.tagGet({ _id: match.params.tagId }))
        if (isAlbumArticle) promiseArr.push(store.dispatch.article.albumGet({ _id: match.params.albumId }))

        let title = '哆咪博文-发现博文'
        await Promise.all(promiseArr).then(function (res) {
            const articleList = res[0]
            if (articleList && articleList.code === 1) {
                store.dispatch.article.articleListSet(articleList.data)
            }

            const resOther = res[1]
            if (resOther && resOther.code === 1) {
                // tag新闻标题
                if (isTag && resOther.data.length > 0) title = `哆咪博文-标签“${resOther.data[0].name}”的博文`

                // 频道新闻标题
                if (isChannnel && match.params.channelId) {
                    for (let val of resOther.data) {
                        if (val._id === match.params.channelId) {
                            title = `哆咪博文-关于“${val.name}”的博文`
                            break
                        }
                    }
                }

                // 博文专辑标题
                if (isAlbumArticle) {
                    title = `哆咪博文-专辑“${resOther.data.title}”的博文`
                }
            }
        }).catch(function (err) {
            throw Error(err)
        })
        return {
            ...webTdkArticle,
            title
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
