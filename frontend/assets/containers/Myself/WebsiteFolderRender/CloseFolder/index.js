import React from 'react'
import { useSelector } from 'react-redux'

import './index.scss'

import dragable from '../../useDragable'
import WebsiteItemRender from '../../WebsiteItemRender'
import { iconTypes } from '../../../../models/public'

export default ({ itemIn, setCurEditSite, setAddSiteShow, setOpenFolder }) => {
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }))
    const {
        drag,
        isDragging,
        dropSort,
        isOverSort,
        dropFolderAdd,
        isOverFolderAdd
    } = dragable({ itemId: itemIn._id })

    let iconTypeClassName = ''
    let boxShadowNo = {}
    let textShadowNo = {}
    if (userInfo) {
        if (!userInfo.iconShadow) boxShadowNo = { boxShadow: 'none' }
        if (!userInfo.iconShadow) textShadowNo = { textShadow: 'none' }

        if (userInfo.iconType === iconTypes.efficient) {
            iconTypeClassName = 'icon-efficient'
        }
        if (userInfo.iconType === iconTypes.light) {
            iconTypeClassName = 'icon-light'
        }
        if (userInfo.iconType === iconTypes.classic) {
            iconTypeClassName = 'icon-classic'
        }
    }

    // 拖拽
    const dragFolder = typeof window !== 'undefined' && document.getElementById(`websiteFolder${window.curDragId}`) // 拖动的不是文件夹，才添加文件夹效果
    const refDrag = drag ? { ref: drag } : {}
    const refDropSort = dropSort ? { ref: dropSort } : {}
    const refDropFolder = dropFolderAdd ? { ref: dropFolderAdd } : {}
    const draggingStyle = isDragging ? { opacity: 0.5 } : {}
    const dropActiveSort = isOverSort ? { transform: 'scale(1.08)' } : {}
    const dopActiveFolder = isOverFolderAdd && !dragFolder ? 'add-to-folder' : ''

    return <div
        {...refDrag}
        id={`websiteFolder${itemIn._id}`}
        className={`website-folder-close ${dopActiveFolder} ${iconTypeClassName}`}
        style={{
            ...dropActiveSort,
            ...draggingStyle
        }}>
        <div className="website-item-list" style={{ ...boxShadowNo }}>
            {itemIn.children.map(function (itemChild, index) {
                if (index > 3) return
                return <WebsiteItemRender
                    key={itemChild._id}
                    {...{ itemIn: { ...itemChild, onlyIcon: true }, setCurEditSite, setAddSiteShow }}
                />
            })}
        </div>
        <div className="website-add-folder-bg"/>
        <div
            {...refDropSort}
            className="website-folder-drop-sort"
            onClick={() => setOpenFolder(true)}>
        </div>
        <div
            {...refDropFolder}
            className="website-folder-drop-folder"
            onClick={() => setOpenFolder(true)}>
        </div>
        <div
            className="website-folder-name"
            style={{
                ...textShadowNo
            }}>
            {itemIn.name}
        </div>
    </div>
}
