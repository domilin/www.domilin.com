import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import loadable from '@loadable/component'

import { staticDomain } from '../../../config/config'
import { siteIconType, isChromeExtension } from '../../public/js'
import logoWhite from '../../public/imgs/logo-white.png'
import { iconTypes } from '../../models/public'
import './index.scss'

const SimpleImg = loadable(() => import('./SimpleImg'), { ssr: false })
export default (props) => {
    const {
        onClick,
        // 图标显示字段
        // _id,
        background, url, icon, name, intro, iconType, officialIcon,
        // 哪个页面引用
        page,
        // 拖拽props
        drag, isDragging, dropSort, isOverSort, dropFolderNew, isOverFolderNew,
        // 只渲染icon，文件夹关闭状态下需要
        onlyIcon
    } = props
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }))
    const [boxShadow, setBoxShadow] = useState({})

    let iconHtml = (icon === '' || icon === 'null')
        ? <img style={{ transform: 'scale(0.7)' }} src={logoWhite} alt={name}/>
        : <SimpleImg icon={icon}/>

    if (iconType) {
        if (iconType === siteIconType[0]) {
            if (officialIcon) {
                iconHtml = <img src={`${staticDomain}${officialIcon}`} alt={name}/>
            } else {
                iconHtml = <img style={{ transform: 'scale(0.7)' }} src={logoWhite} alt={name}/>
            }
        } else if (iconType === siteIconType[1]) {
            iconHtml = <span className="icon-character">{icon}</span>
        } else if (iconType === siteIconType[2]) {
            // 保持原值
        }
    }

    /** @desc ------------------------自定义设置 ------------------------  */
    let iconTypeClassName = ''
    let boxShadowIcon = {}
    let boxShadowImg = {}
    let boxShadowNo = {}
    let textShadowNo = {}
    let openTarget = {}
    if (page === 'mine' && userInfo) {
        if (!userInfo.iconShadow) boxShadowNo = { boxShadow: 'none' }
        if (!userInfo.iconShadow) textShadowNo = { textShadow: 'none' }

        if (userInfo.iconType === iconTypes.efficient) {
            iconTypeClassName = 'icon-efficient'
            if (userInfo.iconShadow) boxShadowIcon = boxShadow
        }
        if (userInfo.iconType === iconTypes.light) {
            iconTypeClassName = 'icon-light'
            if (userInfo.iconShadow) boxShadowImg = boxShadow
        }
        if (userInfo.iconType === iconTypes.classic) {
            iconTypeClassName = 'icon-classic'
            if (userInfo.iconShadow) boxShadowImg = boxShadow
        }

        if (userInfo.iconOpenWay === 'blank') {
            openTarget = { target: '_blank' }
        }
    }

    // chrome-extension中popup.html总为新标签页打开，当前标签页无法打开
    if (isChromeExtension() && window.pageType && window.pageType === 'popup') {
        openTarget = { target: '_blank' }
    }

    // 鼠标移入-->是否显示详情
    const showDetail = page === 'mine' ? {} : { title: `${name}-${intro}` }

    // 官方添加时点击直接添加， 不跳转
    let aHref = {}
    if (page !== 'addsite') {
        aHref = { href: url }
    }

    // 拖拽
    const dragFolder = typeof window !== 'undefined' && document.getElementById(`websiteFolder${window.curDragId}`) // 拖动的不是文件夹，才添加文件夹效果
    const refDrag = drag ? { ref: drag } : {}
    const refDropSort = dropSort ? { ref: dropSort } : {}
    const refDropFolder = dropFolderNew ? { ref: dropFolderNew } : {}
    const draggingStyle = isDragging ? { opacity: 0.5 } : {}
    const dropActiveSort = isOverSort ? { transform: 'scale(1.08)' } : {}
    const dopActiveFolder = isOverFolderNew && !dragFolder ? 'new-folder' : ''
    return <a
        {...refDrag}
        {...aHref}
        {...openTarget}
        onClick={onClick}
        onMouseLeave={() => setBoxShadow({})}
        onMouseOver={() => setBoxShadow({ boxShadow: `0 4px 16px 0 ${background}` })}
        className={`website-item-wrapper ${dopActiveFolder} ${iconTypeClassName}`}
        style={{
            ...boxShadowIcon,
            ...draggingStyle,
            ...dropActiveSort,
            ...boxShadowNo
        }}
        rel="nofollow noopener noreferrer">
        {!onlyIcon && <div className="website-item-new-folder-bg"/>}
        {!onlyIcon && <div
            {...refDropSort}
            {...showDetail}
            className="website-item-drop-sort"
        />}
        {!onlyIcon && <div
            {...refDropFolder}
            {...showDetail}
            className="website-item-drop-folder"
        />}
        <div
            className="website-item-icon"
            style={{
                backgroundColor: background,
                ...boxShadowImg,
                ...boxShadowNo
            }}>
            {iconHtml}
        </div>
        <div className="website-item-info">
            <h5 className="website-item-name" style={{ ...textShadowNo }}>{name}</h5>
            {!onlyIcon && <h5 className="website-item-intro" title={intro}>
                {intro}
            </h5>}
        </div>
        {/* <button onClick={(event) => {
            // 阻止合成事件的冒泡
            event.stopPropagation()
            // 阻止与原生事件的冒泡
            event.nativeEvent.stopImmediatePropagation()
            // 阻止默认事件
            event.preventDefault()
        }} className="iconfont">&#xe88b;</button> */}
    </a>
}
