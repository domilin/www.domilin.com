import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import './index.scss'

import ArticleListLeft from '../../components/ArticleListLeft'
import { trim, addEvent, isJson } from '../../public/js'
import { useCallbackAsync, useEffectAsync } from '../../public/hooks'
import Toast from '../../components/Toast'
import Button from '../../components/Button'
import mediaQuill from './editor'

export default () => {
    const { articleId } = useParams()

    const dispatch = useDispatch()
    const { userInfo, channelList } = useSelector((state) => ({
        channelList: state.article.channelList,
        userInfo: state.public.userInfo
    }))

    // 设置编辑器
    const [fullscreen, setFullscreen] = useState(false)
    const [editor, setEditor] = useState('')
    useEffect(() => {
        mediaQuill({ dispatch, setEditor })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 点击全屏与退出全屏
    const fullscreenHandle = useCallback((event) => {
        const className = event.target.getAttribute('class')
        if (className && className.indexOf('ql-fullscreen') > -1) {
            setFullscreen(!fullscreen)
        }
    }, [fullscreen])
    useEffect(() => {
        if (!editor) return
        document.addEventListener('click', fullscreenHandle, false)

        return () => {
            document.removeEventListener('click', fullscreenHandle, false)
        }
    }, [editor, fullscreenHandle])

    // 标题输入限制字数
    const titleInput = useRef()
    const [titleWordsNum, setTitleWordsNum] = useState(0)
    const titleChange = useCallback((event) => {
        const val = trim(event.target.value)
        if (val.length > 60) titleInput.current.value = val.substr(0, 60)
        setTitleWordsNum(event.target.value.length)
    }, [])

    // 当前频道
    const [curChannelId, setCurChannelId] = useState(null)
    const channelIdRef = useRef(null)
    useEffect(() => {
        if (channelIdRef.current === curChannelId) return
        channelIdRef.current = curChannelId
    }, [curChannelId])
    useEffect(() => {
        if (!channelList || !Array.isArray(channelList) || channelList.length === 0) return
        setCurChannelId(channelList[0]._id)
    }, [channelList])

    /** @deac --------------标签：输入与编辑-------------- */
    // tag输入与删除, tag实时获取
    const [tagExist, setTagExist] = useState([])
    const [tagArr, setTagArr] = useState([])
    const tagInput = useRef()
    const tagDel = useCallback((index) => {
        const arrTemp = JSON.parse(JSON.stringify(tagArr))
        arrTemp.splice(index, 1)
        setTagArr(arrTemp)
    }, [tagArr])
    const tagSureAdd = useCallbackAsync(async (valObj) => {
        if (!userInfo.userId) {
            Toast.info('请首先登录或注册')
            return
        }

        // 隐藏已存在的tag弹出层
        setTagExist([])
        // 清空输入框
        tagInput.current.value = ''

        if (valObj.name === '') return
        if (tagArr.length === 3) {
            Toast.info('最多3个标签')
            tagInput.current.value = ''
            return
        }

        let curVal = valObj
        // 如果是确认键添加，则先添加此tag到数据库中，返回{_id, name}
        if (!valObj._id) {
            const res = await dispatch.article.tagAdd(valObj.name)

            if (res.code !== 1) {
                Toast.info(res.msg)
                return
            }
            curVal = res.data
        }

        // 检测是否已存在此Tag
        for (let val of tagArr) {
            if (val._id === curVal._id) {
                Toast.info('已存在此标签')
                tagInput.current.value = ''
                return
            }
        }

        const arrTemp = JSON.parse(JSON.stringify(tagArr))
        arrTemp.push(curVal)
        setTagArr(arrTemp)
    }, [dispatch.article, tagArr, userInfo.userId])
    const curTagKeyUpTime = useRef()
    const tagInputKeyUp = useCallbackAsync(async (event) => {
        const val = trim(event.target.value)

        // enter键盘确认添加
        if (event.keyCode === 13) {
            tagSureAdd({ _id: null, name: val })
            return
        }

        // 内容为空，还原远程tag，并不做任何操作
        if (val === '') {
            setTagExist([])
            return
        }

        // 字符大于18时截取前18个字
        if (val.length > 18) {
            tagInput.current.value = val.substr(0, 18)
            return
        }

        // 500毫秒后，获取已输入关键词匹配tag---节流：如果这500毫秒内，再次按键则不获取
        curTagKeyUpTime.current = new Date().getTime()
        const delayTime = 300
        setTimeout(async () => {
            // 执行此函数时的时间减去延迟时间，应该等于此时键盘弹起时间：由于程序执行或其它因为导致会有几毫秒延迟或提前，故在此取绝对值，允许这几毫秒的动态范围
            const time = Math.abs((new Date().getTime() - delayTime) - curTagKeyUpTime.current)
            if (time > 3) return
            const res = await dispatch.article.tagGet({ name: val })
            if (res.code !== 1) {
                Toast.info(res.msg)
                return
            }
            setTagExist(res.data)
        }, delayTime)
    }, [dispatch.article, tagSureAdd])

    // 当前鼠标所在元素不是，tagDropdown中span时，tagInput的blur时请，清除tagExsit列表
    const [eleClass, setEleClass] = useState(null)
    useEffect(() => {
        addEvent(document.body, 'mouseover', function (event) {
            setEleClass(event.target.className)
        }, true)
    }, [])

    /** @deac --------------博文发布与编辑-------------- */
    // 清空内容
    const clearDo = useCallback(() => {
        titleInput.current.value = ''
        setTitleWordsNum(0)
        editor.deleteText(0, 100000)
        setTagArr([])
        setCurChannelId(
            channelList && Array.isArray(channelList) &&
            channelList.length > 0
                ? channelList[0]._id : null
        )
        window.localStorage.removeItem('domilinArticle')
    }, [channelList, editor])
    // 发布博文
    const sendDo = useCallbackAsync(async () => {
        if (!userInfo.userId) {
            Toast.info('请首先登录或注册')
            return
        }

        if (titleWordsNum > 60 || titleWordsNum < 8) {
            Toast.error('标题字数范围8-60')
            return
        }

        if (editor.getLength() < 200) {
            Toast.error('内容不少于200字')
            return
        }

        if (editor.mediaUploading()) {
            Toast.error('图片上传中')
            return
        }

        if (!channelIdRef.current) {
            Toast.error('请选择博文分类')
            return
        }

        if (tagArr.length === 0 || tagArr.length > 3) {
            Toast.error('请输入1-3个标签')
            return
        }

        const params = {
            title: titleInput.current.value,
            content: editor.root.innerHTML,
            channelId: channelIdRef.current,
            tags: tagArr,
            userId: userInfo.userId
        }
        let res = null
        if (articleId) {
            res = await dispatch.article.articleEdit({ ...params, _id: articleId })
        } else {
            res = await dispatch.article.articleAdd(params)
        }

        if (!res) {
            Toast.error('博文添加错误')
            return
        }

        if (res.code !== 1) {
            Toast.error(res.msg)
            return
        }
        clearDo()
        Toast.info('发布成功, 请等待审核')
        window.location.reload()
    }, [userInfo.userId, titleWordsNum, editor, tagArr, articleId, clearDo, dispatch.article])

    /** @deac --------------自动保存-------------- */
    // 5s自动保存内容到本地localstorage
    // 发布成功，清空按钮==删除此localstorage: 点击发布按钮不清空，有可能编辑过程中到其它页面，再中途回来继续编辑
    // 页面刷新时(新建博文)从localstorage恢复内容
    // 编辑博文：url中获取articleId=>ajax获取博文内容=>设置内容到各个输入框=>再走自动保存逻辑
    const autosaveTags = useRef()
    const autosaveConent = useRef()
    useEffect(() => {
        if (!editor) return
        editor.on('text-change', function (delta, oldDelta, source) {
            autosaveConent.current = editor.root.innerHTML
        })
    }, [editor])
    useEffect(() => {
        autosaveTags.current = tagArr
    }, [tagArr])
    const setContent = useCallback(({ title, content, tags, channelId }) => {
        if (!editor) return
        titleInput.current.value = title || ''
        setTitleWordsNum((title && title.length) || 0)
        editor.root.innerHTML = content || ''
        setTagArr(tags || [])
        setCurChannelId(channelId)
    }, [editor])
    useEffect(() => {
        if (!editor) return
        // 如果存在自动保存的内容，则恢复
        const oldData = window.localStorage.getItem('domilinArticle')
        if (oldData && isJson(oldData)) {
            const { title, content, tags, channelId } = JSON.parse(oldData)
            setContent({ title, content, tags, channelId })
        }

        // 设置定时器自动保存内容
        const timer = setInterval(() => {
            if (editor.mediaUploading()) return
            try {
                const data = {
                    title: titleInput.current.value,
                    content: autosaveConent.current,
                    tags: autosaveTags.current,
                    channelId: channelIdRef.current
                }
                window.localStorage.setItem('domilinArticle', JSON.stringify(data))
            } catch (err) {
                console.error(err)
                if (err.name.toUpperCase().indexOf('QUOTA') >= 0) {
                    Toast.info('浏览器本地缓存超出限额，请清除缓存或删减博文内容')
                }
            }
        }, 5000)
        return () => {
            clearInterval(timer)
        }
    }, [editor, setContent])

    // 博文编辑根据地址栏articleId首先获取博文详情
    useEffectAsync(async () => {
        if (!articleId) return
        const res = await dispatch.article.articleUserGet({ articleId })
        if (res.code !== 1) {
            window.location.href = '/article/submit'
            return
        }
        const { title, content, tags, channelId } = res.data
        setContent({ title, content, tags, channelId })
    }, [articleId, dispatch.article, setContent])

    // 搜索博文
    const [keywords, setKeywords] = useState()
    useEffectAsync(async () => {
        if (!userInfo.userId) return
        const res = await dispatch.article.articleUserGet({
            currentPage: 1,
            pageSize: 10,
            keywords
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
        dispatch.article.articleListSet(res.data)
    }, [dispatch.article, keywords, userInfo.userId])
    const searchDo = useCallback((event) => {
        const val = trim(event.target.value)
        if (event.keyCode === 13) {
            setKeywords(val)
        }
    }, [])

    // 获取默认个人博文列表
    useEffectAsync(async () => {
        if (!userInfo.userId) return
        const res = await dispatch.article.articleUserGet({
            userId: userInfo.userId,
            currentPage: 1,
            pageSize: 10
        })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        dispatch.article.articleListSet(res.data)
    }, [dispatch.article, userInfo.userId])

    // 获取频道
    useCallbackAsync(async () => {
        const res = await dispatch.article.channelGet()
        if (res.code !== 1) {
            Toast.info(res.msg)
        }
    }, [dispatch.article])

    return <div className="submit-wrapper block-wrapper">
        <div className="article-list-content block-list">
            <div className="article-search-self">
                <input onKeyUp={searchDo} type="text" placeholder="请输入关键字"/>
                <span className="iconfont" onClick={searchDo}>&#xe65c;</span>
            </div>
            {useMemo(() => <ArticleListLeft title="我的博文" user={true} keywords={keywords}/>, [keywords])}
        </div>
        <div className="block-content write-article">
            <div className="article-title">
                <input ref={titleInput} onChange={titleChange} type="text" placeholder="请输入8-60字博文标题"></input>
                <span><em className={titleWordsNum > 60 ? 'error' : ''}>{titleWordsNum}</em>/60</span>
            </div>
            <div className={`article-content ${fullscreen ? 'active' : ''}`}>
                <div className="article-content-box">
                    <div id="editorQuill"/>
                </div>
            </div>
            <div className="article-channel">
                <h3>博文分类</h3>
                <div className="article-channel-select">
                    {Array.isArray(channelList) && channelList.map(function (item, index) {
                        return <div
                            onClick={() => setCurChannelId(item._id)}
                            className={`article-channel-option ${curChannelId === item._id ? 'active' : ''}`}
                            key={item._id}>
                            {item.name}
                        </div>
                    })}
                </div>
            </div>
            <div className="article-tags">
                {Array.isArray(tagArr) && tagArr.map(function (item, index) {
                    return <div className="tag-item" key={item._id}>
                        {item.name}
                        <span className="iconfont" onClick={() => tagDel(index)}>&#xe6be;</span>
                    </div>
                })}
                <div className="tag-input-wrapper">
                    <input
                        ref={tagInput}
                        onBlur={() => eleClass !== 'tag-dropdown-item' && setTagExist([])}
                        onKeyUp={tagInputKeyUp}
                        type="text"
                        placeholder="标签1-3个,单个至多10个字,确认键添加"
                    />
                    <div className="tag-dropdown" style={{ display: tagExist.length === 0 ? 'none' : 'block' }}>
                        {Array.isArray(tagExist) && tagExist.map(function (item, index) {
                            return <span className="tag-dropdown-item" onClick={() => tagSureAdd(item)} key={item._id}>{item.name}</span>
                        })}
                    </div>
                </div>
            </div>
            <div className="article-send">
                <Button size="large" onClick={sendDo}>发布</Button>
                <Button size="large" type="grey" onClick={clearDo}>清空</Button>
            </div>
        </div>
    </div>
}
