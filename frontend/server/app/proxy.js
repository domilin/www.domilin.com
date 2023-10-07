import proxyMiddleware from 'http-proxy-middleware'
import querystring from 'querystring'
import { apiDomain } from '../../config/config'

export default (app) => {
    const onError = (err, req, res) => {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        })
        res.end(
            'Something went wrong. And we are reporting a custom error message.' + err
        )
    }
    const onProxyReq = (proxyReq, req, res) => {
        if (req.method.toLowerCase() === 'post' && req.body) {
            if (!req.body || !Object.keys(req.body).length) return

            const contentType = proxyReq.getHeader('Content-Type')
            const writeBody = (bodyData) => {
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
                proxyReq.write(bodyData)
            }

            if (contentType === 'application/json') {
                writeBody(JSON.stringify(req.body))
            }

            if (contentType === 'application/x-www-form-urlencoded') {
                writeBody(querystring.stringify(req.body))
            }
        }
    }

    const onProxyRes = (proxyRes, req, res) => {
        // const cookies = proxyRes.headers['set-cookie']
        // const cookieRegex = /Path=\/XXX\//i
        // // 修改cookie Path
        // if (cookies) {
        //     const newCookie = cookies.map(function (cookie) {
        //         if (cookieRegex.test(cookie)) {
        //             return cookie.replace(cookieRegex, 'Path=/')
        //         }
        //         return cookie
        //     })
        //     // 修改cookie path
        //     delete proxyRes.headers['set-cookie']
        //     proxyRes.headers['set-cookie'] = newCookie
        // }
    }

    // api.domilin.com 接口代理
    app.use([
        '/auth',
        '/user',
        '/website',
        '/article',
        '/public'
    ], proxyMiddleware({
        target: apiDomain,
        changeOrigin: true,
        ws: true,
        https: true,
        headers: {
            Referer: apiDomain
        },
        cookieDomainRewrite: '',
        onError,
        onProxyReq,
        onProxyRes
    }))
}
