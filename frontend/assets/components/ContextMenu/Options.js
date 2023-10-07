import React from 'react'
import { createPortal } from 'react-dom'

export default ({ show, setShow, pos, options, onChange }) => createPortal(<div
    style={{ display: show ? 'block' : 'none', ...pos }}
    onMouseEnter={() => setShow(true)}
    onMouseLeave={() => setShow(false)}
    className="context-menu-content">
    <ul className="context-menu-buttons">
        {Array.isArray(options) && options.map(function (item, index) {
            return <li key={item.value} onClick={(event) => {
                onChange && onChange(item)
                setShow(false)
            }}>{item.name}</li>
        })}
    </ul>
</div>, document.getElementById('root'))
