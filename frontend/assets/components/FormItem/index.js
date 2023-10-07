import React, { forwardRef, useEffect, useState } from 'react'
import './index.scss'
import PureInput from '../PureInput'

export default forwardRef(({
    children,
    placeholder,
    style,
    title,
    error,
    onChange,
    onFocus,
    onBlur,
    onKeyUp,
    onInputValue,
    onEnterKeyUp,
    className,
    childType,
    defaultValue,
    name
}, ref) => {
    const [curVal, setCurVal] = useState(defaultValue || '')
    useEffect(() => {
        setCurVal(defaultValue || '')
    }, [defaultValue])
    return <div className={`form-item ${className || ''}`} style={{ ...style }}>
        {title && <h4>{title}</h4>}
        {error && <div className="error">
            <span className="iconfont">&#xe812;</span>
            {error}
        </div>}
        {children || <PureInput
            ref={ref}
            name={name}
            value={curVal}
            onKeyUp={onKeyUp}
            onFocus={onFocus}
            onBlur={onBlur}
            onInputValue={onInputValue}
            onEnterKeyUp={onEnterKeyUp}
            onChange={(event) => {
                onChange && onChange(event)
                setCurVal(event.target.value)
            }}
            placeholder={placeholder}
            type={childType || 'text'}/>}
    </div>
})
