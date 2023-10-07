import React, { Component } from 'react'

export default class InitalPage extends Component {
    static async getInitialProps (context) {
        const { res } = context
        res.redirect(301, '/')
        return {
            customRes: true
        }
    }

    render () {
        return <div>Old page "/mine" redirect "/"</div>
    }
}
