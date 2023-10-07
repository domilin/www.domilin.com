import React from 'react'
import './index.scss'
import UseMemo from '../UseMemo'

export default ({
    children,
    onClick,
    title,
    className,
    style
}) => <UseMemo deps={[children, onClick]}>
    {() => <div
        className={`form-item-button ${className || ''}`}
        style={{ ...style }}
        onClick={onClick}>
        <div className="form-item-button-content">
            {title && <h5>{title}</h5>}
            {children || <span className="iconfont">&#xe6a3;</span>}
        </div>
    </div>}
</UseMemo>
