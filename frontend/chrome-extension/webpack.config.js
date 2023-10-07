const webpack = require('webpack')
const path = require('path')
const fileSystem = require('fs-extra')
const env = require('./utils/env')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')

const ROOT_PATH = path.resolve(process.cwd())
const babelConfig = path.resolve(ROOT_PATH, 'babel.config.js')

const webTdk = {
    title: 'DOMILIN 哆咪书签',
    keywords: '哆咪书签,哆咪收藏,哆咪主页,哆咪自定义主页,哆咪个性主页,哆咪新标签页,哆咪起始页,哆咪网址导航',
    description: '哆咪书签-应用随处可用：手机、平板、PC、浏览器扩展多端适用，随心自定义个性主页'
}

// load the secrets
const alias = {
    'react-dom': '@hot-loader/react-dom',
    '@': path.join(ROOT_PATH, '/assets'),
    '@config': path.join(ROOT_PATH, '/config'),
    '@browser': path.join(ROOT_PATH, '/browser')
}

const secretsPath = path.join(process.cwd(), 'secrets.' + env.NODE_ENV + '.js')

const fileExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'eot',
    'otf',
    'svg',
    'ttf',
    'woff',
    'woff2'
]

if (fileSystem.existsSync(secretsPath)) {
    alias.secrets = secretsPath
}

const options = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        newtab: path.join(process.cwd(), 'chrome-extension', 'pages', 'Newtab', 'index.jsx'),
        options: path.join(process.cwd(), 'chrome-extension', 'pages', 'Options', 'index.jsx'),
        popup: path.join(process.cwd(), 'chrome-extension', 'pages', 'Popup', 'index.jsx'),
        background: path.join(process.cwd(), 'chrome-extension', 'pages', 'Background', 'index.js'),
        contentScript: path.join(process.cwd(), 'chrome-extension', 'pages', 'Content', 'index.js')
    },
    chromeExtensionBoilerplate: {
        notHotReload: ['contentScript']
    },
    output: {
        path: path.resolve(process.cwd(), 'chrome-extension/build'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                // look for .css or .scss files
                test: /\.(css|scss)$/,
                // in the `src` directory
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    { loader: 'resolve-url-loader' },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
                loader: 'file-loader?name=[name].[ext]'
                // exclude: /node_modules/
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            caller: 'web',
                            cacheDirectory: true,
                            configFile: babelConfig
                        }
                    },
                    'eslint-loader'
                ]
            }
        ]
    },
    resolve: {
        alias: alias,
        extensions: fileExtensions
            .map((extension) => '.' + extension)
            .concat(['.jsx', '.js', '.css'])
    },
    plugins: [
        new StyleLintPlugin(),
        new webpack.ProgressPlugin(),
        // clean the build folder
        new CleanWebpackPlugin(['build'], {
            root: path.resolve(process.cwd(), 'chrome-extension'),
            verbose: true,
            dry: false
        }),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.join(process.cwd(), 'chrome-extension/manifest.json'),
                        to: path.join(process.cwd(), 'chrome-extension/build'),
                        force: true,
                        transform: function (content, path) {
                            // generates the manifest file using the package.json informations
                            return Buffer.from(
                                JSON.stringify({
                                    description: process.env.npm_package_description,
                                    version: process.env.npm_package_version,
                                    ...JSON.parse(content.toString())
                                })
                            )
                        }
                    }
                ]
            }
        ),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.join(process.cwd(), 'chrome-extension/pages/Content/content.styles.css'),
                        to: path.join(process.cwd(), 'chrome-extension/build'),
                        force: true
                    }
                ]
            }
        ),
        new CopyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.join(process.cwd(), 'chrome-extension/_locales'),
                        to: path.join(process.cwd(), 'chrome-extension/build/_locales'),
                        force: true
                    }
                ]
            }
        ),
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), 'chrome-extension/public/index.html'),
            filename: 'newtab.html',
            chunks: ['newtab'],
            ...webTdk,
            filepath: path.join(process.cwd(), 'chrome-extension/build'),
            inject: 'body'
        }),
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), 'chrome-extension/public/index.html'),
            filename: 'options.html',
            chunks: ['options'],
            ...webTdk,
            filepath: path.join(process.cwd(), 'chrome-extension/build'),
            inject: 'body'
        }),
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), 'chrome-extension/public/index.html'),
            filename: 'popup.html',
            chunks: ['popup'],
            ...webTdk,
            filepath: path.join(process.cwd(), 'chrome-extension/build'),
            inject: 'body'
        }),
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), 'chrome-extension/public/index.html'),
            filename: 'background.html',
            chunks: ['background'],
            ...webTdk,
            filepath: path.join(process.cwd(), 'chrome-extension/build'),
            inject: 'body'
        }),
        new WriteFilePlugin()
    ]
}

if (env.NODE_ENV === 'development') {
    options.devtool = 'cheap-module-eval-source-map'
}

module.exports = options
