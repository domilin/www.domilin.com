import React, { useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { websiteItem } from '../../../public/js/reactDndTypes'

export default ({ itemData, swiper, pageSwitchSpeed }) => {
    const dispatch = useDispatch()
    const { curLevelId, levels, userInfo } = useSelector((state) => ({
        userInfo: state.public.userInfo,
        curLevelId: state.user.curLevel,
        levels: state.user.levels
    }))

    /** @desc ------------------------拖拽移动 ------------------------  */
    const [{ isDragging }, drag] = useDrag({
        item: {
            type: websiteItem.move,
            moveType: websiteItem.moveLevel,
            dragId: itemData._id
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    })
    const draggingStyle = isDragging ? { opacity: 0.5 } : {}
    const [{ isOver }, drop] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            if (item.dragId === itemData._id) return
            if (item.moveType === websiteItem.moveLevel) {
                dispatch.user.levelsSort({
                    dragId: item.dragId,
                    dropId: itemData._id
                })
                swiper.slideTo(0, pageSwitchSpeed, false)
            }

            if (item.moveType === websiteItem.moveSite) {
                dispatch.user.siteFolderLevelChange({
                    dragId: item.dragId,
                    dropId: itemData._id
                })
            }
        },
        // hover (item, monitor) {
        //     // 已经移入则不运行以下代码
        //     if (monitor.isOver({ shallow: true })) return
        // },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    })

    const levelChange = useCallback(() => {
        for (const key in levels) {
            if (levels[key]._id === itemData._id) {
                swiper.slideTo(key, pageSwitchSpeed, false)
                break
            }
        }
    }, [itemData._id, levels, pageSwitchSpeed, swiper])

    /** @desc ------------------------自定义设置 ------------------------  */
    let levelIconShow = {}
    let levelTextShow = {}
    let levelShadow = {}
    if (userInfo) {
        levelIconShow = !userInfo.levelIconShow ? 'icon-show-false' : ''
        levelTextShow = !userInfo.levelTextShow ? 'text-show-false' : ''
        levelShadow = !userInfo.levelShadow ? { boxShadow: 'none' } : {}
    }

    return <div
        ref={drag}
        data-id={itemData._id}
        style={{
            ...draggingStyle,
            ...levelShadow
        }}
        className={`title ${itemData._id === curLevelId ? 'active' : ''} ${isOver ? 'drop' : ''} ${levelIconShow} ${levelTextShow}`}
        onClick={levelChange}>
        <span className="iconfont" dangerouslySetInnerHTML={{ __html: itemData.icon }}></span>
        <em >{itemData.name}</em>
        <div className="level-title-drag-mask" ref={drop}/>
    </div>
}
