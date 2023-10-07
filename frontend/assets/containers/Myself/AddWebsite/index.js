import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import loadable from '@loadable/component'
import ColorThief from 'colorthief'

import './index.scss'

import Popup from '../../../components/Popup'
import ColorPicker from '../../../components/ColorPicker'
import ImageCropper from '../../../components/ImageCropper'
import logoBlack from '../../../public/imgs/logo-black.png'
import logoWhite from '../../../public/imgs/logo-white.png'
import FormItem from '../../../components/FormItem'
import FormItemButton from '../../../components/FormItemButton'
import FormSelect from '../../../components/FormSelect'
import BlockOnPopup from '../../../components/BlockOnPopup'
import Button from '../../../components/Button'
import { trim, isUrl, siteIconType, colorHex, isChromeExtension, sendMessageToContentScript, getSiteInfo, iconBackgroundColor, textLength } from '../../../public/js'
import { useCallbackAsync } from '../../../public/hooks'
import Toast from '../../../components/Toast'
import { staticDomain } from '../../../../config/config'
const SliderPicker = loadable(() => import('./SliderPicker'), { ssr: false })

const iconType = siteIconType
const getFirstChar = (nameStr) => {
    const name = nameStr || ''
    const twoTxt = name.substr(0, 2).replace(/^\S/, s => s.toUpperCase())
    const oneTxt = name.substr(0, 1).replace(/^\S/, s => s.toUpperCase())

    return textLength(twoTxt) > 3 ? oneTxt : twoTxt
}
export default ({ show, close, edit, levelId, searchAdd }) => {
    const dispatch = useDispatch()
    const { levels, sites } = useSelector((state) => ({
        sites: state.user.sites,
        levels: state.user.levels
    }))

    const iconUpload = useRef()

    // 错误提示
    const [urlErr, setUrlErr] = useState(null)
    const [nameErr, setNameErr] = useState(null)
    const [charErr, setCharErr] = useState(null)

    // 表单state
    const [urlInput, setUrlInput] = useState('')
    const [nameInput, setNameInput] = useState('')
    const [introInput, setIntroInput] = useState('')

    // 编辑时初始化值
    useEffect(() => {
        if (!edit || !show) return
        if (edit.iconType === siteIconType[2]) {
            setIconImg({
                url: edit.icon,
                blob: null
            })
        }

        if (edit.iconType === siteIconType[1]) {
            setCurChar(edit.icon)
        }

        if (edit.iconType === siteIconType[0]) {
            // setCurChar(edit.icon)
        }
        setCurIconType(edit.iconType)
        setCurIconBgColor(edit.background)
        setUrlInput(edit.url)
        setNameInput(edit.name)
        setIntroInput(edit.intro)
    }, [edit, show])

    // chrome-extension popup添加的时候
    useEffect(() => {
        if (!isChromeExtension() || (isChromeExtension() && window.pageType !== 'popup')) return
        if (edit || !show) return

        sendMessageToContentScript({ cmd: getSiteInfo }, function (res) {
            if (!res) return
            setCurIconType(siteIconType[1])

            const colorArr = iconBackgroundColor.slice(0, 8)
            const index = Math.floor((Math.random() * colorArr.length))
            setCurIconBgColor(colorArr[index])
            setUrlInput(res.url)
            setNameInput(res.title)
            setCurChar(getFirstChar(res.title))
            setIntroInput(res.description)
        })
    }, [edit, show])

    // 重置表单
    const clearForm = useCallback(() => {
        setCropImg(null)
        setIconImg({
            url: null,
            blob: null
        })
        setCurIconType(iconType[0])
        setCurIconBgColor(null)

        setCurChar(null)
        setUrlErr(null)
        setNameErr(null)
        setCharErr(null)

        setUrlInput('')
        setNameInput('')
        setIntroInput('')

        iconUpload.current.value = ''
    }, [])

    // 图片剪裁
    const [cropImg, setCropImg] = useState(null)
    const [iconImg, setIconImg] = useState({
        url: null,
        blob: null
    })
    const onSelectFile = useCallback((event) => {
        if (event.target.files && event.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => setCropImg(reader.result))
            reader.readAsDataURL(event.target.files[0])
        }
    }, [])

    // 确认上传图片
    const uploadIcon = useCallbackAsync(async () => {
        iconUpload.current.value = ''
        if (!iconImg.blob) return
        if ((iconImg.blob.size / 1024).toFixed(0) > 512) {
            Toast.info('图片请小于512KB')
            return
        }

        const res = await dispatch.public.uploadIconImage({ icon: iconImg.blob })
        if (res.code !== 1) {
            Toast.info(res.msg)
            return
        }
        Toast.info('图片上传成功')
        setCropImg(null)
        setIconImg({
            blob: null,
            url: res.data.url
        })

        // 根据图片主题颜色设置背景颜色
        const colorThief = new ColorThief()
        const imgMine = document.getElementById('imgMineUpload')
        if (imgMine.complete) {
            const hexColor = `rgb(${colorThief.getColor(imgMine).join(',')})`
            setCurIconBgColor(colorHex(hexColor))
        } else {
            const loadFunc = () => {
                const hexColor = `rgb(${colorThief.getColor(imgMine).join(',')})`
                setCurIconBgColor(colorHex(hexColor))
                imgMine.removeEventListener('load', loadFunc)
            }
            imgMine.addEventListener('load', loadFunc)
        }
    }, [dispatch.public, iconImg.blob])

    // 当前图标样式
    const [curIconType, setCurIconType] = useState(iconType[0])

    // 当前颜色
    const [curIconBgColor, setCurIconBgColor] = useState(null)
    useEffect(() => {
        // 新建图标时，设置默认颜色
        if (edit) return
        setCurIconBgColor(iconBackgroundColor[5])
    }, [edit])

    // 当前文字
    const [curChar, setCurChar] = useState(null)

    // 添加到哪个分类
    const [curLevel, setCurLevel] = useState({ name: '', value: levelId })
    const [levelOptions, setLevelOptions] = useState([])
    useEffect(() => {
        const arrTemp = []
        for (const val of levels) {
            if (val._id === levelId) {
                setCurLevel({ name: val.name, value: levelId })
            }
            arrTemp.push({ name: val.name, value: val._id })
        }
        setLevelOptions(arrTemp)
    }, [levelId, levels])

    // 确认添加/编辑网址
    const addEditSure = useCallbackAsync(async () => {
        const url = trim(urlInput || '')
        const name = trim(nameInput || '')
        const intro = trim(introInput || '')
        const char = trim(curChar || '')
        if (!isUrl(url) && url.indexOf('internal://') === -1 && url.indexOf('chrome://') === -1) {
            setUrlErr('请输入正确的网址')
            return
        }

        if (name === '') {
            setNameErr('请输入名称')
            return
        }

        let iconXhr = iconType[0]
        if (curIconType === iconType[1]) {
            if (char === '') {
                setCharErr('请输入文字')
                return
            }
            iconXhr = curChar || getFirstChar(edit)
        }

        if (curIconType === iconType[2]) {
            if (!iconImg.url || iconImg.blob) {
                Toast.info('选择并确认上传图片')
                return
            }
            iconXhr = iconImg.url
        }

        const params = {
            icon: iconXhr,
            iconType: curIconType,
            background: curIconBgColor,
            url: decodeURIComponent(url),
            name,
            intro: intro || name,
            levelId: curLevel.value
        }
        if (!edit) {
            let sortNum = 0
            for (let val of sites) {
                if (val.levelId === levelId) sortNum++
            }
            const res = await dispatch.user.siteAddXhr({ ...params, sort: sortNum })
            if (res.code !== 1) {
                if (res.code === 12) {
                    Toast.info('网站名称已存在')
                    return
                }

                if (res.code === 13) {
                    Toast.info('网站地址已存在')
                    return
                }

                Toast.info(res.msg)
                return
            }
        } else {
            const res = await dispatch.user.siteEditXhr({ ...edit, ...params })
            if (res.code !== 1) {
                if (res.code === 11) {
                    Toast.info('网站名称已存在')
                    return
                }

                if (res.code === 12) {
                    Toast.info('网站地址已存在')
                    return
                }
                Toast.info(res.msg)
                return
            }
        }

        clearForm()
        close()
    }, [clearForm, close, curChar, curIconBgColor, curIconType, curLevel.value, dispatch.user, edit, iconImg.blob, iconImg.url, introInput, levelId, nameInput, sites, urlInput])

    // 一键获取网站信息
    const oneKeyGetSiteInfo = useCallback(() => {
        (async () => {
            const url = trim(urlInput)
            if (!isUrl(url) && url.indexOf('internal://') === -1 && url.indexOf('chrome://') === -1) {
                setUrlErr('请输入正确的网址')
                return
            }

            const res = await dispatch.user.getSiteInfo({ url: decodeURIComponent(url) })
            if (res.code !== 1) {
                if (res.code === 11) {
                    setUrlErr('由于不可控因素获取失败，请手动录入')
                    return
                }

                setUrlErr(res.msg)
                return
            }

            setUrlErr(null)
            const data = res.data
            setIntroInput(data.description)
            setCurChar(getFirstChar(data.title))
            setNameInput(data.title)
            setCurIconBgColor(data.background)
            setCurIconType(iconType[2])
            setIconImg({
                url: data.icon,
                blob: null
            })
        })().catch(function (err) {
            console.error(err)
            setUrlErr('一键获取信息失败，请重试或手动添加')
        })
    }, [dispatch.user, urlInput])

    // 是否显示一键获取提示信息
    const [onekeyTipsShow, setOnekeyTipsShow] = useState(false)

    // 变量判断---默认背景颜色:文字黑色，图标黑色；选择了背景颜色: 文字白色，图标白色
    const curCharColor = curIconBgColor ? { color: '#fff' } : {}
    const curLogo = curIconBgColor ? logoWhite : logoBlack
    const iconBg = curIconBgColor ? { background: curIconBgColor } : {}

    return <Popup
        wrapperClassName="add-my-website-wrapper"
        className="add-my-website"
        close={() => {
            clearForm()
            close()
        }}
        show={show}>
        <h3 className="add-my-website-title">{edit ? '编辑' : '添加'}网址</h3>
        <div className="add-my-website-content">
            <div className="site-info" style={{ display: cropImg ? 'none' : 'block' }}>
                <BlockOnPopup>
                    <FormItemButton title="添加到分类">
                        <FormSelect
                            defaultValue={curLevel}
                            options={levelOptions}
                            onChange={(val) => setCurLevel(val)}
                        />
                    </FormItemButton>
                </BlockOnPopup>
                <BlockOnPopup>
                    <FormItem
                        title="地址"
                        error={urlErr}>
                        <div className="onekey-info">
                            <div className="onekey-info-input">
                                <input
                                    value={urlInput}
                                    placeholder="https://"
                                    onChange={(event) => {
                                        setUrlErr(null)
                                        setUrlInput(trim(event.target.value))
                                    }}
                                />
                                <span
                                    onMouseEnter={() => setOnekeyTipsShow(true)}
                                    onMouseLeave={() => setOnekeyTipsShow(false)}
                                    className="iconfont"
                                >&#xe881;</span>
                                <div
                                    className="onekey-tips"
                                    style={{ display: onekeyTipsShow ? 'block' : 'none' }}>
                                由于网络、目标网站权限等不可控因素会导致：获取失败或信息不全，请手动录入剩余信息；<br/>
                                由于各家网站技术不同，图标清晰度会不尽相同；
                                </div>
                            </div>
                            <Button onClick={oneKeyGetSiteInfo}>一键获取</Button>
                        </div>
                    </FormItem>
                    <FormItem
                        defaultValue={nameInput}
                        title="名称"
                        placeholder="网站名称"
                        onChange={(event) => {
                            setNameErr(null)
                            setNameInput(trim(event.target.value))
                        }}
                        error={nameErr}
                    />
                    <FormItem
                        title="描述">
                        <textarea
                            className="site-intro"
                            value={introInput}
                            placeholder="网站描述"
                            onChange={(event) => {
                                setIntroInput(trim(event.target.value))
                            }}
                        />
                    </FormItem>
                </BlockOnPopup>
            </div>
            <div className="cropper-wrapper" style={{ display: cropImg ? 'block' : 'none' }}>
                <BlockOnPopup className="image-cropper">
                    <ImageCropper image={cropImg} onComplete={blob => {
                        window.URL.revokeObjectURL(iconImg.url)
                        setIconImg({
                            url: window.URL.createObjectURL(blob),
                            blob
                        })
                    }} />
                </BlockOnPopup>
                <div className="sure-cropper">
                    <Button onClick={uploadIcon}>确认</Button>
                    <Button type="grey" onClick={() => {
                        iconUpload.current.value = ''
                        setCropImg(null)
                        setIconImg({ url: null, blob: null })
                    }}>取消</Button>
                </div>
            </div>
            <div className="site-icon">
                <div className="icon-preview block-on-popup">
                    <h4>预览</h4>
                    <ul>
                        <li
                            onClick={() => {
                                setCurIconType(iconType[0])
                                iconUpload.current.value = ''
                            }}>
                            <div
                                style={{ ...iconBg }}
                                className={`icon-item official ${curIconType === iconType[0] ? 'active' : ''}`}>
                                <img
                                    style={(edit && edit.officialIcon) ? { height: '100%', width: '100%' } : {}}
                                    src={(edit && edit.officialIcon) ? `${staticDomain}${edit.officialIcon}` : curLogo}
                                    alt="哆咪"
                                />
                            </div>
                            <p>官方</p>
                        </li>
                        <li
                            onClick={() => {
                                setCurIconType(iconType[1])
                                iconUpload.current.value = ''

                                if (!nameInput) return
                                setCurChar(getFirstChar(nameInput))
                            }}>
                            <div
                                style={{ ...iconBg, ...curCharColor }}
                                className={`icon-item character ${curIconType === iconType[1] ? 'active' : ''}`}>
                                {curChar || 'D'}
                            </div>
                            <p>文字</p>
                        </li>
                        <li
                            className={curIconType === iconType[2] ? 'active' : ''}
                            onClick={() => setCurIconType(iconType[2])}>
                            <div
                                style={{ ...iconBg, ...curCharColor }}
                                className={`icon-item image ${curIconType === iconType[2] ? 'active' : ''}`}>
                                {iconImg.url
                                    ? <img
                                        crossOrigin="true"
                                        id="imgMineUpload"
                                        src={iconImg.url.indexOf('blob:') > -1 ? iconImg.url : `${staticDomain}${iconImg.url}`}
                                        alt="Icon"
                                    />
                                    : <span className="iconfont">&#xe88a;</span>}
                                <input ref={iconUpload} type="file" accept="image/*" onChange={onSelectFile}/>
                            </div>
                            <p>上传</p>
                        </li>
                    </ul>
                </div>
                <BlockOnPopup style={{ display: curIconType === iconType[1] ? 'block' : 'none' }}>
                    <FormItem
                        onChange={(event) => {
                            setCurChar(event.target.value)
                            setCharErr(null)
                        }}
                        defaultValue={curChar}
                        title="图标文字"
                        placeholder="图标文字"
                        error={charErr}
                    />
                </BlockOnPopup>
                <BlockOnPopup>
                    <FormItem title="背景颜色">
                        <div className="color-piker">
                            <ColorPicker defaultValue={curIconBgColor} onChange={(val) => {
                                setCurIconBgColor(val)
                            }}/>
                            {useMemo(() => <SliderPicker
                                color={curIconBgColor || 'transparent'}
                                onChange={(color) => {
                                    setCurIconBgColor(color && color.hex)
                                }}
                            />, [curIconBgColor])}
                        </div>
                    </FormItem>
                </BlockOnPopup>
            </div>
        </div>
        <div className="sure-add-website">
            <Button onClick={addEditSure}>确认</Button>
            <Button type="grey" onClick={() => {
                clearForm()
                close()
            }}>取消</Button>
            <Button type="grey" onClick={() => {
                searchAdd()
                close()
            }}>官方添加</Button>
        </div>
    </Popup>
}
