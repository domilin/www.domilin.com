import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'

import BlockOnPopup from '../../../BlockOnPopup'
import FormItem from '../../../FormItem'
import Button from '../../../Button'
import EmailCode from '../../../../containers/Login/EmailCode'
import { trim, isEmail, cookiesName } from '../../../../public/js'
import Toast from '../../../Toast'
import { useCallbackAsync } from '../../../../public/hooks'

export default ({ setModifyType, show }) => {
    const dispatch = useDispatch()
    const [emailInput, setEmailInput] = useState('')
    const emailCode = useRef()

    const bindEmailHandle = useCallbackAsync(async () => {
        if (!isEmail(emailInput)) {
            Toast.info('请输入正确的邮箱')
            return
        }

        const codeVal = trim(emailCode.current.value)
        if (codeVal === '') {
            Toast.info('请输入验证码')
            return
        }

        const uuidKey = Cookies.get(cookiesName.uuidkey)
        const res = await dispatch.public.bindEmail({
            email: emailInput,
            emailCode: codeVal,
            uuidKey
        })
        if (res.code !== 1) {
            if (res.code === 12) {
                Toast.info('邮箱已被使用，请注销找回密码')
                return
            }
            if (res.code === 13) {
                Toast.info('邮箱验证码已失效')
                return
            }
            if (res.code === 14) {
                Toast.info('邮箱验证码已错误')
                return
            }
            Toast.info(res.msg)
            return
        }

        Toast.info('绑定成功')
        dispatch.public.settingData({
            email: emailInput
        })
        setEmailInput('')
        emailCode.current.value = ''
    }, [dispatch.public, emailInput])

    return <BlockOnPopup title="绑定邮箱" style={{ display: show ? 'block' : 'none' }}>
        <FormItem
            defaultValue={emailInput}
            onChange={(event) => setEmailInput(trim(event.target.value))}
            childType="email"
            title="邮箱"
            placeholder="请输入邮箱"
        />
        <FormItem className="email-code" title="邮箱验证码">
            <input ref={emailCode} placeholder="邮箱验证码"></input>
            <EmailCode email={emailInput}/>
        </FormItem>
        <div className="setting-func">
            <Button onClick={bindEmailHandle}>确认</Button>
            <Button onClick={() => {
                setModifyType(null)
                setEmailInput('')
                emailCode.current.value = ''
            }} type="grey">取消</Button>
        </div>
    </BlockOnPopup>
}
