import { isArray } from '../../assets/public/js/index'

const { publicPath } = require('../../config/config')

/** @desc 其它平台统计代码与推送代码 */
const statistics = `
    <!--百度推送-->
    <script>
        var _hmt = _hmt || [];
        (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?81b263405b43ba93aa1cd58bc3fc0a38";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
        })();
    </script>
    `

/** @desc 更换主题: 2020-07-15 已改为render服务端获取并设置，放弃前端设置 */
// const changeTheme = `
// <script>
// function getCookie(name){
//     var strcookie = document.cookie
//     var arrcookie = strcookie.split('; ');
//     for ( var i = 0; i < arrcookie.length; i++) {
//         var arr = arrcookie[i].split('=')
//         if (arr[0] == name){
//             return arr[1]
//         }
//     }
//     return ''
// }
// var theme = getCookie('${cookiesName.theme}')  || 'default'
// document.body.setAttribute('data-theme', theme)
// </script>
// `

/** @desc 自定义style与script
 * @method myStylesScripts(initProps)
 * */
const myStylesScripts = (initProps) => {
    let myStyles = ''
    if (initProps.stylesheet) {
        if (!isArray(initProps.stylesheet) || initProps.stylesheet.length === 0) throw new Error('stylesheet is not a array or length is 0')
        for (let val of initProps.stylesheet) {
            const href = (val.indexOf('https://') > -1 || val.indexOf('http://') > -1) ? val : publicPath + val
            myStyles += `<link href="${href}" rel="stylesheet" type="text/css">`
        }
    }

    let myScripts = ''
    if (initProps.javascript) {
        if (!isArray(initProps.javascript) || initProps.javascript.length === 0) throw new Error('javascript is not a array or length is 0')
        for (let val of initProps.javascript) {
            const src = (val.indexOf('https://') > -1 || val.indexOf('http://') > -1) ? val : publicPath + val
            myScripts += `<script type="text/javascript" src="${src}" crossorigin></script>`
        }
    }

    return { myStyles, myScripts }
}

/** @desc 微信分享。注：url暂时调用www.huoxing24.com。跨域问题需要具体跟运维查看
 * @method wxShare(isWx)
 * */
const wxShare = (isWx) => {
    if (!isWx) return ''
    return `<script src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
            <script>
            function formatParams(data) {
                var arr = [];
                for (var name in data) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
                }
                arr.push(('v=' + Math.random()).replace('.', ''))
                return arr.join('&')
            }
    
            function ajax(options) {
                options = options || {}
                options.type = (options.type || 'get').toLowerCase()
                options.dataType = options.dataType || 'json'
                var params = formatParams(options.data)
                var xhr = new XMLHttpRequest()
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var status = xhr.status
                        if (status >= 200 && status < 300) {
                            options.success && options.success(xhr.responseText, xhr.responseXML)
                        } else {
                            options.fail && options.fail(status)
                        }
                    }
                }
                if (options.type === 'get') {
                    xhr.open('GET', options.url + '?' + params, true)
                    xhr.send(null)
                } else if (options.type === 'post') {
                    xhr.open('POST', options.url, true)
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
                    xhr.send(params)
                }
            }
            ajax({
                url: '/signture',
                type: 'post',
                data: { url: window.location.href.split('#')[0] },
                success: function (res, xml) {
                    const data = JSON.parse(res)
                    wx.config({
                        debug: false,
                        appId: 'wxec2dc083d4024311',
                        timestamp: data.timestamp,
                        nonceStr: data.nonceStr,
                        signature: data.signature,
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ'
                        ]
                    })
                    wx.ready(function () {
                        const shareData = {
                            title: document.title,
                            desc: document.querySelector('meta[name="description"]').getAttribute('content'),
                            imgUrl: document.querySelector('meta[name="wxshare-icon"]').getAttribute('content'),
                            link: data.url
                        }
                        wx.onMenuShareAppMessage(shareData)
                        wx.onMenuShareTimeline(shareData)
                        wx.onMenuShareQQ(shareData)
                    })
                    wx.error(function (err) {
                        console.log(err.errMsg)
                    })
                },
                fail: function (status) {
                    console.log('wx share fail status ' + status)
                }
            })
        </script>`
}

export { statistics, myStylesScripts, wxShare }
