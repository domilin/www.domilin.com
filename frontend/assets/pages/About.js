import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkFavorite } from '../public/js/index'

const Page = loadable(() => import('../containers/About'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        // const { store } = context
        return {
            ...webTdkFavorite,
            title: `哆咪书签-关于哆咪`
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
