import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import './index.scss'

import Popup from '../../Popup'
import Button from '../../Button'
import Toast from '../../Toast'
import { useCallbackAsync, useEffectAsync } from '../../../public/hooks'

export default ({ show, close, addId }) => {
    const dispatch = useDispatch()
    const { levels, userInfo } = useSelector((state) => ({
        levels: state.user.levels,
        userInfo: state.public.userInfo
    }))
    useEffectAsync(async () => {
        if (!userInfo.userId) return
        const res = await dispatch.user.levelSiteGet()
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch.user, userInfo.userId])
    const [curLevelId, setCurlevelId] = useState(null)

    const addSure = useCallbackAsync(async () => {
        if (!curLevelId) {
            Toast.info('请选择分组')
            return
        }

        const res = await dispatch.user.addToMine({ siteId: addId, levelId: curLevelId })
        if (res.code !== 1) {
            if (res.code === 13) {
                Toast.info('我的主页已存在此名称网站')
                return
            }

            if (res.code === 14) {
                Toast.info('我的主页已存在此地址网站')
                return
            }
            Toast.info(res.msg)
            return
        }
        Toast.info('添加成功')
        setCurlevelId(null)
        close()
    }, [addId, close, curLevelId, dispatch.user])
    return <Popup className="add-to-mine-wrapper" close={close} show={show}>
        <h3>请选择分组</h3>
        <div className="option-group">{Array.isArray(levels) && levels.map(function (item, index) {
            return <div
                key={item._id}
                className={`title ${curLevelId === item._id ? 'active' : ''}`}
                onClick={() => setCurlevelId(item._id)}>
                <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                {item.name}
            </div>
        })}</div>
        <div className="sure-btn">
            <Button onClick={addSure}>添加</Button>
            <Button type="grey" onClick={() => close()}>取消</Button>
        </div>
    </Popup>
}
