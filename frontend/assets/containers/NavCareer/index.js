import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import './index.scss'

import Website from '../../components/Website'
import Search from '../../components/Search'
import { trim } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'
import Toast from '../../components/Toast'

export default () => {
    const dispatch = useDispatch()
    const searchInput = useRef()
    const [search, setSearch] = useState(false)
    const [searchVal, setSearchVal] = useState(null)
    const searchArticle = useCallbackAsync(async () => {
        const val = trim(searchInput.current.value)
        const res = await dispatch.website.siteListGet({
            keywords: val,
            currentPage: 1,
            pageSize: 50
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }

        setSearch(true)
        setSearchVal(val)
        searchInput.current.value = ''
        dispatch.website.curFirstLevelSet(null)
    }, [dispatch])
    return <div className="nav-career-wrapper">
        <Search ref={searchInput} onSearch={searchArticle} type="website"/>
        <Website search={search} searchVal={searchVal} page="career"/>
    </div>
}
