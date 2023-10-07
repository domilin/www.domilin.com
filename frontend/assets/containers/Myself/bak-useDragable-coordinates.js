import { useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { websiteItem } from '../../public/js/reactDndTypes'
import { elementOffset, scrollOffset } from '../../public/js'

const mouseAction = (monitor, targetId) => {
    const scrollEle = document.querySelector('.layout-wrapper')
    const wrapperEle = document.querySelector('.website-category-list')

    // 目标位置
    const targetEle = document.getElementById(`websiteItemDrag${targetId}`)
    const targetPos = elementOffset(targetEle, scrollEle)
    const targetLeft = targetPos.left
    const targetTop = targetPos.top
    const targetHeight = targetPos.height
    const targetWidth = targetPos.width

    // 鼠标位置
    const scrollPos = scrollOffset(scrollEle)
    const mousePos = monitor.getClientOffset()
    const mouseLeft = mousePos.x + scrollPos.left
    const mouseTop = mousePos.y + scrollPos.top

    // 上下间距
    const wrapperHeight = elementOffset(wrapperEle).width
    const oneColumnSiteNum = parseInt(wrapperHeight / targetHeight)
    const topSpace = (wrapperHeight - targetHeight * oneColumnSiteNum) / (oneColumnSiteNum - 1)

    // 左右间距
    const wrapperWidth = elementOffset(wrapperEle).width
    const oneLineSiteNum = parseInt(wrapperWidth / targetWidth)
    const leftSpace = (wrapperWidth - targetWidth * oneLineSiteNum) / (oneLineSiteNum - 1)

    // 鼠标是否正在target区域内
    const topTrue = mouseTop >= targetTop - topSpace / 2 && mouseTop <= targetTop + targetHeight + topSpace / 2

    // 排序位置范围(左间距 + 图标宽度左50%)
    // 此处加间距没啥用，因为间距间移动target还不知道是哪一个，此处先这么放着。暂时支持，target的左边坐标为排序
    const sortLeftTrue = mouseLeft >= targetLeft - leftSpace / 2 && mouseLeft <= targetLeft + targetWidth / 2

    if (sortLeftTrue && topTrue) {
        return 'sort'
    }

    // 添加文件夹范围(图标宽度右50%)
    const folderRightTrue = mouseLeft >= targetLeft + targetWidth / 2 && mouseLeft <= targetLeft + targetWidth + leftSpace / 2
    if (folderRightTrue && topTrue) {
        return 'folder'
    }
}

export default ({ dragId }) => {
    const dispatch = useDispatch()
    const { dropHoverId } = useSelector((state) => ({
        dropHoverId: state.user.dropHoverId
    }))
    const [dragType, setDragType] = useState(null)

    /** @desc ------------------------拖拽移动 ------------------------  */
    const [{ isDragging }, drag] = useDrag({
        item: {
            type: websiteItem.move,
            moveType: websiteItem.moveSite,
            dragId: dragId
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    })

    const [{ isOver }, drop] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            setDragType(null)
            dispatch.user.setDropHoverId(null)

            if (dragType === 'sort') { // 客户端排序
                dispatch.user.sitesFoldersSort({
                    dragId: item.dragId,
                    dropId: dragId
                })
            }

            if (dragType === 'folder') { // 客户端新建文件夹
                dispatch.user.sitesFolder({
                    dragId: item.dragId,
                    dropId: dragId
                })
            }
        },
        hover (item, monitor) {
            // 已经移入则不运行以下代码 if (monitor.isOver({ shallow: true })) return
            if (dropHoverId === dragId) return
            setDragType(null)
            dispatch.user.setDropHoverId(dragId)

            if (item.moveType === websiteItem.moveSite) {
                const action = mouseAction(monitor, dragId)
                if (action === 'sort') {
                    setDragType('sort')
                    // 普通排序
                    // 文件夹内排序
                }

                if (action === 'folder') {
                    // 移入、移出、新建
                    setDragType('folder')
                }
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver() &&
            monitor.getItem &&
            monitor.getItem() &&
            monitor.getItem().moveType &&
            monitor.getItem().moveType === websiteItem.moveSite
        })
    })

    return { drag, drop, isOver, isDragging, dragType }
}
