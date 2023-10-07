import React, { useState, useEffect, useCallback, useRef } from 'react'

import './index.scss'
import Toast from '../../../../../Toast'
import { encodeSearchKey, loadImage } from '../../../../../../public/js'

const TreeFolder = ({
    curCheckClick,
    item,
    checkedParent,
    setCheckedParent
}) => {
    /** ---------------------------组件本身-------------------------- */
    const [open, setOpen] = useState(false)
    const [checked, setChecked] = useState(checkedParent)
    const [childCheckedNum, setChildCheckedNum] = useState(
        checkedParent
            ? item.children.length
            : 0
    )

    /** ---------------------------作为子组件-------------------------- */
    // 跟随父组件选择状态
    useEffect(() => {
        setChecked(checkedParent)
    }, [checkedParent])

    /** ---------------------------作为父组件-------------------------- */
    // 子组件已选择数量跟子组件数量相同时，此组件为选择状态
    useEffect(() => {
        if (childCheckedNum === item.children.length) setChecked(true)

        if (childCheckedNum === 0) setChecked(false)
    }, [childCheckedNum, item.children.length])
    return <div className="bookmark-tree-children">
        <div
            className="bookmark-tree-folder"
            onClick={() => setOpen(!open)}>
            <span
                className="iconfont checkbox-icon"
                dangerouslySetInnerHTML={{ __html: checked ? '&#xee27;' : '&#xe623;' }}
                onClick={(event) => {
                    event.stopPropagation()

                    const checkTemp = !checked
                    /** ---------------------------组件本身-------------------------- */
                    setChecked(checkTemp)

                    /** ---------------------------作为父组件-------------------------- */
                    // 当前是否被选择：表明所有子tree是否全部选择（已被选中的子tree恢复对应的默认值，目的是再次点击子tree时加减的基数正确）
                    if (checkTemp) {
                        setChildCheckedNum(item.children.length)
                    } else {
                        setChildCheckedNum(0)
                    }

                    /** ---------------------------作为子组件-------------------------- */
                    // 操作父组件的子tree已选择个数
                    if (setCheckedParent) setCheckedParent(checkTemp)

                    /** ---------------------------是否被选中-------------------------- */
                    const checkedKeysArrTemp = []
                    const getKeys = (arr) => {
                        for (const val of arr) {
                            if (val.children) {
                                getKeys(val.children)
                            } else {
                                checkedKeysArrTemp.push(val)
                            }
                        }
                    }
                    getKeys(item.children)
                    curCheckClick({
                        checked: checkTemp,
                        checkArr: checkedKeysArrTemp
                    })
                }}
            />
            <span
                className="iconfont foloder-icon"
                dangerouslySetInnerHTML={{ __html: open ? '&#xe6f0;' : '&#xe650;' }}
            />
            <em>{item.title}</em>
        </div>
        {open && treeCallback({
            curCheckClick,
            checked,
            children: item.children,
            setCheckedParent: (isChecked) => {
                if (isChecked) {
                    setChildCheckedNum(childCheckedNum + 1)
                } else {
                    setChildCheckedNum(childCheckedNum - 1)
                }
            }
        })}
    </div>
}
const TreeItem = ({
    curCheckClick,
    item,
    checkedParent,
    setCheckedParent
}) => {
    const [checked, setChecked] = useState(checkedParent)
    // 跟随父组件选择状态
    useEffect(() => {
        setChecked(checkedParent)
    }, [checkedParent])

    const itemChecked = useCallback(() => {
        const checkTemp = !checked
        setChecked(checkTemp)
        if (setCheckedParent) setCheckedParent(checkTemp)

        // 是否被选中
        if (curCheckClick) {
            curCheckClick({
                checked: checkTemp,
                checkArr: [{ ...item }]
            })
        }
    }, [checked, curCheckClick, item, setCheckedParent])

    // 图标是否加载完成
    const [imgLoaded, setImgLoaded] = useState(false)
    const imgSrc = useRef(decodeURIComponent(`https://www.google.com/s2/favicons?domain=${encodeSearchKey(item.url)}`))
    useEffect(() => {
        loadImage(imgSrc.current, function () {
            setImgLoaded(true)
        })
    }, [])
    return <div className="bookmark-tree-item">
        <span
            className="iconfont checkbox-icon"
            dangerouslySetInnerHTML={{ __html: checked ? '&#xee27;' : '&#xe623;' }}
            onClick={itemChecked}
        />
        {(imgLoaded && item.url)
            ? <span className="bookmark-icon">
                <img src={imgSrc.current}/>
            </span>
            : <span className="iconfont bookmark-icon network-icon">&#xe77a;</span>}
        <a title={item.title} href={item.url} target="_blank">{item.title}</a>
    </div>
}
const treeCallback = ({
    curCheckClick,
    children,
    checked,
    setCheckedParent
}) => {
    return Array.isArray(children) && children.map((item, index) => {
        if (item.children) {
            return <TreeFolder key={item.id} {...{
                curCheckClick,
                item,
                setCheckedParent,
                checkedParent: checked,
                key: item.id
            }}/>
        } else {
            return <TreeItem {...{
                curCheckClick,
                item,
                checkedParent: checked,
                setCheckedParent,
                key: item.id
            }}/>
        }
    })
}
export default ({ onCheckedKeys }) => {
    const [data, setData] = useState([])
    const [checkedKeys, setCheckedKeys] = useState([])

    useEffect(() => {
        if (onCheckedKeys) onCheckedKeys(checkedKeys)
    }, [checkedKeys, onCheckedKeys])

    // 添加或删除checkedKeys中的keys
    const curCheckClick = useCallback(({ checked, checkArr }) => {
        if (typeof checked !== 'boolean' || !Array.isArray(checkArr)) return
        let keysTemp = checkedKeys
        if (checked) {
            for (const val of checkArr) {
                let isExist = false
                for (const valIn of checkedKeys) {
                    if (valIn.id !== val.id) continue
                    isExist = true
                    break
                }
                if (!isExist) keysTemp.push(val)
            }
        } else {
            keysTemp = checkedKeys.filter((currentValue, index, arr) => {
                let isExist = false
                for (const val of checkArr) {
                    if (currentValue.id !== val.id) continue
                    isExist = true
                    break
                }
                return !isExist
            })
        }
        setCheckedKeys(JSON.parse(JSON.stringify(keysTemp)))
    }, [checkedKeys])

    useEffect(() => {
        if (!chrome.bookmarks) {
            Toast.error('暂无书签权限')
            return
        }
        chrome && chrome.bookmarks && chrome.bookmarks.getTree(res => {
            setData(
                (Array.isArray(res) &&
                res.length > 0 &&
                Array.isArray(res[0].children) &&
                res[0].children) || []
            )
        })
    }, [])
    return <div className="bookmark-tree-wrapper">
        {treeCallback({ children: data, curCheckClick })}
    </div>
}
