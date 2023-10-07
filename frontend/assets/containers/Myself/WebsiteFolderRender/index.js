import React, { useState, useEffect, useRef } from 'react'

import CloseFolder from './CloseFolder'
import OpenFolder from './OpenFolder'

export default (props) => {
    const [open, setOpen] = useState(false)
    const [openAfter, setOpenAfter] = useState(false) // 样式设置完成后弹出

    const beforeZIndex = useRef()
    useEffect(() => {
        const layoutContent = document.querySelector('.layout-content')
        if (open) {
            beforeZIndex.current = layoutContent.style.zIndex
            layoutContent.style.zIndex = 10
            setOpenAfter(true)
        } else {
            layoutContent.style.zIndex = beforeZIndex.current || ''
            setOpenAfter(false)
        }
    }, [open])
    return <>
    {!openAfter && <CloseFolder {...props} setOpenFolder={setOpen}/>}
    {openAfter && <div className="website-item-folder-instead"></div>}
    {openAfter && <OpenFolder {...props} setOpenFolder={setOpen}/>}
    </>
}
