import React from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'

import Slider from '../../../Slider'
import BlockOnPopup from '../../../BlockOnPopup'
import BlockSelect from '../../../BlockSelect'
import FormItemButton from '../../../FormItemButton'
import FormSelect from '../../../FormSelect'
import FormSwitch from '../../../FormSwitch'
import iconFaceTwoBlack from './images/icon-face-two-black.svg'
import iconFaceTwoWhite from './images/icon-face-two-white.svg'
import iconFaceThreeBlack from './images/icon-face-three-black.svg'
import iconFaceThreeWhite from './images/icon-face-three-white.svg'
import iconFaceFourBlack from './images/icon-face-four-black.svg'
import iconFaceFourWhite from './images/icon-face-four-white.svg'
import { iconTypes } from '../../../../models/public'
import { openWayOtions } from '../../../../public/js'
import useSettingChange from '../../../../public/hooks/useSettingChange'

import './index.scss'

const iconBaseSize = 120
const levelBaseSize = 40
export default ({ style }) => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }), shallowEqual)

    const changeHandle = useSettingChange()

    // ---------------个性化设置，图标显示--------------------
    let iconEfficient = iconFaceTwoBlack
    let iconLight = iconFaceFourBlack
    let iconClassic = iconFaceThreeBlack
    if ('theme' in userInfo) {
        if (userInfo.theme === 'light') {
            iconEfficient = iconFaceTwoWhite
            iconLight = iconFaceFourWhite
            iconClassic = iconFaceThreeWhite
        }
    }
    const iconTypeOptions = [
        { value: iconEfficient, name: '高效', option: iconTypes.efficient },
        { value: iconLight, name: '轻巧', option: iconTypes.light },
        { value: iconClassic, name: '经典', option: iconTypes.classic }
    ]

    // 图标打开方式，名称
    let curOpenWayName = openWayOtions[0].name
    for (const val of openWayOtions) {
        if (val.value === userInfo.iconOpenWay) {
            curOpenWayName = val.name
            break
        }
    }
    return <div className="setting-content" style={{ ...style }}>
        <div className="icon-wrapper">
            <BlockOnPopup title="图标">
                <BlockSelect
                    defaultValue={{ option: userInfo.iconType }}
                    onChange={(item) => changeHandle({ iconType: item.option })}
                    options={iconTypeOptions}
                />
                <FormItemButton title="打开方式">
                    <FormSelect
                        defaultValue={{ name: curOpenWayName }}
                        options={openWayOtions}
                        onChange={async (val) => {
                            changeHandle({ iconOpenWay: val.value })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="添加按钮">
                    <FormSwitch
                        defaultValue={userInfo.iconAddShow}
                        onChange={(val) => changeHandle({ iconAddShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="阴影">
                    <FormSwitch
                        defaultValue={userInfo.iconShadow}
                        onChange={(val) => changeHandle({ iconShadow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="大小">
                    {/* 60px-180px--->50-150(120px==100) */}
                    <Slider
                        min={50}
                        max={150}
                        value={userInfo.iconSize * 100 / iconBaseSize}
                        onChange={(value) => {
                            dispatch.public.settingData({ iconSize: value * iconBaseSize / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ iconSize: value * iconBaseSize / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="圆角">
                    {/* 0%-50%--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.iconRadius * 100 / 50}
                        onChange={(value) => {
                            dispatch.public.settingData({ iconRadius: value * 50 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ iconRadius: value * 50 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="不透明度">
                    {/* 0-1--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.iconOpacity * 100 / 1}
                        onChange={(value) => {
                            dispatch.public.settingData({ iconOpacity: value * 1 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ iconOpacity: value * 1 / 100 })
                        }}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
        <div className="level-wrapper">
            <BlockOnPopup title="分类">
                <FormItemButton title="显示">
                    <FormSwitch
                        defaultValue={userInfo.levelShow}
                        onChange={(val) => changeHandle({ levelShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="添加按钮">
                    <FormSwitch
                        defaultValue={userInfo.levelAddShow}
                        onChange={(val) => changeHandle({ levelAddShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="显示图标">
                    <FormSwitch
                        defaultValue={userInfo.levelIconShow}
                        onChange={(val) => changeHandle({ levelIconShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="显示文字">
                    <FormSwitch
                        defaultValue={userInfo.levelTextShow}
                        onChange={(val) => changeHandle({ levelTextShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="阴影">
                    <FormSwitch
                        defaultValue={userInfo.levelShadow}
                        onChange={(val) => changeHandle({ levelShadow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="大小">
                    {/* 20px-60px--->50-150(40px==100) */}
                    <Slider
                        min={50}
                        max={150}
                        value={userInfo.levelSize * 100 / levelBaseSize}
                        onChange={(value) => {
                            dispatch.public.settingData({ levelSize: value * levelBaseSize / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ levelSize: value * levelBaseSize / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="圆角">
                    {/* 0%-50%--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.levelRadius * 100 / 50}
                        onChange={(value) => {
                            dispatch.public.settingData({ levelRadius: value * 50 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ levelRadius: value * 50 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="不透明度">
                    {/* 0-1--->0-100 */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.levelOpacity * 100 / 1}
                        onChange={(value) => {
                            dispatch.public.settingData({ levelOpacity: value * 1 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ levelOpacity: value * 1 / 100 })
                        }}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
    </div>
}
