import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import './index.scss'

import Popup from '../../../components/Popup'
import { trim } from '../../../public/js'
import FormItem from '../../../components/FormItem'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import { useCallbackAsync } from '../../../public/hooks'

const icons = ['&#xe6b8;', '&#xe669;', '&#xe665;', '&#xe66b;', '&#xe6b2;', '&#xe734;', '&#xe741;',
    '&#xe742;', '&#xe7e4;', '&#xe759;', '&#xe7cd;', '&#xe7ff;', '&#xe888;', '&#xe7f2;', '&#xe86f;', '&#xe699;']
export default ({ show, close, edit, swiper }) => {
    const dispatch = useDispatch()
    const { levels } = useSelector((state) => ({
        levels: state.user.levels
    }))

    const [error, setError] = useState(null)
    const [curIcon, setCurIcon] = useState(icons[0])
    const [nameInput, setNameInput] = useState(null)
    const [sortInput, setSortInput] = useState(1)
    const [sortMinMax, setSortMinMax] = useState({
        min: 1,
        max: 1
    })

    // 清空表单
    const clearForm = useCallback(() => {
        setCurIcon(icons[0])
        setNameInput('')
        setError(null)

        if (levels.length === 0) return
        setSortMinMax({
            min: levels[0].sort,
            max: levels[levels.length - 1].sort
        })
    }, [levels])

    // 编辑初始化值
    useEffect(() => {
        if (edit && show) {
            setCurIcon(edit.icon)
            setNameInput(edit.name)
            setSortInput(edit.sort)
        } else {
            clearForm()
        }
    }, [clearForm, edit, show])

    // 确认编辑或添加
    const [curAddParams, setCurAddParams] = useState(null)
    const addEditSure = useCallbackAsync(async () => {
        const name = trim(nameInput || '')
        if (name === '') {
            setError('名称为必填项')
            return
        }

        const params = {
            name,
            icon: curIcon
        }

        if (!edit) {
            const res = await dispatch.user.levelAddXhr(params)
            if (res.code !== 1) {
                if (res.code === 12) {
                    Toast.info('分类已存在')
                    return
                }

                Toast.info(res.msg)
                return
            }

            setCurAddParams(params)
        } else {
            params.sort = sortInput
            const res = await dispatch.user.levelEditXhr({ ...edit, ...params })
            if (res.code !== 1) {
                if (res.code === 11) {
                    Toast.info('分类已存在')
                    return
                }

                Toast.info(res.msg)
            }
        }
        clearForm()
        close()
    }, [clearForm, close, curIcon, dispatch.user, edit, nameInput, sortInput])

    // 添加完成后设置为，当前添加的分组
    useEffect(() => {
        if (!curAddParams) return
        if (Array.isArray(levels)) {
            for (let key in levels) {
                const val = levels[key]
                if (val.name === curAddParams.name && val.icon === curAddParams.icon) {
                    dispatch.user.setCurlevel(val._id)
                    swiper && swiper.slideTo(key, 0, false)
                    break
                }
            }
        }
    }, [curAddParams, dispatch.user, levels, swiper])

    return <Popup className="add-group-name" close={() => {
        clearForm()
        close()
    }} show={show}>
        <h3>{edit ? '编辑' : '添加'}分组</h3>
        <h4>图标</h4>
        <div className="add-title-icon">
            {icons.map(function (item, index) {
                return <span
                    key={index}
                    onClick={() => setCurIcon(item)}
                    className={`title-icon iconfont ${curIcon === item ? 'active' : ''}`}
                    dangerouslySetInnerHTML={{ __html: item }}>
                </span>
            })}
        </div>
        <div className="add-level-item">
            <h4>名称</h4>
            <FormItem
                onChange={(event) => {
                    setError(null)
                    setNameInput(trim(event.target.value))
                }}
                className="add-title-input"
                defaultValue={nameInput}
                error={error}
                placeholder="名称"
            />
        </div>
        <div className="add-level-item" style={{ display: edit ? 'block' : 'none' }}>
            <h4>排序</h4>
            <FormItem
                childType="number"
                onChange={(event) => {
                    let val = parseInt(trim(event.target.value))
                    if (val < sortMinMax.min) val = sortMinMax.min
                    if (val > sortMinMax.max) val = sortMinMax.max
                    document.querySelector('.add-level-sort').children[0].value = val
                    setSortInput(val)
                }}
                className="add-title-input add-level-sort"
                defaultValue={sortInput}
                placeholder="排序"
            />
        </div>

        <div className="sure-btn">
            <Button
                onClick={addEditSure}>
                确认
            </Button>
            <Button
                type="grey"
                onClick={() => {
                    clearForm()
                    close()
                }}>
                    取消
            </Button>
        </div>
    </Popup>
}
