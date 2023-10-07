import { hot } from 'react-hot-loader/root'
import React, { Suspense } from 'react'
import { renderRoutes } from 'react-router-config'

import './App.scss'

import Loading from '@/components/Loading'
import initState from '../../utils/useInitState'
import routes from './routes'

const App = () => {
    initState()
    return <Suspense fallback={<Loading />}>{renderRoutes(routes)}</Suspense>
}

export default hot(App)
