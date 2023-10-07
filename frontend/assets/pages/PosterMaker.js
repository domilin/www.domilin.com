import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdk } from '../public/js/index'

const Page = loadable(() => import('../containers/PosterMaker'), { ssr: false })

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        // const { store } = context
        return {
            ...webTdk,
            title: `哆咪海报-海报制作`
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
