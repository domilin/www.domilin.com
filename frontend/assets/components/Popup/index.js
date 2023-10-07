import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import './index.scss'
import UseMemo from '../UseMemo'

export default ({
    children,
    show,
    close,
    className,
    wrapperClassName
}) => {
    const { preview } = useSelector((state) => ({
        preview: state.public.userInfo.preview
    }))

    // 显示时让弹出框在最上层
    // 按项目布局定--只需要layout-content在layout-header,layout-header-auto等外层布局上就好
    const beforeZIndex = useRef()
    useEffect(() => {
        const layoutContent = document.querySelector('.layout-content')
        if (!layoutContent) return

        if (show) {
            beforeZIndex.current = layoutContent.style.zIndex
            layoutContent.style.zIndex = 10
        } else {
            layoutContent.style.zIndex = beforeZIndex.current || ''
        }

        return () => {
            layoutContent.style.zIndex = beforeZIndex.current || ''
        }
    }, [show])

    return <UseMemo deps={[children, show, close]}>
        {() => <div
            className={`popup-wrapper ${wrapperClassName || ''}`}
            style={{
                display: show ? 'flex' : 'none'
            }}>
            <div
                className="popup-content"
                style={{ background: preview ? 'none' : '' }}>
                <div
                    className="popup-close iconfont"
                    style={{ opacity: preview ? '0' : '' }}
                    onClick={close}>
                        &#xe6be;
                </div>
                <div className={`popup-box ${className || ''}`}>{children}</div>
            </div>
            <div className="popup-mask" onClick={close}></div>
        </div>}
    </UseMemo>
}
