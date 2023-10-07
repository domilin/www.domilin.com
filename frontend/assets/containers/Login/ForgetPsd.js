import React, { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'

import { trim, isEmail, isPsd, cookiesName } from '../../public/js/index'
import { useCallbackAsync } from '../../public/hooks'
import Toast from '../../components/Toast'
import ErrorTips from './ErrorTips'
import GraphCode from './GraphCode'
import EmailCode from './EmailCode'

export default () => {
    const dispatch = useDispatch()
    const [psdHide, setPsdHide] = useState(true)
    const [emailValue, setEmailValue] = useState(null)
    const [emailErrTips, setEmailErrTips] = useState(null)
    const [emailCodeErrTips, setEmailCodeErrTips] = useState(null)
    const [graphErrTips, setGraphErrTips] = useState(null)
    const [psdErrTips, setPsdErrTips] = useState(null)
    const email = useRef()
    const emailCode = useRef()
    const psd = useRef()
    const graph = useRef()
    const submitHandle = useCallbackAsync(async () => {
        const emailVal = trim(email.current.value)
        const emailCodeVal = trim(emailCode.current.value)
        const psdVal = trim(psd.current.value)
        const graphVal = trim(graph.current.value)

        if (!isEmail(emailVal)) {
            setEmailErrTips('邮箱格式不正确')
            return
        }

        if (!emailCodeVal || emailCodeVal.length !== 4) {
            setEmailCodeErrTips('请输入4位字符邮箱验证码')
            return
        }

        if (!isPsd(psdVal)) {
            setPsdErrTips('密码为6-16位包含大小写字母和数字的字符')
            return
        }

        if (!graphVal) {
            setGraphErrTips('请输入4位字符图形验证码')
            return
        }

        const { encodePassword } = require('../../public/js/indexBrowser')
        const params = {
            email: emailVal,
            password: encodePassword(psdVal),
            graphCode: graphVal,
            emailCode: emailCodeVal,
            uuidKey: Cookies.get(cookiesName.uuidkey)
        }

        let resData = { code: -100, msg: '' }
        resData = await dispatch.public.forgetPsd(params).catch(function (err) {
            console.error(err)
            Toast.error('修改密码错误')
        })

        if (resData.code !== 1) {
            switch (resData.code) {
                case 11:
                    setEmailCodeErrTips('邮箱验证码过期')
                    break
                case 12:
                    setEmailCodeErrTips('邮箱验证码错误')
                    break
                case 13:
                    setGraphErrTips('图形验证码过期')
                    break
                case 14:
                    setGraphErrTips('图形验证码错误')
                    break
                case 16:
                    setEmailErrTips('邮箱绑定')
                    break
                default:
                    Toast.info(resData.msg)
            }
            return
        }

        // 密码设置完成，即刻登录
        const signinRes = await dispatch.public.signIn({
            userName: emailVal,
            password: encodePassword(psdVal)
        }).catch(function (err) {
            console.error(err)
            Toast.info('登录错误')
        })

        if (signinRes.code !== 1) {
            Toast.info(signinRes.msg)
            return
        }

        Toast.info('登录成功')
        window.location.href = '/'
    }, [dispatch.public])

    /** @desc 回车确认注册、找回密码 */
    useEffect(() => {
        window.onkeyup = function (event) {
            if (event.keyCode === 13) {
                submitHandle()
            }
        }
    }, [submitHandle])
    return <>
        <div className="sign-box">
            <div className="sign-content">
                <h3>找回密码</h3>
                <div className="item">
                    <ErrorTips errTips={emailErrTips}/>
                    <div className={`input ${emailErrTips ? 'error' : ''}`}>
                        <span className="iconfont">&#xe888;</span>
                        <input onChange={(event) => {
                            const val = trim(event.target.value)
                            setEmailValue(val)
                            if (!isEmail(val)) {
                                setEmailErrTips('邮箱格式不正确')
                            } else {
                                setEmailErrTips(null)
                            }
                        }} ref={email} type="text" name="email" placeholder="电子邮箱"/>
                    </div>
                </div>
                <div className="item eamil-validate">
                    <ErrorTips errTips={emailCodeErrTips}/>
                    <div className="input-wrapper">
                        <div className={`input ${emailCodeErrTips ? 'error' : ''}`}>
                            <span className="iconfont">&#xe769;</span>
                            <input onChange={(event) => {
                                const val = trim(event.target.value)
                                if (!val || val.length !== 4) {
                                    setEmailCodeErrTips('请输入4位字符邮箱验证码')
                                } else {
                                    setEmailCodeErrTips(null)
                                }
                            }} ref={emailCode} type="text" name="emailValidateCode" placeholder="邮箱验证码"/>
                        </div>
                        <EmailCode email={emailValue}/>
                    </div>
                </div>
                <div className="item password">
                    <ErrorTips errTips={psdErrTips}/>
                    <div className={`input ${psdErrTips ? 'error' : ''}`}>
                        <span className="iconfont">&#xe6c1;</span>
                        <input onChange={(event) => {
                            if (!isPsd(trim(event.target.value))) {
                                setPsdErrTips('密码为6-16位包含大小写字母和数字的字符')
                            } else {
                                setPsdErrTips(null)
                            }
                        }} ref={psd} type={psdHide ? 'password' : 'text'} name="password" placeholder="密码"/>
                        <em className="iconfont show-password" onClick={() => setPsdHide(!psdHide)}>&#xe7fe;</em>
                    </div>
                </div>
                <div className="item graph-validate">
                    <ErrorTips errTips={graphErrTips}/>
                    <div className="input-wrapper">
                        <div className={`input ${graphErrTips ? 'error' : ''}`}>
                            <span className="iconfont">&#xe769;</span>
                            <input onChange={(event) => {
                                const val = trim(event.target.value)
                                if (!val || val.length !== 4) {
                                    setGraphErrTips('请输入4位字符图形验证码')
                                } else {
                                    setGraphErrTips(null)
                                }
                            }} ref={graph} type="text" name="graph" placeholder="图形验证码"/>
                        </div>
                        <GraphCode/>
                    </div>
                </div>
                <div className="submit">
                    <button onClick={submitHandle}>确认</button>
                </div>
            </div>
        </div>
        <div className="sign-more">
            <a href="/login/signin">记得密码，即刻登录</a>
        </div>
    </>
}
