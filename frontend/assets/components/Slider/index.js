import React, { useState, useEffect } from 'react'
import Slider from 'rc-slider'
import { useDispatch } from 'react-redux'
import './index.scss'
import UseMemo from '../UseMemo'

export default (props) => {
    const dispatch = useDispatch()
    const { value, onChange, onAfterChange } = props
    const [curValue, setCurValue] = useState(value)
    useEffect(() => {
        setCurValue(value)
    }, [value])

    const overwriteProps = {
        value: curValue,
        onChange: (value) => {
            dispatch.public.settingData({ preview: true })
            if (onChange) onChange(value)
        },
        onAfterChange: (value) => {
            if (onAfterChange) onAfterChange(value)
            dispatch.public.settingData({ preview: false })
        }
    }
    const lastProps = { ...props, ...overwriteProps }
    return <UseMemo deps={[curValue, onChange]}>
        {() => <div className="slider-wrapper">
            <div className="slider-current-value">{curValue ? parseInt(curValue) : 0}%</div>
            <Slider {...lastProps} />
        </div>}
    </UseMemo>
}
