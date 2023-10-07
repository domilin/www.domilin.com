import React, { useState, useEffect, useRef } from 'react'
import './index.scss'
import UseMemo from '../UseMemo'

/** @desc 类型分为img,color,component，默认或不传为图片”img“类型
 * options: [{value: 'Image-url' name: 0, type: 'img/color/component', option: 'left'}]
 * defaultValue: {value: 'Image-url', name: 0, type: 'img/color/component', option: 'left'}
 */
export default ({
    options,
    defaultValue,
    onChange
}) => {
    const [curVal, setCurVal] = useState(defaultValue || options[0])

    const defVal = useRef(null)
    useEffect(() => {
        if (defVal.current === defaultValue) return
        defVal.current = defaultValue
        setCurVal(defaultValue || options[0])
    }, [defaultValue, options])
    return <UseMemo deps={[options, onChange, curVal]}>
        {() => <div className="block-select-wrapper">
            {Array.isArray(options) && options.map(function (item, index) {
                return <div
                    key={index}
                    className={`block-select-option ${curVal.option === item.option ? 'active' : ''}`}
                    onClick={() => {
                        onChange && onChange(item)
                        setCurVal(item)
                    }}>
                    <div className="select-option-content">
                        {
                            item.type === 'color'
                                ? <div className="select-option-color" style={{ background: item.value }}/>
                                : item.type === 'component'
                                    ? item.value
                                    : <img src={item.value}/>
                        }
                    </div>
                    <p className="select-option-name">{item.name}</p>
                </div>
            })}
        </div>}
    </UseMemo>
}
