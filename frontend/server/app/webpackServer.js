const path = require('path')
const express = require('express')
const compression = require('compression')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
// const webpackHotMiddleware = require('webpack-hot-middleware')

const webpackConfig = require('../../config/webpack.config')
const { webpackPort } = require('../../config/config')

const app = express()

// 允许跨域
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')

    if (req.method === 'OPTIONS') {
        res.send(200) // 让options请求快速返回
    } else {
        next()
    }
})
app.use(compression())
const nodeEnv = typeof process.env.NODE_ENV !== 'undefined' ? process.env.NODE_ENV : 'production'
if (nodeEnv === 'development') {
    const compiler = webpack([webpackConfig.web, webpackConfig.node])
    app.use(webpackDevMiddleware(compiler, {
        publicPath: '/_dist/',
        writeToDisk (filePath) {
            return (/server/.test(filePath) && /.js/.test(filePath) && filePath.indexOf('hot-update') === -1) || /loadable-stats/.test(filePath)
        },
        // logLevel: 'warn',
        hot: true
    }))
    // app.use(webpackHotMiddleware(compiler.compilers.find(compiler => compiler.name === 'client'))) // 注(1)
}
app.use(express.static(path.resolve(process.cwd()) + '/static', {
    index: false,
    maxAge: 365 * 24 * 60 * 60 * 1000
}))

app.listen(webpackPort, function (error) {
    if (error) {
        console.error(error)
    } else {
        console.info('==> Webpack Server Listening on port %s.', webpackPort)
    }
})
