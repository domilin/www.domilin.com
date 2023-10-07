import React from 'react'
import { useSelector } from 'react-redux'

import './index.scss'
import UseMemo from '../UseMemo'
import { themes } from '../../models/public'

export default ({
    title,
    children,
    className,
    style
}) => {
    const { userInfo, preview } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        preview: state.public.userInfo.preview
    }))
    return <UseMemo deps={[children]}>
        {() => <div
            style={{
                ...style,
                opacity: preview ? '0.86' : '',
                background: userInfo && userInfo.theme === themes.night && userInfo.preview
                    ? 'rgba(32, 33, 36, 0.96)'
                    : ''
            }}
            className={`block-on-popup ${className || ''}`}>
            {title && <h3 className="block-title">{title}</h3>}
            <div className="block-body">
                {children}
            </div>
        </div>}
    </UseMemo>
}
