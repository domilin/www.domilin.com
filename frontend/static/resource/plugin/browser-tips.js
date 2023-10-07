var styleSheetCheck = 'body,div,p,a,h1,h3{margin:0;padding:0;font-family:"Microsoft YaHei UI Light","Microsoft YaHei";font-weight:normal}' +
    'a{text-decoration:none;cursor:pointer}' +
    'html,body{height:100%;position:initial;}' +
    '.browser-tips-mask{position:fixed;left:0;top:0;background:#fff;height:100%;width:100%;z-index:9998;}' +
    '.browser-tips{margin-left:-400px;position:fixed;left:50%;top:200px;background:#fff;border-radius:5px;height:450px;width:800px;color:#454545;z-index:9999;}' +
    '.browser-tips h1{margin:72px auto 50px;display:block;color:#ba5750;font-size:36px;text-align:center;}' +
    '.browser-tips h3{margin:16px auto 0;color:#764b45;font-size:16px;line-height:32px;text-align:center;}' +
    '.browser-tips p{margin:48px auto 0;width:800px;text-align:center;text-align:center;}' +
    '.browser-tips p a{margin:0 16px;display:inline-block;height:52px;width:148px;color:#b74c44;font-size:16px;line-height:52px;text-align:center;}' +
    '.browser-tips p a:hover{color:#0050b5}'
    
var ieVerCheck = ieVersionCheck()
if (ieVerCheck !== -1) {
    loadStyleStringCheck(styleSheetCheck)
    if (ieVerCheck > 7) {
        createEleCheck()
    } else {
        document.body.innerHTML = '<div class="browser-tips-mask" id="browserTipsMask">' +
            '<div class="browser-tips" id="browserTips">' +
            '<h1>浏览器版本过低</h1>' +
            '<h3>我们检测到您的浏览器版本过低，可能存在安全风险！请使用以下浏览器浏览。</h3>' +
            '<h3>QQ、360、搜狗等国产浏览器请使用安全/极速模式</h3>' +
            '<p>' +
            '<a href="https://www.microsoft.com/zh-cn/edge">Microsoft Edge</a>' +
            '<a href="https://www.google.com/chrome/">Google Chrome</a>' +
            '<a href="https://www.mozilla.org/zh-CN/firefox/new/">Firefox</a>' +
            '</p></div></div>'
    }
}

function ieVersionCheck () {
    var userAgent = navigator.userAgent
    var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    var isEdge = userAgent.indexOf('Edge') > -1 && !isIE
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    if (isIE) {
        var reIE = new RegExp('MSIE (\\d+\\.\\d+);')
        reIE.test(userAgent)
        var fIEVersion = parseFloat(RegExp['$1'])
        if (fIEVersion === 7) {
            return 7
        } else if (fIEVersion === 8) {
            return 8
        } else if (fIEVersion === 9) {
            return 9
        } else if (fIEVersion === 10) {
            return 10
        } else {
            return 6
        }
    } else if (isEdge) {
        return 'edge'
    } else if (isIE11) {
        return 11
    } else {
        return -1
    }
}

function createEleCheck () {
    var body = document.body

    var mask = document.createElement('div')
    mask.setAttribute('class', 'browser-tips-mask')
    mask.setAttribute('id', 'browserTipsMask')
    body.appendChild(mask)

    var tips = document.createElement('div')
    tips.setAttribute('class', 'browser-tips')
    tips.setAttribute('id', 'browserTips')
    body.appendChild(tips)

    var h1 = document.createElement('h1')
    h1.innerText = '浏览器版本过低'
    tips.appendChild(h1)

    var h3 = document.createElement('h3')
    h3.innerText = '我们检测到您的浏览器版本过低，可能存在安全风险！请使用以下浏览器浏览。'
    tips.appendChild(h3)

    var h3 = document.createElement('h3')
    h3.innerText = 'QQ、360、搜狗等国产浏览器请使用安全/极速模式'
    tips.appendChild(h3)

    var p = document.createElement('p')
    tips.appendChild(p)

    createA('https://www.microsoft.com/zh-cn/edge', 'Microsoft Edge')
    createA('https://www.google.com/chrome/', 'Google Chrome')
    createA('https://www.mozilla.org/zh-CN/firefox/new/', 'Firefox')

    function createA (href, text) {
        var a = document.createElement('a')
        a.setAttribute('href', href)
        a.setAttribute('target', '_blank')
        a.innerText = text
        p.appendChild(a)
    }
}

function loadStyleStringCheck (css) {
    var style = document.createElement('style')
    style.type = 'text/css'
    try {
        style.appendChild(document.createTextNode(css))
    } catch (ex) {
        style.styleSheet.cssText = css
    }
    var head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
}
