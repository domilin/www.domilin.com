import React, { forwardRef, useState, useEffect } from 'react'

import { isPc, uuid } from '../../public/js'

// 新增自定义事件：onInputValue，onEnterKeyUp
export default forwardRef((props, ref) => {
    // ---------------------------移动端不阻止记住密码,会导致不弹出键盘
    const [inputId, setInputId] = useState(null)
    useEffect(() => {
        // 防止服务端与客户端不一致，客户端生成uuid
        setInputId(uuid())
    }, [])
    // 移动端不设置readonly属性，会导致不弹出输入框
    useEffect(() => {
        if (!inputId) return
        if (isPc()) return
        const $input = document.querySelector(`.domilin-pure-input-${inputId}`)
        $input.removeAttribute('readonly')
    }, [inputId])

    // ---------------------------------input 中文输入防抖
    const [lock, setLock] = useState(false)
    const [lockTimer, setLockTimer] = useState(null)

    const inputProps = {}

    // 去除自定义事件：onInputValue，onEnterKeyUp
    props && Object.keys(props).map(function (item, index) {
        if (item === 'onInputValue' || item === 'onEnterKeyUp') return
        inputProps[item] = props[item]
    })

    const propsReWrite = {
        type: 'text',
        name: 'nomatch',
        ...inputProps,
        autoComplete: 'off',
        ref: ref,
        readOnly: true,
        className: `domilin-pure-input-${inputId || ''} ${props.className || ''}`,
        ...{
            /* ---------------------中文防抖--------------------- */
            onCompositionStart: () => {
                setLock(true)
                if (lockTimer) clearTimeout(lockTimer)
            },
            onCompositionEnd: (event) => {
                // 中文输入法‘end’结束，在keyUp之后执行，用户keyUp判断是否中文输入完成
                const value = event.target.value
                if (value === '') event.target.setAttribute('readonly', true) // 删除为空字符时防止弹出浏览器默认账号密码选择框

                setLockTimer(
                    setTimeout(function () {
                        const $input = document.querySelector(`.domilin-pure-input-${inputId}`)
                        $input.removeAttribute('readonly') // 删除为空字符时防止弹出浏览器默认账号密码选择框

                        setLock(false)
                        if (props.onInputValue) props.onInputValue(value) // 此处设置val
                    }, 200)
                )
            },
            onInput: (event) => {
                if (props.onInput) props.onInput(event)

                if (lock) return
                if (props.onInputValue) props.onInputValue(event.target.value) // 此处设置val
            },
            onKeyUp: (event) => {
                if (props.onKeyUp) props.onKeyUp(event)

                if (event && event.type === 'keyup' && event.keyCode !== 13) return
                if (lock) {
                    setLock(false)
                    return
                }
                if (props.onEnterKeyUp) props.onEnterKeyUp(event.target.value)
            },

            /* ---------------------不记录账号密码--------------------- */
            // 监听键盘输入事件
            // 当keyCode=8(backspace键) 和 keyCode=46(delete键)按下的时候，判断只剩下最后一个字符的时候阻止按键默认事件，自己清空输入框
            // 当keyCode=8(backspace键) 和 keyCode=46(delete键)按下的时候，判断如果处于全选状态，就阻止按键默认事件，自己清空输入框
            // 这种用来避免删除最后一个字符完后出现下拉用户密码清单的框
            onKeyDown: (event) => {
                if (props.onKeyDown) props.onKeyDown(event)

                var keyCode = event.keyCode
                if (keyCode === 8 || keyCode === 46) {
                    // backspace 和delete
                    var len = event.target.value.length
                    if (len === 1) {
                        event.target.value = ''
                        if (props.onChange) props.onChange(event)
                        return false
                    }
                    if (event.target.selectionStart === 0 && event.target.selectionEnd === len) {
                        event.target.value = ''
                        if (props.onChange) props.onChange(event)
                        return false
                    }
                }
                return true
            },
            // 失去焦点立马更新为只读
            onBlur: (event) => {
                if (props.onBlur) props.onBlur(event)

                if (!isPc()) return
                event.target.setAttribute('readonly', true)
            },
            // 用来阻止第二次或更多次点击密码输入框时下拉用户密码清单的框一闪而过的问题
            onMouseDown: (event) => {
                if (props.onMouseDown) props.onMouseDown(event)

                event.target.blur()
                event.target.focus()
            },
            // 点击时focus
            onClick: (event) => {
                if (props.onClick) props.onClick(event)

                event.target.removeAttribute('readonly')
                event.target.focus()
            }
        }
    }
    return <>
    <input {...propsReWrite} />
    </>
})
