import { useDrag, useDrop } from 'react-dnd'
import { useDispatch } from 'react-redux'
import { websiteItem } from '../../public/js/reactDndTypes'

export default ({ itemId }) => {
    const dispatch = useDispatch()
    /** @desc ------------------------拖拽移动 ------------------------  */

    const [{ isDragging }, drag] = useDrag({
        item: {
            type: websiteItem.move,
            moveType: websiteItem.moveSite,
            dragId: itemId
        },
        collect: (monitor) => {
            const obj = {
                isDragging: monitor.isDragging()
            }
            if (!monitor.getItem || !monitor.getItem()) return obj
            if (window.curDragId === monitor.getItem().dragId) return obj
            window.curDragId = monitor.getItem().dragId
            return obj
        }
    })

    const [{ isOverSort }, dropSort] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            if (item.dragId === itemId) return
            dispatch.user.sitesFoldersSort({
                dragId: item.dragId,
                dropId: itemId
            })
        },
        // hover (item, monitor) {
        //     // 已经移入则不运行以下代码 if (monitor.isOver({ shallow: true })) return
        //     if (window.dropHoverId === itemId) return
        //     window.dropHoverId = itemId
        // },
        collect: (monitor) => ({
            isOverSort: monitor.isOver() &&
            monitor.getItem &&
            monitor.getItem() &&
            monitor.getItem().moveType &&
            monitor.getItem().moveType === websiteItem.moveSite
        })
    })

    const [{ isOverFolderNew }, dropFolderNew] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            if (item.dragId === itemId) return
            dispatch.user.sitesFolderNew({
                dragId: item.dragId,
                dropId: itemId
            })
        },
        collect: (monitor) => ({
            isOverFolderNew: monitor.isOver() &&
            monitor.getItem &&
            monitor.getItem() &&
            monitor.getItem().moveType &&
            monitor.getItem().moveType === websiteItem.moveSite
        })
    })

    const [{ isOverFolderAdd }, dropFolderAdd] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            if (item.dragId === itemId) return
            dispatch.user.sitesFolderAdd({
                dragId: item.dragId,
                dropId: itemId
            })
        },
        collect: (monitor) => ({
            isOverFolderAdd: monitor.isOver() &&
            monitor.getItem &&
            monitor.getItem() &&
            monitor.getItem().moveType &&
            monitor.getItem().moveType === websiteItem.moveSite
        })
    })

    const [{ isOverFolderOuter }, dropFolderOuter] = useDrop({
        accept: websiteItem.move,
        drop (item, monitor) {
            if (item.dragId === itemId) return
            dispatch.user.sitesFolderOuter({
                dragId: item.dragId,
                dropId: itemId
            })
        },
        collect: (monitor) => ({
            isOverFolderOuter: monitor.isOver() &&
            monitor.getItem &&
            monitor.getItem() &&
            monitor.getItem().moveType &&
            monitor.getItem().moveType === websiteItem.moveSite
        })
    })

    return {
        drag,
        isDragging,
        dropSort,
        isOverSort,
        dropFolderNew,
        isOverFolderNew,
        dropFolderAdd,
        isOverFolderAdd,
        dropFolderOuter,
        isOverFolderOuter
    }
}
