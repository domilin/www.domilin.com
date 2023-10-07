import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkArticle } from '../public/js/index'

const Page = loadable(() => import('../containers/Submit'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        // const { store } = context
        return {
            ...webTdkArticle,
            title: `哆咪博文-创作博文`
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
