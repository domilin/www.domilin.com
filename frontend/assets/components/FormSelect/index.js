import React, { useState, useEffect, useRef, useCallback } from 'react'
import loadable from '@loadable/component'
import { windowOffset, isChromeExtension } from '../../public/js'
import './index.scss'

let OptionsComps = require('./Options').default
if (!isChromeExtension()) {
    OptionsComps = loadable(() => import('./Options'), { ssr: false })
}

/** @desc
 * options: [{value: 'demo', name: 0}]
 * defaultValue: {value: 'demo', name: 0}
 */
export default ({
    options,
    defaultValue,
    onChange
}) => {
    // 默认值
    const initVal = { value: '', name: '下拉选择' }
    const [curVal, setCurVal] = useState(defaultValue || initVal)
    const defVal = useRef(null)
    useEffect(() => {
        if (defVal.current === defaultValue) return
        defVal.current = defaultValue
        setCurVal(defaultValue && defaultValue.name ? defaultValue : initVal)
    }, [defaultValue, initVal, options])

    // 弹出层样式
    const defOptStyle = {
        display: 'none'
    }
    const formSelect = useRef()
    const [optStyle, setOptStyle] = useState(defOptStyle)
    const enterHandle = useCallback(() => {
        const box = formSelect.current.getBoundingClientRect()
        const win = windowOffset()
        setOptStyle({
            display: 'block',
            right: `${win.width - box.right}px`,
            top: `${box.bottom + 8}px`
        })
    }, [])
    const leaveHandle = useCallback(() => {
        setOptStyle(defOptStyle)
    }, [defOptStyle])
    return <div className="form-select-wrapper" ref={formSelect}>
        <div
            className="form-select-button"
            onMouseLeave={leaveHandle}
            onMouseEnter={enterHandle}>
            <div className="form-select-current-value">{curVal && curVal.name}</div>
            <div className="form-select-button-icons">
                <span className="iconfont">&#xe6de;</span>
                <span className="iconfont">&#xe661;</span>
            </div>
        </div>
        {optStyle.display === 'block' && <OptionsComps {...{ leaveHandle, enterHandle, optStyle, options, setCurVal, onChange }}/>}
    </div>
}
