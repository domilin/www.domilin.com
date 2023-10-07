
import $ from 'jquery'
import { onMessageContentScript, getSiteInfo } from '@/public/js'
// import { printLine } from './modules/print'

onMessageContentScript(getSiteInfo, function () {
    const title = $('title').text()
    const description = $('meta[name=description]').attr('content')
    const url = `${window.location.protocol}//${window.location.hostname}`
    // 此处可获取icon，传到服务器，并返回书图片地址
    return { title, description, url }
})

// console.log('Content script works!')
// console.log('Must reload extension for modifications to take effect.')
// printLine("Using the 'printLine' function from the Print Module")
