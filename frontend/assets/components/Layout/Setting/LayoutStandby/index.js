import React, { useState, useCallback, useRef } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'

import Slider from '../../../Slider'
import BlockOnPopup from '../../../BlockOnPopup'
import FormItemButton from '../../../FormItemButton'
import FormSelect from '../../../FormSelect'
import FormSwitch from '../../../FormSwitch'
import FormItem from '../../../FormItem'
import { useCallbackAsync, useEffectAsync, useSettingChange } from '../../../../public/hooks'
import './index.scss'
import { trim } from '../../../../public/js'

const effectOtions = [
    { value: 'slide', name: 'Slide' },
    { value: 'fade', name: 'Fade' }
]
const timeOptions = [
    { value: 30 * 1000, name: '30秒' },
    { value: 60 * 1000, name: '1分钟' },
    { value: 5 * 60 * 1000, name: '5分钟' },
    { value: 10 * 60 * 1000, name: '10分钟' },
    { value: 15 * 60 * 1000, name: '15分钟' },
    { value: 30 * 60 * 1000, name: '半小时' },
    { value: 60 * 60 * 1000, name: '1小时' },
    { value: -1, name: '从不' }
]
export default ({ style }) => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo
    }), shallowEqual)

    const changeHandle = useSettingChange()

    // 获取城市列表，当前定位城市
    const [citys, setCitys] = useState([])
    const [curCity, setCurCity] = useState()
    useEffectAsync(async () => {
        const res = await dispatch.public.getCityInfo()
        if (!res) return
        setCitys(res)
        if (!userInfo || !('standbyWeatherCity' in userInfo)) return
        for (const val of res) {
            if (val.citycode !== userInfo.standbyWeatherCity) continue
            setCurCity(val.city)
        }
    }, [])

    // 显示城市选择框
    const [citySelectShow, setCitySelectShow] = useState(false)

    // 搜索城市
    const [matchCitys, setMatchCitys] = useState([])
    const [searchVal, setSearchVal] = useState()
    const curTagKeyUpTime = useRef()
    const cityChange = useCallback((event) => {
        if (!citys) return
        // 500毫秒后，获取已输入关键词匹配tag---节流：如果这500毫秒内，再次按键则不获取
        curTagKeyUpTime.current = new Date().getTime()
        const delayTime = 300
        const value = trim(event.target.value)

        setTimeout(async () => {
            // 执行此函数时的时间减去延迟时间，应该等于此时键盘弹起时间：由于程序执行或其它因为导致会有几毫秒延迟或提前，故在此取绝对值，允许这几毫秒的动态范围
            const time = Math.abs((new Date().getTime() - delayTime) - curTagKeyUpTime.current)
            if (time > 3) return

            // 设置值
            setSearchVal(value)
            if (value === '') {
                setMatchCitys([])
                return
            }

            const tempArr = []
            for (const item of citys) {
                if (item.city.indexOf(value) === -1) continue
                tempArr.push(item)
            }
            setMatchCitys(tempArr)
        }, delayTime)
    }, [citys])

    // 更改城市
    const changeCity = useCallbackAsync(async (item) => {
        const res = await dispatch.public.getWetherInfo({ citycode: item.citycode })
        if (res.code !== 1) return
        setCurCity(item.city)
        changeHandle({ standbyWeatherCity: item.citycode })
        setMatchCitys([])
        setSearchVal('')
        setCitySelectShow(false)
    })

    // 开启待机页
    const standbyOpen = useCallbackAsync(async (val) => {
        if (val) { // 开启待机页时才请求
            const res = await dispatch.public.getWetherInfo({ citycode: userInfo.standbyWeatherCity })
            if (res.code !== 1) return
        }
        changeHandle({ standbyOpen: val })
    })

    // 开启天气
    const weatherOpen = useCallbackAsync(async (val) => {
        if (val) { // 开启待机页时才请求
            const res = await dispatch.public.getWetherInfo({ citycode: userInfo.standbyWeatherCity })
            if (res.code !== 1) return
        }
        changeHandle({ standbyWeather: val })
    })

    // 当前设置的空闲显示时间
    let curFreeShowName = timeOptions[1].name
    if (userInfo && 'standbyFreeShow' in userInfo) {
        for (const val of timeOptions) {
            if (val.value !== userInfo.standbyFreeShow) continue
            curFreeShowName = val.name
            break
        }
    }
    return <div className="setting-content" style={{ ...style }}>
        <div className="layout-wrapper">
            <BlockOnPopup title="布局">
                <FormItemButton title="固定搜索与分类">
                    <FormSwitch
                        defaultValue={userInfo.layoutScrollSearchLevelFixed}
                        onChange={(val) => changeHandle({ layoutScrollSearchLevelFixed: val })}
                    />
                </FormItemButton>
                <FormItemButton title="显示宽度">
                    {/* padding:0%-25%--->50-100(25==100) */}
                    <Slider
                        min={50}
                        max={100}
                        value={userInfo.layoutContentWidth * 100 / 25}
                        onChange={(value) => {
                            dispatch.public.settingData({ layoutContentWidth: value * 25 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ layoutContentWidth: value * 25 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="行间距">
                    {/* 16px-120px--->10-100(120px==100) */}
                    <Slider
                        min={10}
                        max={100}
                        value={userInfo.layoutRowSpacing * 100 / 120}
                        onChange={(value) => {
                            dispatch.public.settingData({ layoutRowSpacing: value * 120 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ layoutRowSpacing: value * 120 / 100 })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="列间距">
                    {/* 16px-120px--->10-100(120px==100) */}
                    <Slider
                        min={10}
                        max={100}
                        value={userInfo.layoutCloumnSpacing * 100 / 120}
                        onChange={(value) => {
                            dispatch.public.settingData({ layoutCloumnSpacing: value * 120 / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ layoutCloumnSpacing: value * 120 / 100 })
                        }}
                    />
                </FormItemButton>
            </BlockOnPopup>
            <BlockOnPopup title="分页">
                <FormItemButton title="分页按钮">
                    <FormSwitch
                        defaultValue={userInfo.layoutNavBtnShow}
                        onChange={(val) => changeHandle({ layoutNavBtnShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="分页器">
                    <FormSwitch
                        defaultValue={userInfo.layoutNavDotsShow}
                        onChange={(val) => changeHandle({ layoutNavDotsShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="鼠标切换">
                    <FormSwitch
                        defaultValue={userInfo.layoutPageSwitchMouse}
                        onChange={(val) => changeHandle({ layoutPageSwitchMouse: val })}
                    />
                </FormItemButton>
                <FormItemButton title="键盘切换">
                    <FormSwitch
                        defaultValue={userInfo.layoutPageSwitchKeyboard}
                        onChange={(val) => changeHandle({ layoutPageSwitchKeyboard: val })}
                    />
                </FormItemButton>
                <FormItemButton title="切换效果">
                    <FormSelect
                        defaultValue={{ name: userInfo.layoutPageAnimateEffect.replace(/^\S/, s => s.toUpperCase()) }}
                        options={effectOtions}
                        onChange={async (val) => {
                            changeHandle({ layoutPageAnimateEffect: val.value })
                        }}
                    />
                </FormItemButton>
                <FormItemButton title="切换速度">
                    {/* 0s-1s--->0-100(1==100) */}
                    <Slider
                        min={0}
                        max={100}
                        value={userInfo.layoutPageAnimateSpeed * 100}
                        onChange={(value) => {
                            dispatch.public.settingData({ layoutPageAnimateSpeed: value / 100 })
                        }}
                        onAfterChange={(value) => {
                            changeHandle({ layoutPageAnimateSpeed: value / 100 })
                        }}
                    />
                </FormItemButton>
            </BlockOnPopup>
        </div>
        <div className="setting-standby-wrapper">
            <BlockOnPopup title="待机页">
                <FormItemButton title="开启">
                    <FormSwitch
                        defaultValue={userInfo.standbyOpen}
                        onChange={standbyOpen}
                    />
                </FormItemButton>
                <FormItemButton title="背景模糊">
                    <FormSwitch
                        defaultValue={userInfo.standbyBgBlur}
                        onChange={(val) => changeHandle({ standbyBgBlur: val })}
                    />
                </FormItemButton>
                <FormItemButton title="开启时钟">
                    <FormSwitch
                        defaultValue={userInfo.standbyTime}
                        onChange={(val) => changeHandle({ standbyTime: val })}
                    />
                </FormItemButton>
                <FormItemButton title="开启农历">
                    <FormSwitch
                        defaultValue={userInfo.standbyTimeLunar}
                        onChange={(val) => changeHandle({ standbyTimeLunar: val })}
                    />
                </FormItemButton>
                <FormItemButton title="24小时制">
                    <FormSwitch
                        defaultValue={userInfo.standbyTime24}
                        onChange={(val) => changeHandle({ standbyTime24: val })}
                    />
                </FormItemButton>
                <FormItemButton title="开启天气">
                    <FormSwitch
                        defaultValue={userInfo.standbyWeather}
                        onChange={weatherOpen}
                    />
                </FormItemButton>
                <FormItemButton title="新建显示">
                    <FormSwitch
                        defaultValue={userInfo.standbyNewShow}
                        onChange={(val) => changeHandle({ standbyNewShow: val })}
                    />
                </FormItemButton>
                <FormItemButton title="空闲显示">
                    <FormSelect
                        defaultValue={{ name: curFreeShowName }}
                        options={timeOptions}
                        onChange={async (val) => {
                            changeHandle({ standbyFreeShow: val.value })
                        }}
                    />
                </FormItemButton>
                <FormItemButton
                    title="天气定位"
                    onClick={() => setCitySelectShow(!citySelectShow)}>
                    <div className="city-select">
                        <em>{curCity}</em>
                        <span className="iconfont">&#xe6a3;</span>
                    </div>
                </FormItemButton>
            </BlockOnPopup>
            {citySelectShow && <BlockOnPopup>
                <div className="weather-city-select">
                    <FormItem
                        defaultValue={searchVal}
                        onChange={cityChange}
                        childType="text"
                        title="城市选择"
                        placeholder="请输入城市关键字"
                    />
                    {Array.isArray(matchCitys) && matchCitys.length > 0 && <div className="city-dropdown">
                        <div className="city-dropdown-content">
                            {matchCitys.map(function (item, index) {
                                return <div
                                    className="dropdwon-item"
                                    onClick={() => changeCity(item)}
                                    key={item.cityid}>
                                    {item.city}
                                </div>
                            })}
                        </div>
                    </div>}
                </div>
            </BlockOnPopup>}
        </div>
    </div>
}
