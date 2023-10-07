import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkFavorite } from '../public/js/index'
import { homeRecommendId } from '../../config/config'

const Page = loadable(() => import('../containers/Home'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { store } = context
        await Promise.all([
            store.dispatch.article.articleGet({
                currentPage: 1,
                pageSize: 10
            }),
            store.dispatch.website.websiteListGet({ firstLevelId: homeRecommendId, recommend: true })
        ]).then(function (res) {
            const articleList = res[0]
            if (articleList && articleList.code === 1) {
                store.dispatch.article.articleListSet(articleList.data)
            }
        }).catch(function (err) {
            throw Error(err)
        })
        return {
            ...webTdkFavorite
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
