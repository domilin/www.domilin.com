import React, { useEffect, useReducer, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useLocation } from 'react-router-dom'

import './index.scss'

import FormItemButton from '../../components/FormItemButton'
import FormSelect from '../../components/FormSelect'
import Button from '../../components/Button'
import FormItem from '../../components/FormItem'
import ColorPicker from '../../components/ColorPicker'
import ContextMenu from '../../components/ContextMenu'
import Toast from '../../components/Toast'
import BlockOnPopup from '../../components/BlockOnPopup'
import { staticDomain } from '../../../config/config'
import { trim, mouseOffset, elementOffset, scrollOffset } from '../../public/js'
import { useCallbackAsync, useEffectAsync } from '../../public/hooks'

import {
    posterAdd,
    uploadPosterImg,
    posterGet,
    posterDel,
    posterEdit,
    posterCreate,
    settingAdd,
    settingEdit,
    settingDel,
    uploadFont,
    fontAdd,
    fontGet
} from '../../models/poster'

const fontStyles = [
    { value: 'center', name: '居中' },
    { value: 'left', name: '居左' },
    { value: 'right', name: '居右' }
]
export default () => {
    // 当前编辑类型
    const location = useLocation()
    const [curTypeIndex, setCurTypeIndex] = useState(null)
    const isMaker = location.pathname.indexOf('/postermaker') > -1

    const [poster, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'set':
                return { ...state, ...action.data }
            case 'change':
                const setting = state.setting
                setting[curTypeIndex] = { ...state.setting[curTypeIndex], ...action.data }
                return { ...state, setting }
            default:
                return state
        }
    }, {
        _id: null,
        name: null,
        url: null,
        setting: [],
        posetList: [],
        madeList: []
    })

    const dispatchDone = useCallback((type, data) => {
        dispatch({ type, data })
    }, [])
    const { posterId } = useParams()

    // 获取设置
    const getPosterAndSetting = useCallbackAsync(async () => {
        const res = await posterGet({ _id: posterId })
        if (res.code !== 1) return
        dispatchDone('set', res.data)

        if (!Array.isArray(res.data.setting) || res.data.setting.length === 0) return
        setCurTypeIndex(0)
    }, [dispatchDone, posterId])

    // 如果是编辑根据posterId获取默认配置
    useEffect(() => {
        // 若是不是设置页面，则请求所有还有列表
        if (!isMaker) {
            (async () => {
                const res = await posterGet()
                dispatchDone('set', { posetList: res.data })
            })()
        }

        // 两个页面若有posterId，则获取详情
        if (!posterId) return
        getPosterAndSetting()
    }, [dispatchDone, getPosterAndSetting, isMaker, posterId])

    // 确认制作海报
    const sureMakePoster = useCallbackAsync(async () => {
        const settingArr = []
        for (let val of poster.setting) {
            settingArr.push({
                id: val._id,
                value: val.value
            })
        }
        const res = await posterCreate({
            posterId: poster._id,
            setting: settingArr
        })

        if (res && res.data && Array.isArray(res.data)) {
            Toast.info('制作成功')
            dispatchDone('set', {
                madeList: res.data
            })
            document.getElementById('posterSetting').scrollTop = 0
            // window.location.href = staticDomain + res.data
        }
    }, [dispatchDone, poster._id, poster.setting])

    // 上传海报
    const posterUpload = useRef()
    const posterChange = useCallbackAsync(async (event) => {
        let file = event && event.target && event.target.files[0] // 获取文件
        if (!file) return
        if ((file.size / 1024).toFixed(0) > 1024 * 10) {
            Toast.info('图片请小于10M')
            return
        }
        const res = await uploadPosterImg({ poster: file })
        const poster = await posterAdd({ url: res.data.url, name: res.data.filename })
        window.location.href = `/postermaker/${poster.data._id}`
    }, [])

    // 上传字体文件
    const fontUpload = useRef()
    const fontChange = useCallbackAsync(async (event) => {
        let file = event && event.target && event.target.files[0] // 获取文件
        if (!file) return
        if ((file.size / 1024).toFixed(0) > 1024 * 10) {
            Toast.info('图片请小于10M')
            return
        }
        const res = await uploadFont({ font: file })
        await fontAdd({ url: res.data.url, name: res.data.filename })
        window.location.reload()
    }, [])

    // 字体列表
    const [fonts, setFonts] = useState([])
    useEffectAsync(async () => {
        const res = await fontGet()
        const fontsTemp = []
        for (let val of res.data) {
            fontsTemp.push({
                name: val.name,
                value: val.url,
                id: val._id
            })
        }
        setFonts(fontsTemp)
    }, [])

    // 更改描述值
    const changeSetting = useCallback((params) => {
        dispatchDone('change', params)
    }, [dispatchDone])

    // 添加分类
    const [addTypeShow, setAddTypeShow] = useState(false)
    const [editTypeId, setEditTypeId] = useState(null)
    const [typeInput, setTypeInput] = useState('')
    const typeAddEdit = useCallbackAsync(async function () {
        const nameVal = trim(typeInput)
        if (!nameVal || nameVal === '') {
            Toast.info('请输入名称')
            return
        }

        if (!editTypeId) { // 添加
            await settingAdd({ posterId: poster._id, title: nameVal })
        } else { // 编辑
            await settingEdit({
                _id: editTypeId,
                title: nameVal
            })
        }
        getPosterAndSetting()
        setAddTypeShow(false)
    }, [editTypeId, getPosterAndSetting, poster._id, typeInput])

    // 隐藏公共导航
    useEffect(() => {
        document.querySelector('.layout-header').setAttribute('style', 'display: none')
    }, [])

    // 获取单项设置值
    const setting = useCallback((keyName) => {
        if (poster && poster.setting && Array.isArray(poster.setting) && poster.setting.length > 0) {
            if (!poster.setting[curTypeIndex]) return
            return poster.setting[curTypeIndex][keyName]
        }
    }, [curTypeIndex, poster])

    // 图片实际大小与显示大小比例
    const [imgRatio, setImgRatio] = useState(1)
    useEffect(() => {
        if (!poster.url) return
        const ele = document.getElementById('posterImg')
        ele.onload = function (event) {
            event.stopPropagation()
            const { width, naturalWidth } = elementOffset(ele)
            setImgRatio(naturalWidth / width)
        }
    }, [poster.url])

    // 获取图片位置
    const imgClickHandle = useCallback((event) => {
        if (!isMaker) return
        const { x, y } = mouseOffset(event)
        const { left, top } = scrollOffset(document.getElementById('posterShow'))
        dispatchDone('change', {
            left: ((left + x) * imgRatio).toFixed(2),
            top: ((top + y) * imgRatio).toFixed(2)
        })
    }, [dispatchDone, imgRatio, isMaker])

    // 确认样式
    const sureDone = useCallbackAsync(async () => {
        const promiseAll = []
        for (let val of poster.setting) {
            delete val.updatedAt
            delete val.createdAt
            delete val.value
            delete val.__v
            promiseAll.push(settingEdit(val))
        }
        promiseAll.push(posterEdit({ name: poster.name, _id: poster._id }))
        const res = await Promise.all(promiseAll)
        for (let val of res) {
            if (!val) return
        }
        Toast.info('设置成功')
    }, [poster._id, poster.name, poster.setting])

    // 删除样式
    const delDone = useCallbackAsync(async () => {
        const promiseAll = []
        for (let val of poster.setting) {
            promiseAll.push(settingDel({ _id: val._id }))
        }
        promiseAll.push(posterDel({ _id: poster._id }))
        await Promise.all(promiseAll)
        Toast.info('删除成功')
        window.location.href = '/postermaker'
    }, [poster])

    // 当前字体样式名称
    let fontStyleName = ''
    for (let val of fontStyles) {
        if (val.value === setting('textAlign')) {
            fontStyleName = val.name
            break
        }
    }

    // 当前字体名称
    let fontFamilyName = ''
    for (let val of fonts) {
        if (val.id === (setting('fontFamily') && setting('fontFamily').id)) {
            fontFamilyName = val.name
            break
        }
    }

    // poster列表
    const posterArr = []
    for (let val of poster.posetList) {
        posterArr.push({
            name: val.name,
            value: val.url,
            id: val._id
        })
    }

    return createPortal(<div className="poster-maker">
        <div className="poster-show" id="posterShow">
            {poster.url && <div className="poster-image-wrapper" id="posterImageWrapper">
                <img id="posterImg" onClick={imgClickHandle} src={staticDomain + poster.url} alt={poster.name}/>
                {poster.setting.map(function (item, index) {
                    return <div
                        key={item._id}
                        style={{
                            left: item.left / imgRatio + 'px',
                            top: item.top / imgRatio + 'px',
                            textAlign: item.textAlign,
                            fontSize: item.fontSize / imgRatio + 'px',
                            color: item.fontColor,
                            fontFamily: item.fontFamily && `"${item.fontFamily.id}"`
                        }}
                        className="poster-type-item">
                        {item.value && item.value.split(',') && item.value.split(',').length > 0 && item.value.split(',')[0]}
                        {item.fontFamily && <div dangerouslySetInnerHTML={{ __html: `
                            <style type="text/css">
                                @font-face {
                                    font-family: '${item.fontFamily.id}';
                                    src: url('${staticDomain + item.fontFamily.value}');
                                }
                            </style>
                        ` }} />}
                    </div>
                })}
            </div>}
        </div>

        {!isMaker && <div className="poster-setting" id="posterSetting">
            <BlockOnPopup>
                <FormItemButton title="选择海报">
                    <FormSelect
                        defaultValue={{
                            value: poster.url,
                            name: poster.name
                        }}
                        options={posterArr}
                        onChange={(option) => {
                            window.location.href = `/poster/${option.id}`
                        }}/>
                </FormItemButton>
                <FormItemButton onClick={() => {
                    if (!posterId) {
                        Toast.info('请先选择海报样式')
                        return
                    }
                    window.location.href = `/postermaker/${poster._id}`
                }} title="编辑当前选择海报样式"/>
                <FormItemButton onClick={() => {
                    window.location.href = `/postermaker`
                }} title="新建样式"/>
            </BlockOnPopup>

            {poster.madeList &&
            Array.isArray(poster.madeList) &&
            poster.madeList.length > 0 &&
            <>
            <div className="poster-tips" id="posterMadeList">
                制作完成海报列表
            </div>
            <BlockOnPopup className="poster-made">
                {poster.madeList.map(function (item, index) {
                    return <FormItemButton className="poster-made-list" key={index} title={item.split('/posters/')[1]}>
                        <a href={staticDomain + item} target="_blank" title={item}/>
                        <span className="iconfont">&#xe6a3;</span>
                    </FormItemButton>
                })}
            </BlockOnPopup>
            </>}
            <div className="poster-tips">
                提示：批量制作，以英文逗号“,”隔开
            </div>
            <BlockOnPopup>
                {Array.isArray(poster.setting) && poster.setting.map(function (item, index) {
                    return <FormItem
                        key={item._id}
                        title={item.title}
                        onFocus={() => setCurTypeIndex(index)}
                        onChange={(event) => {
                            changeSetting({ value: trim(event.target.value) })
                        }}
                        defaultValue={item.value}
                        placeholder={`请输入${item.title}`}
                    />
                })}
            </BlockOnPopup>
            <div
                className="sure-done"
                style={{ display: poster.url && poster.setting.length > 0 ? 'flex' : 'none' }}>
                <Button onClick={sureMakePoster}>确认</Button>
            </div>
        </div>}

        {isMaker && <div className="poster-setting">
            <BlockOnPopup>
                <FormItemButton className="upload-image" title="上传海报">
                    <input
                        ref={posterUpload}
                        onChange={posterChange}
                        type="file"
                        accept="image/*"
                    />
                    <span className="iconfont">&#xe75d;</span>
                </FormItemButton>
                <FormItemButton className="upload-font" title="上传字体文件">
                    <input
                        ref={fontUpload}
                        onChange={fontChange}
                        type="file"
                        accept=".eot, .otf, .fon, .font, .ttf, .ttc, .woff, .woff2, .svg"
                    />
                    <span className="iconfont">&#xe75d;</span>
                </FormItemButton>
                <FormItem
                    onChange={(event) => {
                        dispatchDone('set', {
                            name: trim(event.target.value)
                        })
                    }}
                    defaultValue={poster.name}
                    placeholder="请输入样式名"
                />
            </BlockOnPopup>
            <div className="poster-tips">
                提示：点击“+”添加描述，右键编辑与删除描述
            </div>
            <div className="website-category-title">
                {poster.setting.map(function (item, index) {
                    return <ContextMenu
                        onChange={async (option) => {
                            if (option.value === 1) {
                                setEditTypeId(item._id)
                                setAddTypeShow(true)
                                setTypeInput(item.title)
                            }

                            if (option.value === 2) {
                                await settingDel({ _id: item._id })
                                getPosterAndSetting()
                            }
                        }}
                        options={[
                            { value: 1, name: '编辑' },
                            { value: 2, name: '删除' }
                        ]}
                        key={item._id}>
                        <div
                            onClick={() => {
                                setCurTypeIndex(index)
                            }}
                            className={`title ${curTypeIndex === index ? 'active' : ''}`}>
                            {item.title}
                        </div>
                    </ContextMenu>
                })}
                <div
                    className="title add-title"
                    onClick={() => {
                        if (!poster.url) {
                            Toast.info('请上传海报')
                            return
                        }
                        setTypeInput('')
                        setAddTypeShow(true)
                    }}>
                    <span className="iconfont">&#xe6da;</span>
                </div>
            </div>

            <div className="add-intro-type" style={{ display: addTypeShow ? 'flex' : 'none' }}>
                <FormItem
                    defaultValue={typeInput}
                    onChange={(event) => setTypeInput(event.target.value)}
                    placeholder="请输入分类描述"
                />
                <Button onClick={typeAddEdit}>确认</Button>
                <Button onClick={() => {
                    setAddTypeShow(false)
                    setTypeInput('')
                }} type="grey">取消</Button>
            </div>

            <div className="add-edit-content" style={{ display: curTypeIndex || curTypeIndex === 0 ? 'block' : 'none' }}>
                <BlockOnPopup>
                    <FormItem
                        onChange={(event) => changeSetting({ value: trim(event.target.value) })}
                        defaultValue={setting('value')}
                        title="测试文字"
                        placeholder="测试文字"
                    />
                    <FormItem
                        childType="number"
                        onChange={(event) => changeSetting({ left: trim(event.target.value) })}
                        defaultValue={setting('left')}
                        title="X轴位置"
                        placeholder="X轴位置：可点击图片获取"
                    />
                    <FormItem
                        childType="number"
                        onChange={(event) => changeSetting({ top: trim(event.target.value) })}
                        defaultValue={setting('top')}
                        title="Y轴位置"
                        placeholder="Y轴位置：可点击图片获取"
                    />
                    <FormItem
                        childType="number"
                        onChange={(event) => changeSetting({ fontSize: trim(event.target.value) })}
                        defaultValue={setting('fontSize')}
                        title="字体大小"
                        placeholder="字体大小"
                    />
                    <FormItem title="字体颜色">
                        <ColorPicker
                            defaultValue={setting('fontColor')}
                            onChange={(val) => changeSetting({ fontColor: val })}
                        />
                    </FormItem>
                    <FormItemButton title="字体样式">
                        <FormSelect
                            defaultValue={{
                                value: setting('fontFamily') && setting('fontFamily').value,
                                name: fontFamilyName }}
                            options={fonts}
                            onChange={(option) => {
                                changeSetting({ fontFamily: option })
                            }}/>
                    </FormItemButton>
                    <FormItemButton title="对齐方式">
                        <FormSelect
                            defaultValue={{
                                value: setting('textAlign'),
                                name: fontStyleName
                            }}
                            options={fontStyles}
                            onChange={(option) => {
                                changeSetting({ textAlign: option.value })
                            }}/>
                    </FormItemButton>
                </BlockOnPopup>
            </div>

            <div className="sure-done" >
                <Button style={{ display: poster.url && poster.setting.length > 0 ? 'flex' : 'none' }} onClick={sureDone}>确认</Button>
                <Button onClick={delDone} type="grey">删除</Button>
                <Button onClick={() => {
                    // window.location.href = 'javascript:history.go(-1)'
                    window.location.href = '/poster'
                }} type="grey">返回首页</Button>
            </div>
        </div>}
    </div>, document.getElementById('root'))
}
