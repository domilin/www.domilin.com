import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import './index.scss'

import BlockOnPopup from '../../../../BlockOnPopup'
import Button from '../../../../Button'
import BookmarkTree from './BookmakTree'
import Toast from '../../../../Toast'
import { useCallbackAsync } from '../../../../../public/hooks'

const checkedBiggest = 50
export default ({ close }) => {
    const dispatch = useDispatch()
    const { levels } = useSelector((state) => ({
        levels: state.user.levels
    }))
    const [curLevelId, setCurlevelId] = useState(levels && levels.length > 0 && levels[0]._id)
    const [curChecked, setCurChecked] = useState([])

    const checkedNum = Array.isArray(curChecked) ? curChecked.length : 0

    const importHandle = useCallbackAsync(async () => {
        if (checkedNum === 0) {
            Toast.info(`请选择要导入的书签`)
            return
        }

        if (checkedNum > checkedBiggest) {
            Toast.info(`每次导入书签请少于${checkedBiggest}`)
            return
        }

        if (!curLevelId) {
            Toast.info(`请选择书签分类`)
            return
        }

        const uploadData = []
        for (const val of curChecked) {
            uploadData.push({
                title: val.title,
                url: val.url
            })
        }
        const res = await dispatch.user.importBookmark({ checked: uploadData, levelId: curLevelId })
        if (res.code !== 1) {
            Toast.error(res.msg)
            return
        }
        Toast.info('导入成功')
        await dispatch.user.levelSiteGet()
        dispatch.user.setCurlevel(levels && levels.length > 0 && levels[0]._id)
        if (window.domilinSwiper) window.domilinSwiper.slideTo(0, 0, false)
        close()
    }, [curChecked, curLevelId])
    return <div className="import-export">
        <div className="import-export-mask" onClick={close}/>
        <BlockOnPopup className="import-export-content">
            <div className="form-bookmark">
                <h5 className="content-title">
                    想要导入的书签(<span className={`checked-bookmark ${checkedNum > checkedBiggest ? 'error' : ''}`}>{checkedNum}/{checkedBiggest}</span>)
                </h5>
                <div className="tree-wrapper">
                    <BookmarkTree
                        onCheckedKeys={(keys) => setCurChecked(keys)}
                    />
                </div>
            </div>
            <div className="to-my-website">
                <h5 className="content-title">我的书签分类</h5>
                <div className="my-website-levels">
                    {Array.isArray(levels) && levels.length > 0
                        ? levels.map(function (item, index) {
                            return <div
                                key={item._id}
                                className={`level-item ${curLevelId === item._id ? 'active' : ''}`}
                                onClick={() => setCurlevelId(item._id)}>
                                <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                                {item.name}
                            </div>
                        })
                        : <div className="add-level-tips">请添加分类</div>}
                </div>
            </div>
        </BlockOnPopup>
        <div className="import-export-button">
            <Button type="grey" onClick={close}>取消</Button>
            <Button onClick={importHandle}>确定</Button>
        </div>
    </div>
}
