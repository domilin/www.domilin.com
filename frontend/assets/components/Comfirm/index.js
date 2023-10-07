import React from 'react'
import Button from '../Button'

import './index.scss'

export default ({ title, content, onCancel, onOk, visible, className, children }) => {
    return <div className="domilin-comfirm" style={{ display: visible ? 'flex' : 'none' }}>
        <div className={`domilin-comfirm-wrapper ${className || ''}`}>
            <div className="domilin-comfirm-header">
                <div className="comfirm-title">{title || ''}</div>
                <div className="iconfont comfirm-close" onClick={onCancel}>&#xe86e;</div>
            </div>
            <div className="domilin-comfirm-content">{children || content}</div>
            <div className="domilin-comfirm-footer">
                <Button onClick={onCancel} type="grey">取消</Button>
                <Button onClick={onOk} type="default">确认</Button>
            </div>
        </div>
    </div>
}
