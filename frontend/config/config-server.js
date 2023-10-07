const fs = require('fs')
const env = process.env.NODE_ENV
const folderAddressPrd = 'www.domilin.com'

/** @desc 测试服 */
let config = {
    redisIp: 'localhost',
    redisPsd: '123456',
}

/** @desc 正式服 */
if (env === 'production') {
    config = {
        redisIp: 'localhost',
        redisPsd: 'YourPassword',
        loadableStatsOutputPath: `/data/${folderAddressPrd}/node/server/build`, // localTest production 时注释此段
    }
}
// 打包的时候执添加sshServer属性
if (env === 'production' && process.env.NODE_BUILD_PRD === 'production') {
    config.sshServer = [
        {
            config: {
                host: 'YourIp',
                port: 22,
                username: 'root',
                password: 'YourPassword',
                readyTimeout: 30000
            },
            logs: 'deploy',
            path: `/data/${folderAddressPrd}/node/publish.zip`,
            shell: ['']
        }
    ]
}

module.exports = config
