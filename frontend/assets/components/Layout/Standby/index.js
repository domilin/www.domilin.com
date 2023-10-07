import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'

import './index.scss'
import Background from '../Background'
import { useEffectAsync } from '../../../public/hooks'
import { getStandbyTime } from '../../../public/js'

const wetherIcon = [
    {
        name: '小雨',
        icon: '&#xe604;'
    }, {
        name: '闪电',
        icon: '&#xe60a;'
    }, {
        name: '洪水',
        icon: '&#xe60d;'
    }, {
        name: '冰雹',
        icon: '&#xe629'
    }, {
        name: '暴雨',
        icon: '&#xe631;'
    }, {
        name: '阵雨',
        icon: '&#xe63e;'
    }, {
        name: '雨',
        icon: '&#xe63e;'
    }, {
        name: '雪',
        icon: '&#xe653;'
    }, {
        name: '霾',
        icon: '&#xe62f;'
    }, {
        name: '多云', // light
        icon: '&#xe681;'
    }, {
        name: '晴', // light
        icon: '&#xe660;'
    }, {
        name: '雾', // light
        icon: '&#xe61b;'
    }, {
        name: '阴', // light
        icon: '&#xe606;'
    }
]

const wetherIconNight = [
    {
        name: '小雨',
        icon: '&#xe604;'
    }, {
        name: '闪电',
        icon: '&#xe60a;'
    }, {
        name: '洪水',
        icon: '&#xe60d;'
    }, {
        name: '冰雹',
        icon: '&#xe629'
    }, {
        name: '暴雨',
        icon: '&#xe631;'
    }, {
        name: '阵雨',
        icon: '&#xe63e;'
    }, {
        name: '雨',
        icon: '&#xe63e;'
    }, {
        name: '雪',
        icon: '&#xe653;'
    }, {
        name: '霾',
        icon: '&#xe62f;'
    }, {
        name: '多云', // night
        icon: '&#xe637;'
    }, {
        name: '晴', // night
        icon: '&#xe633;'
    }, {
        name: '雾', // night
        icon: '&#xe63a;'
    }, {
        name: '阴', // night
        icon: '&#xe636;'
    }
]

