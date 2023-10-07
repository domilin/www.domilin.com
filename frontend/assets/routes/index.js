import Layout from '../components/Layout'
// import Home from '../pages/Home'
import Login from '../pages/Login'
import Myself from '../pages/Myself'
import NavCareer from '../pages/NavCareer'
import About from '../pages/About'
import Submit from '../pages/Submit'
import ArticleList from '../pages/ArticleList'
import ArticleDetail from '../pages/ArticleDetail'
import PosterMaker from '../pages/PosterMaker'

// 原'/mine'跳转到首页
import MineTemp from '../pages/MineTemp'

/** @desc 更改日志
 * 2020.8.13 暂时隐藏推荐主页Home，直接指向Myself---我的主页。 "/mine"跳转到首页
 *
 * exact 精准的 是否匹配子路由
 * strict 严格的 是否匹配斜杠”/“
 * */
export default [
    {
        path: '/login/:type', component: Login // signin登录, signup注册, forgetpsd忘记密码
    }, {
        component: Layout,
        routes: [
            // {
            //     path: ['', '/'], component: Home, exact: true, strict: true
            // },
            // {
            //     path: '/mine', component: Myself, exact: true, strict: true
            // },
            {
                path: ['', '/', '/people/:userName'], component: Myself, exact: true, strict: true
            },
            {
                path: '/mine', component: MineTemp, exact: true, strict: true
            },
            {
                path: [
                    '/career',
                    '/career/:firstLevelId',
                    '/career/:firstLevelId/:secondLevelId'
                ],
                component: NavCareer,
                exact: true,
                strict: false
            }, {
                path: [
                    '/article/tag',
                    '/article/tag/:tagId',
                    '/article/channel',
                    '/article/channel/:channelId',
                    '/article/album',
                    '/article/album/:albumId'
                ],
                component: ArticleList,
                exact: true,
                strict: false
            }, {
                path: [ '/article/submit', '/article/submit/:articleId' ], component: Submit, exact: true, strict: true
            }, {
                path: '/article/:articleId', component: ArticleDetail, exact: true, strict: true
            }, {
                path: ['/about', '/about/:pageIndex'], component: About, exact: true, strict: true
            }, {
                path: ['/postermaker', '/postermaker/:posterId'],
                component: PosterMaker,
                exact: true,
                strict: false
            }, {
                path: ['/poster', '/poster/:posterId'],
                component: PosterMaker,
                exact: true,
                strict: false
            }
        ]
    }]
