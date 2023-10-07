import React from 'react'
import './index.scss'

export default ({
    type,
    size,
    children,
    onClick,
    style
}) => {
    let className = 'default-button'
    if (type === 'default' || type === 'grey') className = `${type}-button`
    if (size === 'small' || size === 'large' || size === 'middle') className += ` ${size}`
    return <button
        style={{ ...style }}
        onClick={onClick}
        className={className}>
        {children}
    </button>
}
