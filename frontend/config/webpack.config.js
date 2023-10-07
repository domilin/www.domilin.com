const os = require('os')
const path = require('path')
const webpack = require('webpack')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const autoprefixer = require('autoprefixer')
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const ROOT_PATH = path.resolve(process.cwd())
const APP_PATH = path.resolve(ROOT_PATH, 'server/app')
const ASSETS_PATH = path.resolve(ROOT_PATH, 'assets')
const STATIC_PATH = path.resolve(ROOT_PATH, 'static')
const SERVER_PATH = path.resolve(ROOT_PATH, 'server')
const STATIC_DIST_PATH = path.resolve(ROOT_PATH, 'static/_dist')
const SERVER_DIST_PATH = path.resolve(ROOT_PATH, 'server/_dist')
const STATIC_BUILD_PATH = path.resolve(ROOT_PATH, '_temp/static/build')
const SERVER_BUILD_PATH = path.resolve(ROOT_PATH, '_temp/server/build')
const CONFIG_PATH = path.resolve(ROOT_PATH, 'config')
const BROWSER_PATH = path.resolve(ROOT_PATH, 'browser')

const babelConfig = path.resolve(ROOT_PATH, 'babel.config.js')
const { publicPath } = require('../config/config')

const devEnv = process.env.NODE_ENV === 'development'

const getConfig = (target, server) => {
    const isWeb = target === 'web'
    const isNode = target === 'node'

    // entry
    let entry = { index: path.resolve(BROWSER_PATH, 'index.js') }
    if (isNode) entry = { App: path.resolve(ASSETS_PATH, 'App.js') }
    if (isNode && server) entry = { index: path.resolve(APP_PATH, 'index.js') }

    // output
    let output = {
        path: target === 'web' ? STATIC_DIST_PATH : SERVER_DIST_PATH,
        filename: '[name].js',
        publicPath: `${publicPath}/_dist/`,
    }
    if (!devEnv) output = {
        path: target === 'web' ? STATIC_BUILD_PATH : SERVER_BUILD_PATH,
        filename: isWeb ? '[name]-[hash:8].js' : '[name].js',
        publicPath: `${publicPath}/build/`,
    }
    if (isNode) output.libraryTarget = 'commonjs2'

    // rules
    const rules = [
        {
            test: /\.(js|jsx)?$/,
            include: [ASSETS_PATH, STATIC_PATH, CONFIG_PATH, BROWSER_PATH, SERVER_PATH],
            use: [
                {
                    loader: 'thread-loader',
                    options: {
                      workers: os.cpus().length
                    }
                },
                {
                    loader: 'babel-loader',
                    options: {
                        caller: target,
                        cacheDirectory: true,
                        configFile: babelConfig
                    }
                },
                'eslint-loader'
            ]
        },
        {
            test: /\.(json)?$/,
            type: 'javascript/auto',
            loader: 'json-loader'
        },
        {
            test: /\.(png|jpg|jpeg|gif|svg|svgz|ico|eot|ttf|woff|woff2|gif)?$/,
            // include: [ASSETS_PATH, STATIC_PATH],
            include: [ROOT_PATH],
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: false,
                        name: devEnv ? '[name].[ext]' : '[name]-[hash:8].[ext]'
                    }
                }
            ]
        }
    ]
    if (isWeb) rules.push({
        test: /\.(css|scss)?$/,
        // include: [ASSETS_PATH, STATIC_PATH],
        include: [ROOT_PATH],
        use: [
            {
                loader: ExtractCssChunks.loader,
                options: {
                    hot: true,
                    reloadAll: true

                }
            },
            'css-loader',
            'sass-loader',
            {
                loader: 'postcss-loader',
                options: {
                    plugins: [autoprefixer()]
                }
            }
        ]
    })

    // plugins
    const plugins = [
        // new webpack.HotModuleReplacementPlugin(), // 注(1)
        new LoadablePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
    if (devEnv) plugins.unshift(new CleanWebpackPlugin(['_dist'], {
        root: isWeb ? STATIC_PATH : SERVER_PATH,
        verbose: true,
        dry: false
    }))
    const webPlugins = plugins.concat([
        new StyleLintPlugin(),
        new ExtractCssChunks({
            filename: devEnv ? '[name].css' : '[name]-[hash:8].css',
            ignoreOrder: true
        }),
        new FilterWarningsPlugin({
            exclude: /extract-css-chunks-webpack-plugin[^]*Conflicting order between:/,
        }),
    ])
    // if (!devEnv) webPlugins.push(new BundleAnalyzerPlugin())
    const nodePlugins = plugins.concat([
        new webpack.NormalModuleReplacementPlugin(/\.(css|scss)$/, 'node-noop'),
        new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
    ])

    // optimization
    const nodeOptimization = isWeb ? {
        minimize: true,
        minimizer: [
            /* new UglifyJsPlugin({
                test: /\.js(\?.*)?$/i,  //测试匹配文件,
                include: /\/includes/, //包含哪些文件
                exclude: /\/excludes/, //不包含哪些文件

                // 允许过滤哪些块应该被uglified（默认情况下，所有块都是uglified）。 
                // 返回true以uglify块，否则返回false。
                chunkFilter: (chunk) => {
                    // `highlight` 模块不压缩
                    if (chunk.name.indexOf('highlight') > -1) {
                        return false;
                    }
                    return true;
                },

                cache: false,   // 是否启用文件缓存，默认缓存在node_modules/.cache/uglifyjs-webpack-plugin.目录
                parallel: true,  // 使用多进程并行运行来提高构建速度
            }), */
            new TerserJSPlugin({
                cache: true, // 是否缓存
                parallel: true, // 是否并行打包
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin({})
        ]
    } : {
        minimize: false
    }

    return {
        name: isWeb ? 'client' : 'server',
        target: target,
        mode: devEnv ? 'development' : 'production',
        devtool: devEnv ? 'cheap-module-eval-source-map' : 'source-map',
        node: isWeb ? { fs: 'empty' } : { __filename: false,  __dirname: false, fs: 'empty' },
        entry: entry,
        output: output,
        externals: isWeb ? undefined : [ '@loadable/component', nodeExternals() ],
        optimization: devEnv ? undefined : nodeOptimization,
        module: {
            rules: rules
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.scss', '.css'],
            alias: {
                '/static': STATIC_PATH,
                '@': ASSETS_PATH
            }
        },
        plugins: isWeb ? webPlugins : nodePlugins
    }
}

module.exports =  {
    web: getConfig('web'), 
    node: getConfig('node'),
    nodeSever: getConfig('node', 'server')
}