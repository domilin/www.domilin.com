import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './index.scss'
import ContactUs from './ContactUs'
import Protocol from './Protocol'
import Privacy from './Privacy'
import { guideArticleId } from '../../../config/config'

const menuArr = ['联系我们', '用户协议', '隐私协议']
export default () => {
    const { pageIndex } = useParams()
    const [curMenuIndex, setCurMenuIndex] = useState(0)
    const curComp = useCallback((index) => ({ display: curMenuIndex === index ? 'flex' : 'none' }), [curMenuIndex])

    // 用户插件审核等特别访问，可通过路由直接访问隐私政策、用户协议等模块
    useEffect(() => {
        if (!pageIndex) return
        setCurMenuIndex(parseInt(pageIndex))
    }, [pageIndex])

    return <div className="block-wrapper more-wrapper">
        <div className="block-list more-menu">
            {menuArr.map(function (item, index) {
                return <a
                    key={index}
                    onClick={() => setCurMenuIndex(index)}
                    className={curMenuIndex === index ? 'active' : ''}>
                    {item}
                </a>
            })}
            <a target="_blank" href={`/article/${guideArticleId}`}>使用向导</a>
            <a target="_blank" href="https://jinshuju.net/f/JrIHS2">留言建议</a>
        </div>
        <div className="block-content">
            <ContactUs style={curComp(0)}/>
            <Protocol style={curComp(1)}/>
            <Privacy style={curComp(2)}/>
        </div>
    </div>
}
