import React from 'react'

export default ({ errTips }) => {
    const styleObj = { display: errTips ? 'inline-block' : 'none' }
    return <div
        className="error-tips">
        <span className="iconfont" style={styleObj}>&#xe662;</span>
        <em style={styleObj}>{errTips || ''}</em>
    </div>
}
