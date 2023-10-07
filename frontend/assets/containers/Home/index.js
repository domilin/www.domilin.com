import React from 'react'
import './index.scss'
import Search from '../../components/Search'
import Website from '../../components/Website'
import ArticleList from '../../components/ArticleList'

export default () => {
    return <div className="home-wrapper">
        <Search type="searchEngine"/>
        <Website page="home"/>
        <ArticleList/>
    </div>
}
