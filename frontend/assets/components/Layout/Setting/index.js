import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import './index.scss'

import Normal from './Normal'
import ThemeWallpaper from './ThemeWallpaper'
import LayoutStandby from './LayoutStandby'
import MenuSearch from './MenuSearch'
import IconLevel from './IconLevel'
import Popup from '../../Popup'
import UseMemo from '../../UseMemo'

const menuArr = ['常规', '主题&壁纸', '图标&分类', '搜索&侧边栏', '布局&待机页']
export default ({ show, close }) => {
    const { preview } = useSelector((state) => ({
        preview: state.public.userInfo.preview
    }))
    const [curMenuIndex, setCurMenuIndex] = useState(0)

    return <UseMemo deps={[show, close, curMenuIndex]}>
        {() => <Popup
            wrapperClassName="setting-popup"
            className="setting-popup-box"
            close={close}
            show={show}>
            <div className="setting-wrapper">
                <div className="block-list setting-menu" style={{ opacity: preview ? 0 : 1 }}>
                    {menuArr.map(function (item, index) {
                        return <a
                            key={index}
                            onClick={() => setCurMenuIndex(index)}
                            className={curMenuIndex === index ? 'active' : ''}>
                            {item}
                        </a>
                    })}
                </div>
                <div
                    className="block-content"
                    style={{ overflow: preview ? 'hidden' : '', paddingRight: preview ? '19px' : '' }}>
                    {curMenuIndex === 0 && <Normal/>}
                    {curMenuIndex === 1 && <ThemeWallpaper/>}
                    {curMenuIndex === 2 && <IconLevel/>}
                    {curMenuIndex === 3 && <MenuSearch/>}
                    {curMenuIndex === 4 && <LayoutStandby/>}
                </div>
            </div>
        </Popup>}
    </UseMemo>
}
