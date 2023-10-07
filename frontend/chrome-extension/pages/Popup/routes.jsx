import { lazy } from 'react'
import Layout from '@/components/Layout'

/** @desc ----------路由配置---------- */
// const Layout = lazy(() => import("../components/Layout"))
const Myself = lazy(() => import('@/containers/Myself'))

const routes = [
    {
        component: Layout,
        routes: [
            {
                path: ['', '/'],
                component: Myself,
                exact: true,
                strict: true
            }
        ]
    }
]

export default routes
