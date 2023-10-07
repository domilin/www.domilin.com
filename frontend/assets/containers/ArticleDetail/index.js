import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import './index.scss'
import ArticleListLeft from '../../components/ArticleListLeft'
import AlbumListLeft from '../../components/AlbumListLeft'
import ImgPopup from '../../components/ImgPopup'
import { formatPublishTime } from '../../public/js'
import { staticDomain } from '../../../config/config'
import blueLogo from '../../public/imgs/logo-blue.png'

export default () => {
    const { articleDetail } = useSelector((state) => ({
        articleDetail: state.article.articleDetail
    }))

    const userInfo = articleDetail.user

    // 点击图片看大图
    const [imgSrc, setImgSrc] = useState('')
    const [imgShow, setImgShow] = useState(false)
    useEffect(() => {
        const imgs = document.getElementById('qlEditor').getElementsByTagName('img')
        for (const img of imgs) {
            img.addEventListener('click', function (event) {
                const src = event.target.getAttribute('src')
                if (!src) return
                setImgShow(true)
                setImgSrc(src)
            }, false)
        }
    }, [])
    return <div className="article-wrapper block-wrapper">
        <div className="article-content block-content">
            <h1>{articleDetail.title}</h1>
            <div className="article-info">
                <a className="author-info">
                    <div className="author-avatar">
                        <img
                            src={userInfo.avatar ? staticDomain + userInfo.avatar : blueLogo}
                            alt={userInfo.nickName || userInfo.email || userInfo.userName}
                        />
                    </div>
                    <span className="author-name">
                        {userInfo.nickName || userInfo.email || userInfo.userName}
                    </span>
                </a>
                <time>{formatPublishTime(new Date(articleDetail.createdAt).getTime())}</time>
                <div className="article-tags">
                    {Array.isArray(articleDetail.tags) && articleDetail.tags.map(function (item, index) {
                        return <a href={`/article/tag/${item._id}`} key={item._id}>#{item.name}</a>
                    })}
                </div>
            </div>
            <div className="ql-container ql-snow">
                <div className="ql-editor" id="qlEditor" dangerouslySetInnerHTML={{ __html: articleDetail.content }}/>
            </div>
        </div>
        {imgShow && <ImgPopup close={() => setImgShow(!imgShow)} show={imgShow} src={imgSrc}/>}
        <div className="recommend-article block-list">
            <AlbumListLeft/>
            <ArticleListLeft title="相关博文"/>
        </div>
    </div>
}
