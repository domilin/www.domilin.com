import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Cookies from 'js-cookie'

import './index.scss'

import ColorPicker from '../../../ColorPicker'
import BlockOnPopup from '../../../BlockOnPopup'
import FormItemButton from '../../../FormItemButton'
import BlockSelect from '../../../BlockSelect'
import FormSwitch from '../../../FormSwitch'
// import FormSelect from '../../../FormSelect'
import iconThemeBlack from './images/icon-theme-black.svg'
import iconThemeWhite from './images/icon-theme-white.svg'
import FormItem from '../../../FormItem'
import Toast from '../../../Toast'
import { chromeCookie, cookiesName, isChromeExtension } from '../../../../public/js'
import { staticDomain, chromeFrontend } from '../../../../../config/config'
import { themes, wallTypes, wallDefColor } from '../../../../models/public'
import { useSettingChange, useCallbackAsync } from '../../../../public/hooks'

export default ({ style }) => {
    const dispatch = useDispatch()
    const changeHandle = useSettingChange()

    const { userInfo, officialWallpaper } = useSelector((state) => ({
        officialWallpaper: state.public.wallpaper,
        userInfo: state.public.userInfo
    }), shallowEqual)
    const [wallpaperType, setWallpaperType] = useState(wallTypes.official)

    // 壁纸上传
    const wallpaperInput = useRef()
    const wallpaperChange = useCallbackAsync(async (event) => {
        let file = event && event.target && event.target.files[0] // 获取文件
        if (!file) return

        if ((file.size / 1024).toFixed(0) > 2048) {
            Toast.info('图片请小于2M')
            return
        }
        const res = await dispatch.public.uploadWallpaperImage({
            wallpaper: file
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }

        wallpaperInput.current.value = ''
        const resSet = await dispatch.public.setting({
            wallpaper: res.data.url
        })
        if (resSet.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch])

    // ---------------个性化设置，图标显示--------------------
    let iconWallpaper = iconThemeBlack
    if ('theme' in userInfo) {
        if (userInfo.theme === themes.light) {
            iconWallpaper = iconThemeWhite
        }
    }
    if (officialWallpaper) iconWallpaper = staticDomain + officialWallpaper

    const wallType = useRef(null)
    useEffect(() => {
        if (wallType.current === userInfo.wallpaperType) return
        wallType.current = userInfo.wallpaperType
        setWallpaperType(userInfo.wallpaperType)
    }, [userInfo.wallpaperType])

    const themeOptions = [
        { value: iconThemeWhite, name: '浅色', option: themes.light },
        { value: iconThemeBlack, name: '深色', option: themes.night }
    ]
    const wallpaperOptions = [
        {
            value: iconWallpaper,
            name: '官方壁纸',
            option: wallTypes.official
        },
        {
            value: userInfo.wallpaperType === wallTypes.color
                ? userInfo.wallpaper
                : wallDefColor,
            name: '纯色',
            type: 'color',
            option: wallTypes.color
        },
        {
            value: <div
                style={{
                    backgroundImage: userInfo.wallpaperType === wallTypes.custom
                        ? `url(${staticDomain + userInfo.wallpaper})`
                        : 'none'
                }}
                className="wallpaper-custom-item"
            />,
            name: '自定义',
            type: 'component',
            option: wallTypes.custom
        }
    ]

    // 更改主题
    const changeTheme = useCallbackAsync(async (item) => {
        await changeHandle({ theme: item.option })
        if (isChromeExtension()) {
            await chromeCookie.set({
                url: chromeFrontend,
                key: cookiesName.theme,
                value: item.option
            })
        } else {
            Cookies.set(cookiesName.theme, item.option)
        }
        document.body.setAttribute('data-theme', item.option)
    })
    // 更改主题更换模式
    const changeThemeFollowSys = useCallbackAsync(async (val) => {
        changeHandle({ themeFollowSys: val })

        if (!window || !window.matchMedia || !val) return
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        changeHandle({ theme: isDark ? 'night' : 'light' })
        document.body.setAttribute('data-theme', isDark ? 'night' : 'light')
    })
    return <div className="setting-content" style={{ ...style }}>
        <div className="theme-wrapper">
            <BlockOnPopup title="主题">
                <BlockSelect
                    defaultValue={{ option: userInfo.theme }}
                    onChange={changeTheme}
                    options={themeOptions}
                />
                <FormItemButton title="跟随系统">
                    <FormSwitch
                        defaultValue={userInfo.themeFollowSys}
                        onChange={changeThemeFollowSys}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
        <div className="wallpaper-wrapper">
            <BlockOnPopup title="壁纸">
                <BlockSelect
                    defaultValue={{ option: userInfo.wallpaperType }}
                    onChange={(item) => {
                        if ('wallpaperType' in userInfo && userInfo.wallpaperType === item.option) return
                        setWallpaperType(item.option)
                        changeHandle({ wallpaperType: item.option, wallpaper: wallDefColor })
                    }}
                    options={wallpaperOptions}
                />
                <div
                    className={`wallpaper-${wallTypes.official}`}
                    style={{ display: wallpaperType === wallTypes.official ? 'block' : 'none' }}>
                    {/* <FormItemButton title="类别">
                        <FormSelect
                            options={[
                                { value: 1, name: '自然' },
                                { value: 2, name: '动物' },
                                { value: 3, name: '人物' }
                            ]}
                            onChange={(val) => console.log(val)}
                        />
                    </FormItemButton>
                    <FormItemButton title="下一个"/>
                    <FormItemButton title="更换频率">
                        <FormSelect
                            options={[
                                { value: 1, name: '1小时' },
                                { value: 2, name: '12小时' },
                                { value: 3, name: '1天' },
                                { value: 4, name: '从不' }
                            ]}
                            onChange={(val) => console.log(val)}
                        />
                    </FormItemButton> */}
                    <FormItemButton title="模糊">
                        <FormSwitch
                            defaultValue={userInfo.wallpaperBlur}
                            onChange={(val) => changeHandle({ wallpaperBlur: val })}
                        />
                    </FormItemButton>
                    <FormItemButton className="download-wallpaper" title="下载">
                        <a href={staticDomain + officialWallpaper} target="_blank"/>
                        <span className="iconfont">&#xe6a3;</span>
                    </FormItemButton>
                </div>
                <div
                    className={`wallpaper-${wallTypes.custom}`}
                    style={{ display: wallpaperType === wallTypes.custom ? 'block' : 'none' }}>
                    <FormItemButton className="upload-wallpaper" title="更换">
                        <input
                            ref={wallpaperInput}
                            onChange={wallpaperChange}
                            type="file"
                            accept="image/*"
                        />
                        <span className="iconfont">&#xe6a3;</span>
                    </FormItemButton>
                    <FormItemButton title="模糊">
                        <FormSwitch
                            defaultValue={userInfo.wallpaperBlur}
                            onChange={(val) => changeHandle({ wallpaperBlur: val })}
                        />
                    </FormItemButton>
                    {'wallpaper' in userInfo &&
                    userInfo.wallpaper.indexOf('/upload/wallpapers') > -1 &&
                    <FormItemButton className="download-wallpaper" title="下载">
                        <a href={staticDomain + userInfo.wallpaper} target="_blank"/>
                        <span className="iconfont">&#xe6a3;</span>
                    </FormItemButton>}
                </div>
                <div
                    className={`wallpaper-${wallTypes.color}`}
                    style={{ display: wallpaperType === wallTypes.color ? 'block' : 'none' }}>
                    <FormItem title="请选择颜色">
                        <ColorPicker
                            defaultValue={userInfo.wallpaper}
                            onChange={(val) => changeHandle({ wallpaper: val })}
                        />
                    </FormItem>
                </div>
            </BlockOnPopup>
        </div>
    </div>
}