// 滑动相关函数---------------------------------------------------------------
// 获得角度
const getAngle = (angx, angy) => {
    return Math.atan2(angy, angx) * 180 / Math.PI
}
// 根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
const getDirection = (startx, starty, endx, endy) => {
    var angx = endx - startx
    var angy = endy - starty
    var result = 0

    // 如果滑动距离太短
    if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
        return result
    }

    var angle = getAngle(angx, angy)
    if (angle >= -135 && angle <= -45) {
        result = 1
    } else if (angle > 45 && angle < 135) {
        result = 2
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3
    } else if (angle >= -45 && angle <= 45) {
        result = 4
    }

    return result
}
export default () => {
    const dispatch = useDispatch()
    const { userInfo, standbyTime, wetherInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        standbyTime: state.public.standbyTime,
        wetherInfo: state.public.wetherInfo
    }))

    const [show, setShow] = useState((userInfo && 'standbyNewShow' in userInfo) ? userInfo.standbyNewShow : true)
    const showRef = useRef(show)
    useEffect(() => {
        showRef.current = show
    }, [show])
    useEffect(() => {
        // 鼠标滚轮监听，火狐鼠标滚动事件不同其他
        const handleMouseWheel = event => {
            if (!showRef.current) return

            let delta = event.detail
            if (event.wheelDelta) delta = event.wheelDelta

            if (delta < 0) {
                setShow(false)
            } else {
                // console.log('up')
            }
        }
        if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
            document.addEventListener('mousewheel', handleMouseWheel)
        } else {
            document.addEventListener('DOMMouseScroll', handleMouseWheel)
        }

        // 手机触屏屏幕
        let startx
        let starty
        const handleTouchstart = event => {
            startx = event.touches[0].pageX
            starty = event.touches[0].pageY
        }
        document.addEventListener('touchstart', handleTouchstart)
        const handleTouchEnd = event => {
            if (!showRef.current) return
            var endx, endy
            endx = event.changedTouches[0].pageX
            endy = event.changedTouches[0].pageY
            var direction = getDirection(startx, starty, endx, endy)
            switch (direction) {
                case 0:
                    // console.log('未滑动！')
                    break
                case 1:
                    setShow(false)
                    break
                case 2:
                    // console.log('向下！')
                    break
                case 3:
                    // console.log('向左！')
                    break
                case 4:
                    // console.log('向右！')
                    break
                default:
            }
        }
        document.addEventListener('touchend', handleTouchEnd)
        const handleTouchmove = event => {
            // console.log('touchmove')
        }
        document.addEventListener('touchmove', handleTouchmove)

        // 窗口尺寸变化时重置位置
        const handleWindowResize = event => {
            // console.log('resize')
        }
        window.addEventListener('resize', handleWindowResize)

        return () => {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
                document.removeEventListener('mousewheel', handleMouseWheel, false)
            } else {
                document.removeEventListener('DOMMouseScroll', handleMouseWheel, false)
            }

            document.addEventListener('touchend', handleTouchstart)
            document.removeEventListener('touchend', handleTouchEnd)
            document.removeEventListener('touchmove', handleTouchmove)
            window.removeEventListener('resize', handleWindowResize)
        }
    }, [])

    // 空闲时间显示待机页
    const lastTime = useRef(new Date().getTime())
    const timeout = useRef((userInfo && userInfo.standbyFreeShow) || 60 * 1000)
    useEffect(() => {
        timeout.current = userInfo.standbyFreeShow
    }, [userInfo.standbyFreeShow])
    useEffect(() => {
        const updateLastTime = function () {
            lastTime.current = new Date().getTime()
        }
        document.addEventListener('mouseover', updateLastTime, false)
        document.addEventListener('touchstart', updateLastTime, false)

        const timer = setInterval(function () {
            if (showRef.current || timeout.current === -1) return
            if (new Date().getTime() - lastTime.current <= timeout.current) return
            setShow(true)
        }, 1000)

        return () => {
            document.removeEventListener('mouseover', updateLastTime, false)
            document.removeEventListener('touchstart', updateLastTime, false)
            clearInterval(timer)
        }
    }, [])

    // 时钟
    useEffectAsync(async () => {
        const timer = setInterval(() => {
            const timeArr = userInfo && 'standbyTime24' in userInfo
                ? getStandbyTime(userInfo.standbyTime24 ? 'HH' : 'hh')
                : getStandbyTime('HH')
            dispatch.public.setStandbyTime(timeArr)
        }, 1000)
        return () => {
            clearInterval(timer)
        }
    }, [])

    // -----------天气图标----------------
    const curHour = dayjs().hour()
    const isLight = curHour >= 6 && curHour <= 18
    const weatherArr = isLight ? wetherIcon : wetherIconNight
    let icon = isLight ? '&#xe606;' : '&#xe636;'
    if (wetherInfo && wetherInfo.weather) {
        for (const val of weatherArr) {
            if (wetherInfo.weather.indexOf(val.name) > -1) {
                icon = val.icon
                break
            }
        }
    }

    /* -------------------------个性化设置------------------------ */
    let timeStyle = {}
    let lunarStayle = {}
    let weatherStyle = {}
    if (userInfo) {
        if ('standbyTime' in userInfo) timeStyle = { display: userInfo.standbyTime ? 'block' : 'none' }
        if ('standbyTimeLunar' in userInfo) lunarStayle = { display: userInfo.standbyTimeLunar ? 'block' : 'none' }
        if ('standbyWeather' in userInfo) weatherStyle = { display: userInfo.standbyWeather ? 'flex' : 'none' }
    }

    return <div className={`standby-wrapper ${!show ? 'scroll-hide' : ''}`}>
        <Background comp="standby"/>
        <div
            className="standby-content-wrapper"
            onClick={() => {
                setShow(false)
            }}>
            <div className="standby-content">
                <div className="standby-time" style={{ ...timeStyle }}><span>{standbyTime.time}</span></div>
                <div className="standby-date" style={{ ...timeStyle }}>
                    <span className="solar">{standbyTime.solar}</span>
                    <span className="lunar" style={{ ...lunarStayle }}>{standbyTime.lunar}</span>
                </div>
                <div className="stanby-weather-wrapper" style={{ ...weatherStyle }}>
                    <div className="standby-weather">
                        <span className="iconfont" dangerouslySetInnerHTML={{ __html: icon }}></span>
                        <em>{wetherInfo.weather}</em>
                    </div>
                    <div className="standy-temperature">
                        <span>{wetherInfo.temp}°</span>
                        <em>{wetherInfo.templow}~{wetherInfo.temphigh}°C</em>
                    </div>
                </div>
            </div>
            <div className="standby-scroll-button">
                <div className="scroll-button">
                    <span className="iconfont">&#xe726;</span>
                    <em>滚动或单击</em>
                </div>
            </div>
        </div>
    </div>
}
