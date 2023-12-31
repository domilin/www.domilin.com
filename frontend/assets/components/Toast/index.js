import React from 'react'
import ReactDOM from 'react-dom'

import './index.scss'

import Toast from './ToastBox'

async function createNotification () {
    let windowLoaded = false
    window.onload = function () {
        windowLoaded = true
    }

    await new Promise(function (resolve, reject) {
        if (windowLoaded) {
            resolve(true)
        } else {
            const timer = setInterval(function () {
                if (windowLoaded) return

                clearInterval(timer)
                resolve(true)
            }, 10)
        }
    })
    const div = document.createElement('div')
    document.body.appendChild(div)
    const notification = ReactDOM.render(<Toast/>, div)
    return {
        addNotice (notice) {
            return notification.addNotice(notice)
        },
        destroy () {
            if (!div || !document.body) return
            ReactDOM.unmountComponentAtNode(div)
            document.body.removeChild(div)
        }
    }
}

let notification
const notice = async (type, content, duration = 2000, onClose) => {
    if (!notification) notification = await createNotification()
    return notification.addNotice({ type, content, duration, onClose })
}

export default {
    info (content, duration, onClose) {
        return notice('info', content, duration, onClose)
    },
    success (content = '操作成功', duration, onClose) {
        return notice('success', content, duration, onClose)
    },
    error (content, duration, onClose) {
        return notice('error', content, duration, onClose)
    },
    loading (content = '加载中...', duration = 0, onClose) {
        return notice('loading', content, duration, onClose)
    }
}
