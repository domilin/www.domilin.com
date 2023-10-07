const path = require('path')
const STATIC_PATH = path.resolve(path.resolve(process.cwd()), 'static')

module.exports = function (api) {
    if (api) {
        api.cache(true)
    }
    return {
        compact: false,
        ignore: [/node_modules\/(?!multiAppSharing)/],
        presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env',
                {
                    targets: {
                        browsers: ['last 10 versions', 'ie >= 11'],
                        node: 'current'
                    }
                }
            ]
        ],
        plugins: [
            '@loadable/babel-plugin',
            '@babel/plugin-transform-runtime',
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-proposal-decorators', { 'legacy': true }],
            ['@babel/plugin-proposal-class-properties', { 'loose': true }],
            [
                'module-resolver',
                {
                    cwd: 'babelrc',
                    root: ['./'],
                    alias: {
                        '/static': STATIC_PATH
                    }
                }
            ]
        ]
    }
}
