const ipServer = () => {
    const os = require('os')
    const interfaces = os.networkInterfaces()
    for (let devName in interfaces) {
        const iface = interfaces[devName]
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address
            }
        }
    }
}
const ipClient = () => {
    return window.location.host.split(':')[0]
}

const env = typeof process.env.NODE_ENV !== 'undefined' ? process.env.NODE_ENV : false
/** @Desc webpack前端资源路径,layout.js的css+js路径: 2020-07-15--线上nginx配置静态资源 */
const frontendDomain = 'www.domilin.com'
/** @Desc api接口地址 */
const apiDomain = 'api.domilin.com'
/** @Desc 静态资源地址: 后端上传avatar, icon等资源 */
const staticDomain = 'static.domilin.com'

/** 
 * @desc 扩展发布步骤
 * 1: 修改版本号：/chrome-extension/manifest.json
 * 2: 修改本地下载链接版本号： assets/components/Layout/Header
 * 3: npm run buildChrome
 * 4: 压缩打包 /chrome-extension/build eg:domilin-1-106.zip
 * 5: 复制压缩包到 /static/resource/extension
 * 6: npm build
 */

let config = {
    extensionVersion: 1.106, // 扩展版本号:只做备份提示，暂时没在程序中引用
    ip: (port) => `http://${typeof window !== 'undefined' ? ipClient() : ipServer()}:${port}`,
    webpackPort: 8092, // webpack服务端口
    serverPort: 3082 // 网站服务端口
}
if (env === 'development') {
    config = Object.assign(
        config,
        {
            publicPath: config.ip(config.webpackPort),
            staticDomain: config.ip('3080'),
            apiDomain: config.ip('3080'),
            homeRecommendId: '61b4d483bab2e2dfb4de3905',
            mineRecommendId: '61b4ce22bab2e2dfb4de3903',
            guideArticleId: '5f33516b8592e32d8bbef294',
            frontendDomain: config.ip('3082'),
            chromeFrontend: 'http://localhost:3082',
        }
    )

    // chrome-extension开发环境
    if (typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:') {
        config = Object.assign(
            config,
            {
                publicPath: 'http://localhost:8092',
                staticDomain: 'http://localhost:3080', 
                apiDomain: 'http://localhost:3080', 
                homeRecommendId: '5f0edf5c68cc40854f3227fe',
                mineRecommendId: '5f0edf7868cc40854f3227ff',
                guideArticleId: '5f33516b8592e32d8bbef294',
                frontendDomain: 'http://localhost:3082',
                chromeFrontend: 'http://localhost:3082',
            }
        )
    }
}

if (env === 'production') {
    config = Object.assign(
        config,
        {
            publicPath: `https://${staticDomain}`,
            staticDomain: `https://${staticDomain}`,
            apiDomain: `https://${apiDomain}`,
            homeRecommendId: '5f20f6ff8f604c33991e7409',
            mineRecommendId: '5f20f7278f604c33991e740a',
            guideArticleId: '5f4488bcf948231d83e527a4',
            frontendDomain: `https://${frontendDomain}`,
            chromeFrontend: `https://${frontendDomain}`
        }
    )
}

module.exports = config
