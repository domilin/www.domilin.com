import React from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'

import Slider from '../../../Slider'
import BlockOnPopup from '../../../BlockOnPopup'
import BlockSelect from '../../../BlockSelect'
import FormItemButton from '../../../FormItemButton'
import FormSwitch from '../../../FormSwitch'
import FormSelect from '../../../FormSelect'
import menuLeftBlack from './images/icon-menu-left-black.svg'
import menuLeftWhite from './images/icon-menu-left-white.svg'
import menuRightBlack from './images/icon-menu-right-black.svg'
import menuRightWhite from './images/icon-menu-right-white.svg'
import { sidebars } from '../../../../models/public'
import { useSettingChange } from '../../../../public/hooks'
import { openWayOtions } from '../../../../public/js'
import './index.scss'

export default ({ style }) => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }), shallowEqual)

    const changeHandle = useSettingChange()

    // ---------------个性化设置，图标显示--------------------
    let iconLeft = menuLeftBlack
    let iconRight = menuRightBlack
    if ('theme' in userInfo) {
        if (userInfo.theme === 'light') {
            iconLeft = menuLeftWhite
            iconRight = menuRightWhite
        }
    }

    const sideBarOptions = [
        { value: iconLeft, name: '左侧', option: sidebars.left },
        { value: iconRight, name: '右侧', option: sidebars.right }
    ]

    // 图标打开方式，名称
    let curOpenWayName = openWayOtions[0].name
    for (const val of openWayOtions) {
        if (val.value === userInfo.searchOpenWay) {
            curOpenWayName = val.name
            break
        }
    }
    return <div className="setting-content" style={{ ...style }}>
        <div className="slide-wrapper">
            <BlockOnPopup title="侧边栏">
                <BlockSelect
                    defaultValue={{ option: userInfo.sidebar }}
                    onChange={(item) => changeHandle({ sidebar: item.option })}
                    options={sideBarOptions}
                />
                <FormItemButton title="自动隐藏">
                    <FormSwitch
                        defaultValue={userInfo.sidebarAuto}
                        onChange={async (val) => {
                            const res = await changeHandle({ sidebarAuto: val })
                            // 返回值changeHandle为请求返回结果，此处仅仅作为实例，可以得到返回值，无任何意义
                            console.log(res)
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="窄距菜单">
                    <FormSwitch
                        defaultValue={userInfo.sidebarNarrow}
                        onChange={(val) => changeHandle({ sidebarNarrow: val })}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
        <div className="search-wrapper">
            <BlockOnPopup title="搜索">
                <FormItemButton title="显示">
                    <FormSwitch
                        defaultValue={userInfo.searchShow}
                        onChange={(val) => changeHandle({ searchShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="阴影">
                    <FormSwitch
                        defaultValue={userInfo.searchShadow}
                        onChange={(val) => changeHandle({ searchShadow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="大小">
                    {/* 30px-90px--->50-150(60px==100) */}
                    <Slider
                        min={50}
                        max={150}
                        value={userInfo.searchSize * 100 / 60}
                        onChange={(value) => {
                            dispatch.public.settingData({ searchSize: value * 60 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ searchSize: value * 60 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="圆角">
                    {/* 0%-50%--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.searchRadius * 100 / 50}
                        onChange={(value) => {
                            dispatch.public.settingData({ searchRadius: value * 50 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ searchRadius: value * 50 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="宽度">
                    {/* 20%-100%--->40-100(100==100) */}
                    <Slider
                        min={20}
                        max={100}
                        value={userInfo.searchWidth}
                        onChange={(value) => {
                            dispatch.public.settingData({ searchWidth: value })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ searchWidth: value })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="不透明度">
                    {/* 0-1--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.searchOpacity * 100 / 1}
                        onChange={(value) => {
                            dispatch.public.settingData({ searchOpacity: value * 1 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ searchOpacity: value * 1 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="打开方式">
                    <FormSelect
                        defaultValue={{ name: curOpenWayName }}
                        options={openWayOtions}
                        onChange={async (val) => {
                            changeHandle({ searchOpenWay: val.value })
                        }}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
    </div>
}
