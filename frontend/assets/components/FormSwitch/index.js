import React, { useState, useEffect } from 'react'
import './index.scss'
import UseMemo from '../UseMemo'

export default ({ onChange, defaultValue }) => {
    const [state, setState] = useState(defaultValue || false)

    useEffect(() => {
        setState(defaultValue || false)
    }, [defaultValue])
    return <UseMemo deps={[state, onChange]}>
        {() => <div
            onClick={() => {
                setState(!state)
                onChange && onChange(!state)
            }}
            className={`form-switch-wrapper ${state ? 'active' : ''}`}>
            <div className="form-switch-button"/>
        </div>}
    </UseMemo>
}
