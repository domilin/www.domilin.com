import React from 'react'
import { useDispatch } from 'react-redux'
import WebsiteItem from '../../../components/WebsiteItem'
import Toast from '../../../components/Toast'
import ContextMenu from '../../../components/ContextMenu'

import dragable from '../useDragable'
import { useCallbackAsync } from '../../../public/hooks'

export default ({ itemIn, setCurEditSite, setAddSiteShow }) => {
    const dispatch = useDispatch()
    const dragParams = dragable({ itemId: itemIn._id })

    const recommendWebsite = useCallbackAsync(async (option) => {
        if (option.value === 0) {
            const res = await dispatch.user.recommendToOffcial({ siteId: itemIn._id })
            if (res.code !== 1) {
                if (res.code === 13 || res.code === 14) {
                    Toast.info('官方已存在此应用或已推荐')
                    return
                }

                Toast.info(res.msg)
                return
            }
            Toast.info('推荐成功，请等待审核')
        }

        if (option.value === 1) {
            setCurEditSite(itemIn)
            setAddSiteShow(true)
        }

        if (option.value === 2) {
            const res = await dispatch.user.siteDelXhr({ _id: itemIn._id })
            if (res.code !== 1) {
                Toast.info(res.msg)
            }
        }
    })
    return <ContextMenu
        onChange={recommendWebsite}
        options={[
            { value: 0, name: '推荐至官方' },
            { value: 1, name: '编辑' },
            { value: 2, name: '删除' }
        ]}>
        <WebsiteItem {...itemIn} {...dragParams} page="mine"/>
    </ContextMenu>
}
