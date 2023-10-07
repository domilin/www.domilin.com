import { webTdk } from '../../assets/public/js/index'
import { statistics, myStylesScripts } from './publc'

const { publicPath } = require('../../config/config')
const { title, description, keywords } = webTdk

export default ({ initState, initProps, styles, scripts, links, errObjProps, theme }) => {
    const pageTitle = initProps.title || title
    const pageDescription = initProps.description ? initProps.description.replace(/\n/g, '') : description
    const pageKeywords = initProps.keywords || keywords
    const pageIcon = `${publicPath}/resource/images/favicon.ico`
    const shareIcon = initProps.shareIcon || `${publicPath}/resource/images/wxshare-icon.ico`

    const { myScripts, myStyles } = myStylesScripts(initProps)
    const errObjScript = errObjProps ? `window._ERROBJPROPS_ = ${JSON.stringify(errObjProps)}` : ''
    return {
        header: `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="keywords" content="${pageKeywords}">
                    <meta name="description" content="${pageDescription}">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
                    <meta name="renderer" content="webkit|ie-comp|ie-stand"/>
                    <meta name="force-rendering" content="webkit"/>
                    <meta name="baidu-site-verification" content="0fuNAGVmAz" />
                    <!--视窗限制-->
                    <meta name="viewport"
                          content="
                          width=device-width,
                          initial-scale=1.0,
                          minimum-scale=1.0,
                          maximum-scale=1.0,
                          user-scalable=no">
                    <!--微信分享图标-->
                    <meta name="wxshare-icon" content="${shareIcon}">   

                    <title>${pageTitle}</title>
                    <link rel="shortcut icon" href="${pageIcon}" type="image/x-icon">
                    ${myStyles}
                    ${styles}
                </head>
                <body data-theme="${theme}">
                    <script src="${publicPath}/resource/plugin/browser-tips.js?v=${new Date().getMonth()}"></script>

                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root">`,
        footer: `</div>
                    <script>
                        window.__INITIAL_STATE__ =${JSON.stringify(initState)}
                        window.__INITIAL_PROPS__ =${JSON.stringify(initProps)}
                        ${errObjScript}
                    </script>
                    ${myScripts}
                    ${scripts}
                    ${statistics}
                </body>
            </html>`
    }
}
