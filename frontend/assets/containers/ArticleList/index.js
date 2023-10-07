import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import './index.scss'

import ArticleList from '../../components/ArticleList'
import Search from '../../components/Search'
import { trim } from '../../public/js'
import Toast from '../../components/Toast'
import { useCallbackAsync } from '../../public/hooks'

export default () => {
    const dispatch = useDispatch()
    const searchInput = useRef()
    const [searchVal, setSearchVal] = useState(null)
    const [search, setSearch] = useState(false)
    const searchArticle = useCallbackAsync(async () => {
        const val = trim(searchInput.current.value)

        const res = await dispatch.article.articleGet({ keywords: val, currentPage: 1, pageSize: 10 })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }

        setSearch(true)
        setSearchVal(val)
        searchInput.current.value = ''
        dispatch.article.articleListSet(res.data)
    }, [dispatch])
    return <div className="tag-list">
        <Search ref={searchInput} onSearch={searchArticle} type="article"/>
        <ArticleList search={search} searchVal={searchVal}/>
    </div>
}
