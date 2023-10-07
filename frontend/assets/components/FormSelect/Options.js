import React from 'react'
import { createPortal } from 'react-dom'

export default ({ leaveHandle, enterHandle, optStyle, options, setCurVal, onChange }) => createPortal(<div
    onMouseLeave={leaveHandle}
    onMouseEnter={enterHandle}
    className="form-select-options"
    style={{ ...optStyle }}>
    {Array.isArray(options) && options.map(function (item, index) {
        return <div
            onClick={() => {
                setCurVal(item)
                leaveHandle()
                onChange && onChange(item)
            }}
            className="form-select-option-item"
            key={item.value}>
            {item.name}
        </div>
    })}
</div>, document.getElementById('root'))
