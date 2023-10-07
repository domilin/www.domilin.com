import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'

import Toast from '../../components/Toast'
import { cookiesName, isEmail } from '../../public/js'
import { useCallbackAsync } from '../../public/hooks'

export default ({ email }) => {
    const [time, setTime] = useState(null)
    const dispatch = useDispatch()
    const sendCode = useCallbackAsync(async () => {
        if (time) return
        if (!email) {
            Toast.info('请输入邮箱')
            return
        }

        if (!isEmail(email)) {
            Toast.info('邮箱格式不正确')
            return
        }

        const uuidKey = Cookies.get(cookiesName.uuidkey)
        const res = await dispatch.public.getEmailCode({ uuidKey, email })
        if (res.code !== 1) {
            Toast.info('获取邮箱验证码失败')
            return
        }
        Toast.info('邮箱验证码发送成功')
        !uuidKey && Cookies.set(cookiesName.uuidkey, res.data.uuidKey)
        let second = 60
        const timer = setInterval(function () {
            if (second > 0) {
                second--
                setTime(second)
            } else {
                clearInterval(timer)
                setTime(null)
            }
        }, 1000)
    }, [time, email, dispatch.public])
    return <div className="send-email-validate" onClick={sendCode}>{time ? `${time}S` : '发送验证码'}</div>
}
