import React, { Component } from 'react'
import { renderRoutes } from 'react-router-config'

import routes from './routes/index'
import ErrorLayoutPc from './components/Layout/ErrorLayout'

class App extends Component {
    static routes () {
        return {
            routes
        }
    }

    static ErrorPage ({ message, stack }) {
        return <ErrorLayoutPc>
            <h1>{message}</h1>
            <pre>{stack}</pre>
        </ErrorLayoutPc>
    }

    render () {
        return <>
            {renderRoutes(routes, { ...this.props })}
        </>
    }
}

export default App
