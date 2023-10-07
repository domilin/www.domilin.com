import React from 'react'
import { createPortal } from 'react-dom'

export default ({ menuShow, setMenuShow }) => createPortal(
    <div className="layout-header-menu" onClick={() => setMenuShow(!menuShow)}>
        {!menuShow && <span className="iconfont">&#xe6cf;</span>}
        {menuShow && <span className="iconfont">&#xe6be;</span>}
    </div>,
    document.getElementById('root')
)
