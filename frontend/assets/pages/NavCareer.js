import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkFavorite } from '../public/js/index'

const Page = loadable(() => import('../containers/NavCareer'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { store, match, res } = context

        const { firstLevelId, secondLevelId } = match.params

        if (!firstLevelId) {
            res.redirect('/')
            return { customRes: true }
        }

        const secondRes = await store.dispatch.website.secondLevelGet(firstLevelId)
        if (secondRes.code !== 1) throw Error('FirstLevel Get Error')

        let curSecondLevelId = secondLevelId
        let surSecondLevelName = ''
        if (Array.isArray(secondRes.data) && secondRes.data.length > 0) {
            if (!secondLevelId) {
                curSecondLevelId = secondRes.data[0]._id
                surSecondLevelName = secondRes.data[0].name
            } else {
                for (let val of secondRes.data) {
                    if (val._id === secondLevelId) {
                        surSecondLevelName = val.name
                        break
                    }
                }
            }
        }

        const siteAndFirstLevelRes = await Promise.all([
            store.dispatch.website.siteListGet({
                secondLevelId: curSecondLevelId,
                currentPage: 1,
                pageSize: 50
            }),
            store.dispatch.website.firstLevelGet()
        ]).catch(function (err) {
            throw Error(err)
        })
        // if (!siteRes || siteRes.code !== 1) throw Error('Website Get Error')
        const firstLevel = siteAndFirstLevelRes[1]
        let title = `哆咪书签-${surSecondLevelName}`
        if (firstLevel && firstLevel.code === 1 && firstLevel.data && Array.isArray(firstLevel.data)) {
            for (const val of firstLevel.data) {
                if (val._id === firstLevelId) {
                    title = `哆咪书签-${val.name}-${surSecondLevelName}`
                }
            }
        }

        return {
            ...webTdkFavorite,
            title
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
