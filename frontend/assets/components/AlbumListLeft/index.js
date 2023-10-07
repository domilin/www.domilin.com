import React from 'react'
import { useSelector } from 'react-redux'
import './index.scss'
export default () => {
    const { albumList } = useSelector((state) => ({
        albumList: state.article.albumList
    }))

    const loopList = albumList && ('list' in albumList) && Array.isArray(albumList.list) ? albumList.list : []
    return <div className="album-list-left-wrapper" style={{ display: loopList.length > 0 ? 'block' : 'none' }}>
        <div className="album-list-left-title">相关专辑</div>
        <ul className="album-list-left">
            {loopList.map(function (item, index) {
                return <li key={item._id}>
                    <a href={`/article/album/${item._id}`}>{item.title}</a>
                </li>
            })}
        </ul>
    </div>
}
