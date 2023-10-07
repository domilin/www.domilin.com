import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import loadable from '@loadable/component'

import './index.scss'

import { staticDomain } from '../../../config/config'
import { siteIconType, isChromeExtension } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'
import logoWhite from '../../public/imgs/logo-white.png'
import { iconTypes } from '../../models/public'

const SimpleImg = loadable(() => import('./SimpleImg'), { ssr: false })
export default (props) => {
    const {
        onClick,
        background,
        url,
        icon,
        name,
        intro,
        iconType,
        officialIcon,
        page
    } = props
    const dispatch = useDispatch()
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

    /** @desc ------------------------拖拽移动 ------------------------  */
    const dragImg = useRef(null)
    useEffect(() => {
        const img = new Image()
        img.src = logoWhite
        img.onload = () => {
            dragImg.current = img
        }
    }, [])
    const dropEffect = 'all' // all, move, copy, link, copyMove, copyLink, linkMove, none
    const [isDragging, setIsDragging] = React.useState(false)
    const draggingStyle = isDragging ? { opacity: 0.5 } : {}
    const dropIn = useRef(false)
    const [dropInState, setDopInState] = useState(false)

    const dragEnd = useCallback(() => {
        // 数据与样式还原
        setIsDragging(false)
        setDopInState(false)
        dropIn.current = false
        window.dragItem = null
        window.dropItem = null
    }, [])
    const startDrag = useCallback((event) => {
        setIsDragging(true)
        // 设置拖动元素数据
        event.dataTransfer.setData('dragItem', JSON.stringify(props))
        // 全局保存当前拖动的元素数据
        window.dragItem = props

        /* ---------拖动效果，拖动图片(暂时使用默认值)--------- */
        event.dataTransfer.effectAllowed = dropEffect
        // 设置拖动时鼠标旁边的图片
        if (dragImg.current && dragImg) {
            // event.dataTransfer.setDragImage(dragImg.current, 0, 0)
        }
    }, [props])
    const dragEnter = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = dropEffect
    }, [])
    const dragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = dropEffect

        // -------------数据缓存+是否在存放元素中
        if (dropIn.current) return
        dropIn.current = true
        setDopInState(true)
        // -------------调换数据
        window.dropItem = props
        dispatch.user.siteDragOver({
            dragItem: window.dragItem,
            dropItem: window.dropItem
        })
    }, [dispatch.user, dropIn, props])
    const dragLeave = useCallback((event) => {
        event.preventDefault()
        // -------------数据缓存+是否在存放元素中
        if (!dropIn.current) return
        dropIn.current = false
        setDopInState(false)
        // -------------调换数据
        dispatch.user.siteDragLeave({
            dragItem: window.dragItem,
            dropItem: window.dropItem
        })
    }, [dispatch.user, dropIn])
    const drop = useCallbackAsync(async (event) => {
        const droppedItem = event.dataTransfer.getData('dragItem')
        if (!droppedItem) return
        const dragData = JSON.parse(droppedItem)

        const res = await dispatch.user.siteExchange({
            dragId: dragData._id,
            dropId: window.dropItem._id
        })
        if (res.code !== 1) {
            dispatch.user.siteDragLeave({
                dragItem: dragData,
                dropItem: window.dropItem
            })
        }
    }, [dispatch.user])

    const dragAttr = page === 'mine' ? {
        draggable: true,
        onDragStart: startDrag,
        onDragOver: dragOver,
        onDrop: drop,
        onDragEnd: dragEnd,
        onDragEnter: dragEnter,
        onDragLeave: dragLeave
    } : {}

    /** @desc ------------------------自定义设置 ------------------------  */
    let itemStyle = {}
    let nameStyle = {}
    if (page === 'mine' && userInfo && 'iconType' in userInfo) {
        if (userInfo.iconType === iconTypes.efficient) {
            itemStyle = { width: '228px' }
            nameStyle = { display: 'block' }
        }
        if (userInfo.iconType === iconTypes.light) {
            itemStyle = { width: '86px' }
            nameStyle = { display: 'none' }
        }
    }

    // 是否显示详情
    const showDetail = page === 'mine' ? {} : { title: `${name}-${intro}` }

    // chrome-extension中newtab.html为当前页面打开
    let openTarget = { target: '_blank' }
    if (isChromeExtension() && window.pageType && window.pageType === 'newTab') {
        openTarget = {}
    }

    // 官方添加时点击直接添加， 不跳转
    let aHref = {}
    if (page !== 'addsite') {
        aHref = { href: url }
    }
    return <a
        {...dragAttr}
        onClick={onClick}
        onMouseLeave={() => setBoxShadow({})}
        onMouseOver={() => setBoxShadow({ boxShadow: `0 4px 16px 0 ${background}` })}
        className={`website-item-wrapper ${dropInState ? 'active' : ''}`}
        style={{ ...boxShadow, ...draggingStyle, ...itemStyle }}
        {...aHref}
        {...openTarget}
        rel="nofollow noopener noreferrer">
        <div className="website-item-icon" style={{ backgroundColor: background }}>
            {iconHtml}
        </div>
        <div className="website-item-info">
            <h5 className="website-item-name" style={{ ...nameStyle }}>{name}</h5>
            <h5 className="website-item-intro" title={intro}>{intro}</h5>
        </div>
        {/* 防止拖动事件，在子元素间移动时也会触发onDragLeave,onDragOver等事件 */}
        <div className="website-item-drag-mask" {...showDetail}/>
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
