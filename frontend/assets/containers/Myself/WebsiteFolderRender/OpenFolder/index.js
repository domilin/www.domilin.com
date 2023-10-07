import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPortal } from 'react-dom'

import './index.scss'

import dragable from '../../useDragable'
import WebsiteItemRender from '../../WebsiteItemRender'
import FormItem from '../../../../components/FormItem'
import { trim } from '../../../../public/js'
import { useCallbackAsync } from '../../../../public/hooks'
import Toast from '../../../../components/Toast'
import { iconTypes } from '../../../../models/public'

export default ({ itemIn, setCurEditSite, setAddSiteShow, setOpenFolder }) => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }))
    const {
        dropFolderOuter,
        isOverFolderOuter
    } = dragable({ itemId: itemIn._id })

    // 文件夹名字编辑
    const inputEle = useRef()
    const nameChanging = useRef(false)
    const [folderNameEdit, setFolderNameEdit] = useState(false)
    const [folderName, setFolderName] = useState(itemIn.name)
    useEffect(() => setFolderName(itemIn.name), [itemIn.name])
    useEffect(() => {
        if (!folderNameEdit) return
        inputEle.current.removeAttribute('readonly')
        inputEle.current.focus()
    }, [folderNameEdit])
    const nameEditDone = useCallbackAsync(async () => {
        if (folderName === '') return
        setFolderNameEdit(false)

        if (nameChanging.current) return
        nameChanging.current = true
        const res = await dispatch.user.folderEditXhr({
            ...itemIn,
            name: folderName
        })
        nameChanging.current = false

        if (res.code !== 1) Toast.error(res.msg)
    }, [dispatch.user, folderName, itemIn, nameChanging])

    const refDropOuter = dropFolderOuter ? { ref: dropFolderOuter } : {}
    const dropOuterStype = isOverFolderOuter ? { opacity: 0.5 } : {}

    let iconTypeClassName = ''
    if (userInfo) {
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

    return createPortal(<div
        id={`websiteFolder${itemIn._id}`}
        className={`website-folder-open ${iconTypeClassName}`}>
        <div className="website-folder">
            <div className="website-folder-content">
                <div className="website-item-list-scroll">
                    <div className="website-item-list">
                        {itemIn.children.map(function (itemChild, index) {
                            return <WebsiteItemRender
                                key={itemChild._id}
                                {...{ itemIn: itemChild, setCurEditSite, setAddSiteShow }}
                            />
                        })}
                    </div>
                </div>
            </div>
            <div className="website-folder-name">
                <div
                    style={{ display: folderNameEdit ? 'block' : 'none' }}
                    className="website-folder-name-editor">
                    <FormItem
                        ref={inputEle}
                        defaultValue={folderName}
                        onEnterKeyUp={nameEditDone}
                        onInputValue={(value) => setFolderName(trim(value))}
                    />
                </div>
                <div
                    style={{
                        display: folderNameEdit ? 'none' : 'block'
                    }}
                    className="website-folder-name-text"
                    onClick={() => {
                        setFolderNameEdit(true)
                    }}>
                    {folderName}
                </div>
            </div>
        </div>
        <div
            {...refDropOuter}
            style={{ ...dropOuterStype }}
            className="website-folder-open-mask"
            onClick={() => {
                setOpenFolder(false)
                setFolderNameEdit(false)
            }}>
        </div>
    </div>, document.querySelector('.category-wrapper'))
}
