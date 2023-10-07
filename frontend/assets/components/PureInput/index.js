import React, { forwardRef, useState } from 'react'

// 新增自定义事件：onInputValue，onEnterKeyUp
export default forwardRef((props, ref) => {
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
        autoComplete: 'new-password',
        ref: ref,
        className: props.className || '',
        ...{
            /* ---------------------中文防抖--------------------- */
            onCompositionStart: () => {
                setLock(true)
                if (lockTimer) clearTimeout(lockTimer)
            },
            onCompositionEnd: (event) => {
                // 中文输入法‘end’结束，在keyUp之后执行，用户keyUp判断是否中文输入完成
                const value = event.target.value

                setLockTimer(
                    setTimeout(function () {
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
            }
        }
    }
    return <>
    <input {...propsReWrite} />
    </>
})
