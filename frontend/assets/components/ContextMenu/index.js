import React, { useState, useCallback } from 'react'
import loadable from '@loadable/component'
import './index.scss'
import { isChromeExtension, mouseOffset } from '../../public/js'

let OptionsComps = require('./Options').default
if (!isChromeExtension()) {
    OptionsComps = loadable(() => import('./Options'), { ssr: false })
}

export default ({
    options,
    onChange,
    className,
    style,
    children
}) => {
    const [show, setShow] = useState(false)
    const [pos, setPos] = useState({
        left: 0,
        top: 0
    })

    const menuBtnHandle = useCallback((event) => {
        event.preventDefault()

        const mousePos = mouseOffset(event)
        setPos({
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`
        })
        setShow(true)
    }, [])

    const forbidSlectWords = useCallback((event) => {
        // 右键 + 用户没有选择文字
        if (event.button !== 2 || !window.getSelection().isCollapsed) return
        // 禁用文字选择
        document.body.style.userSelect = 'none'
        // 下一帧恢复选择能力
        setTimeout(() => {
            document.body.style.userSelect = 'auto'
        }, 0)
    }, [])
    return <div className={`context-menu-wrapper ${className || ''}`} style={{ ...style }}>
        <div
            onMouseDown={forbidSlectWords}
            onMouseLeave={() => setShow(false)}
            onContextMenu={menuBtnHandle}
            className="context-meun-button">
            {children}
        </div>
        {show && <OptionsComps {...{ show, setShow, pos, options, onChange }}/>}
    </div>
}
