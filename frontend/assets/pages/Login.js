import React, { Component } from 'react'
import loadable from '@loadable/component'

import { webTdkFavorite } from '../public/js/index'

const Page = loadable(() => import('../containers/Login'))

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        // const { store } = context
        return {
            ...webTdkFavorite
        }
    }

    render () {
        return <Page {...this.props} />
    }
}
