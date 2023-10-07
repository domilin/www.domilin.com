import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { createPortal } from 'react-dom'
import Cookies from 'js-cookie'
import download from 'downloadjs'

import './index.scss'
import synchronousImage from './images/no-signin-synchronous.png'

import logo from '../../../../public/imgs/logo-white.png'
import FormItemButton from '../../../FormItemButton'
import FormItem from '../../../FormItem'
import BlockOnPopup from '../../../BlockOnPopup'
import ImageCropper from '../../../ImageCropper'
import FormSelect from '../../../FormSelect'
import FormSwitch from '../../../FormSwitch'
import Button from '../../../Button'
import Toast from '../../../Toast'
import BindEmail from './BindEmail'
import ImportExport from './ImportExport'
import { trim, isPsd, cookiesName, isChromeExtension, chromeCookie, formatTime } from '../../../../public/js'
import { staticDomain, frontendDomain, chromeFrontend } from '../../../../../config/config'
import { engines } from '../../../../models/public'
import { useSettingChange, useCallbackAsync } from '../../../../public/hooks'

const modifyTypeArr = ['nickName', 'avatar', 'password', 'bindEmail']
const engineOtions = [
    { value: 2, name: engines.baidu.replace(/^\S/, s => s.toUpperCase()) },
    { value: 1, name: engines.google.replace(/^\S/, s => s.toUpperCase()) },
    { value: 3, name: engines.bing.replace(/^\S/, s => s.toUpperCase()) },
    { value: 4, name: engines.sogou.replace(/^\S/, s => s.toUpperCase()) },
    { value: 5, name: engines['360'].replace(/^\S/, s => s.toUpperCase()) }
]
export default ({ style }) => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }), shallowEqual)
    const [modifyType, setModifyType] = useState(null)

    // 修改昵称
    const nickName = useRef()
    const changeNickName = useCallbackAsync(async () => {
        const val = trim(nickName.current.value)
        if (!val) {
            Toast.error('昵称不能为空')
            return
        }
        const res = await dispatch.public.setting({
            nickName: val
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        Toast.info('修改成功')
        nickName.current.value = ''
    }, [dispatch])

    // 修改头像
    const avatarInput = useRef()
    const [cropImg, setCropImg] = useState(null)
    const [iconImg, setIconImg] = useState({
        url: null,
        blob: null
    })
    const onSelectFile = useCallback((event) => {
        if (event.target.files && event.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => setCropImg(reader.result))
            reader.readAsDataURL(event.target.files[0])
            avatarInput.current.value = ''
        }
    }, [])
    const changeAvatar = useCallbackAsync(async () => {
        if (!iconImg.blob) return
        if ((iconImg.blob.size / 1024).toFixed(0) > 512) {
            Toast.info('图片请小于512KB')
            return
        }

        const res = await dispatch.public.uploadAvatarImage({ avatar: iconImg.blob })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        const resSet = await dispatch.public.setting({
            avatar: res.data.url
        })
        if (resSet.code !== 1) {
            Toast.info(resSet.msg)
        }
        Toast.info('头像修改成功')
        setCropImg(null)
        setIconImg({
            blob: null,
            url: res.data.url
        })
    }, [dispatch.public, iconImg.blob])

    // 修改密码
    const oldPsd = useRef()
    const newPsd = useRef()
    const reNewPsd = useRef()
    const changePsd = useCallbackAsync(async () => {
        const oldPsdVal = trim(oldPsd.current.value)
        const newPsdVal = trim(newPsd.current.value)
        const reNewPsdVal = trim(reNewPsd.current.value)
        if (!isPsd(oldPsdVal)) {
            Toast.error('原密码格式不正确')
            return
        }
        if (!isPsd(newPsdVal)) {
            Toast.error('新密码格式不正确')
            return
        }
        if (newPsdVal !== reNewPsdVal) {
            Toast.error('两次输入密码不相同')
            return
        }

        const { encodePassword } = require('../../../../public/js/indexBrowser')
        const res = await dispatch.public.changePsd({
            oldPsd: encodePassword(oldPsdVal),
            newPsd: encodePassword(newPsdVal)
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        Toast.info('修改成功')
        oldPsd.current.value = ''
        newPsd.current.value = ''
        reNewPsd.current.value = ''
    }, [dispatch.public])

    const isSignin = userInfo && userInfo.userId
    const changeHandle = useSettingChange()

    // 点击复制外链
    const copyAccount = useCallback((event) => {
        const range = document.createRange()
        range.selectNode(document.getElementById('outerLink'))
        const selection = window.getSelection()
        if (selection.rangeCount > 0) selection.removeAllRanges()
        selection.addRange(range)
        document.execCommand('copy')
        Toast.info('复制成功')
    }, [])

    const [outerLinkUrl, setOuterLinckUrl] = useState(`${frontendDomain}/people/${encodeURIComponent(userInfo.userName)}`)
    useEffect(() => {
        setOuterLinckUrl(`${frontendDomain}/people/${encodeURIComponent(userInfo.userName)}`)
    }, [userInfo.userName])

    // 导出我的收藏夹
    const exportBookmark = useCallbackAsync(async () => {
        const res = await dispatch.user.exportBookmark()
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }

        download(
            res.data,
            `domilin-bookmarks-${userInfo.userName || 'download'}-${formatTime(new Date().getTime(), 'yyyy-MM-dd')}.html`,
            'text/html'
        )
        Toast.info('导出成功')
    }, [])

    // 注销
    const signOutHandle = useCallbackAsync(async () => {
        for (let key in cookiesName) {
            if (isChromeExtension()) {
                await chromeCookie.remove({
                    url: chromeFrontend,
                    key: cookiesName[key]
                })
            } else {
                Cookies.remove(cookiesName[key])
            }
        }
        if (isChromeExtension()) {
            await chromeCookie.remove({
                url: chromeFrontend,
                key: cookiesName.uuidkey
            })
        } else {
            Cookies.remove(cookiesName.uuidkey)
        }
        window.location.href = `${frontendDomain}/login/signin`
    })

    // 更改搜索引擎
    const changeSearchEngine = useCallbackAsync(async (val) => {
        const res = await dispatch.public.setting({
            engine: val.name.toLowerCase()
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    })

    // 导入导出弹出框
    const [importShow, setImportShow] = useState(false)
    return <div className="setting-content" style={{ ...style }}>
        <div className="setting-normal">
            {!isSignin && <BlockOnPopup className="synchronous-box">
                <div className="synchronous-image">
                    <img src={synchronousImage} alt="domilin"/>
                </div>
                <div className="synchronous-intro">
                    <p>
                    登录即享多端同步， <br/>让您的资料永不丢失
                    </p>
                    <a href={`${frontendDomain}/login/signin`}>即刻登录</a>
                </div>
            </BlockOnPopup>}
            {isSignin && <BlockOnPopup className="user-info-change">
                <div className="information">
                    <div className="avatar">
                        <img
                            style={{ transform: userInfo.avatar ? 'scale(1)' : 'scale(0.75)' }}
                            src={userInfo.avatar ? (staticDomain + userInfo.avatar) : logo} alt="domilin"
                        />
                    </div>
                    <h3>{userInfo.userName}</h3>
                    {!userInfo.email && <p className="no-bind-email-tips">请绑定邮箱，找回密码等功能需邮箱验证</p>}
                    <p>{userInfo.email && `邮箱：${userInfo.email}`}</p>
                    <p>{userInfo.nickName && `昵称：${userInfo.nickName}`}</p>
                </div>
                <div className="basic-change">
                    <FormItemButton title="修改昵称" onClick={() => setModifyType(modifyTypeArr[0])}/>
                    <FormItemButton title="修改头像" onClick={() => setModifyType(modifyTypeArr[1])}/>
                    <FormItemButton title="修改密码" onClick={() => setModifyType(modifyTypeArr[2])}/>
                    <FormItemButton title="绑定邮箱" onClick={() => setModifyType(modifyTypeArr[3])}/>
                    <FormItemButton title="注销" onClick={signOutHandle}/>
                </div>
            </BlockOnPopup>}
        </div>
        <div className="setting-normal-content">
            {/* ------------------------------以下为个人信息修改项------------------------------ */}
            <BlockOnPopup title="修改昵称" style={{ display: modifyType === modifyTypeArr[0] ? 'block' : 'none' }}>
                <FormItem ref={nickName} title="用户昵称" placeholder="请输入昵称"/>
                <div className="setting-func">
                    <Button onClick={changeNickName}>确认</Button>
                    <Button onClick={() => { setModifyType(null) }} type="grey">取消</Button>
                </div>
            </BlockOnPopup>
            <BlockOnPopup title="修改头像" style={{ display: modifyType === modifyTypeArr[1] ? 'block' : 'none' }}>
                <FormItem>
                    <div className="change-avatar">
                        {iconImg.url
                            ? <img
                                src={iconImg.url.indexOf('blob:') > -1 ? iconImg.url : `${staticDomain}${iconImg.url}`}
                                alt="Icon"
                            />
                            : <span className="iconfont">&#xe88a;</span>}
                        <input type="file" accept="image/*" ref={avatarInput} onChange={onSelectFile}/>
                    </div>
                </FormItem>
                <ImageCropper
                    image={cropImg}
                    onComplete={blob => {
                        window.URL.revokeObjectURL(iconImg.url)
                        setIconImg({
                            url: window.URL.createObjectURL(blob),
                            blob
                        })
                    }}
                />
                <div className="setting-func">
                    <Button onClick={changeAvatar}>确认</Button>
                    <Button onClick={() => {
                        setCropImg(null)
                        setIconImg({ url: null, blob: null })
                        setModifyType(null)
                    }} type="grey">取消</Button>
                </div>
            </BlockOnPopup>
            <BlockOnPopup title="修改密码" style={{ display: modifyType === modifyTypeArr[2] ? 'block' : 'none' }}>
                <FormItem ref={oldPsd} childType="password" title="原密码" placeholder="请输入原密码"/>
                <FormItem ref={newPsd} childType="password" title="新密码" placeholder="请输入新密码"/>
                <FormItem ref={reNewPsd} childType="password" title="确认新密码" placeholder="请再次输入新密码"/>
                <div className="setting-func">
                    <Button onClick={changePsd}>确认</Button>
                    <Button onClick={() => {
                        setModifyType(null)
                        oldPsd.current.value = ''
                        newPsd.current.value = ''
                        reNewPsd.current.value = ''
                    }} type="grey">取消</Button>
                </div>
            </BlockOnPopup>
            <BindEmail {...{ setModifyType, show: modifyType === modifyTypeArr[3] }}/>

            {/* ------------------------------以下为设置项------------------------------ */}
            <BlockOnPopup title="搜索引擎">
                <FormItemButton title="默认搜索引擎">
                    <FormSelect
                        defaultValue={
                            userInfo.engine
                                ? { name: userInfo.engine.replace(/^\S/, s => s.toUpperCase()) }
                                : engineOtions[0]
                        }
                        options={engineOtions}
                        onChange={changeSearchEngine}
                    />
                </FormItemButton>
            </BlockOnPopup>
            <BlockOnPopup title="导入导出">
                <FormItemButton title="从收藏夹导入" onClick={() => {
                    if (!isChromeExtension()) {
                        Toast.info('请在插件中使用此功能')
                        return
                    }
                    setImportShow(true)
                }}/>
                <FormItemButton title="导出我的书签" onClick={exportBookmark}/>
            </BlockOnPopup>
            <BlockOnPopup title="主页外链">
                <FormItemButton title="开启外链">
                    <FormSwitch
                        defaultValue={userInfo.outerLink}
                        onChange={(val) => {
                            if (!userInfo.userId) {
                                Toast.info('请首先注册或登录')
                                return
                            }
                            changeHandle({ outerLink: val })
                        }}
                    />
                </FormItemButton>
                <div className="outer-link-wrapper">
                    <p>此功能开启即可无需登录公开访问主页导航与设置</p>
                    <FormItem className="outer-link-show" style={{ display: userInfo.outerLink ? 'flex' : 'none' }}>
                        <input
                            id="outerLink"
                            value={outerLinkUrl}
                            readOnly={true}
                            type="text"
                        />
                        <Button onClick={copyAccount}>复制</Button>
                    </FormItem>
                </div>
            </BlockOnPopup>
        </div>
        {importShow && createPortal(<ImportExport close={() => setImportShow(false)}/>, document.getElementById('root'))}
    </div>
}
