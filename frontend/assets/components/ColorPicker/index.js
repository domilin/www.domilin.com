import React, { useState, useEffect } from 'react'
import transparentBg from './images/transparent-background.svg'
import './index.scss'
import { trim, colorHex, iconBackgroundColor } from '../../public/js'

export default ({ onChange, defaultValue }) => {
    const [curColor, setCurColor] = useState(defaultValue || 'transparent')

    useEffect(() => {
        setCurColor(defaultValue || 'transparent')
    }, [defaultValue])
    return (
        <div className="color-picker-wapper">
            <div className="color-picker-box">
                {iconBackgroundColor.map(function (item, index) {
                    const bg = item === 'transparent'
                        ? { backgroundImage: `url("${transparentBg}")` }
                        : { backgroundColor: item }
                    return (
                        <span
                            key={index}
                            onClick={() => {
                                setCurColor(item)
                                onChange && onChange(item)
                            }}
                            className={item === curColor ? 'active' : ''}
                            style={{ ...bg, color: item }}
                        />
                    )
                })}
            </div>
            <div className="color-picker-input">
                <input
                    type="text"
                    placeholder="#"
                    value={curColor ? (curColor.indexOf('rgb') > -1 ? colorHex(curColor) : curColor) : ''}
                    onChange={(event) => {
                        const val = trim(event.target.value)
                        onChange(val)
                        setCurColor(val)
                    }}
                ></input>
            </div>
        </div>
    )
}
