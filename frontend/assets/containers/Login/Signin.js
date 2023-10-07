import React, { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { trim, isPsd } from '../../public/js/index'
import { useCallbackAsync } from '../../public/hooks'
import Toast from '../../components/Toast'
import ErrorTips from './ErrorTips'

export default () => {
    const dispatch = useDispatch()
    const [psdHide, setPsdHide] = useState(true)
    const [userNameErrTips, setUserNameErrTips] = useState(null)
    const [psdErrTips, setPsdErrTips] = useState(null)
    const userName = useRef()
    const psd = useRef()
    const submitHandle = useCallbackAsync(async () => {
        const userNameVal = trim(userName.current.value)
        const psdVal = trim(psd.current.value)

        if (userNameVal === '') {
            setUserNameErrTips('请输入用户名或邮箱')
            return
        }

        if (!isPsd(psdVal)) {
            setPsdErrTips('密码为6-16位包含大小写字母和数字的字符')
            return
        }

        const { encodePassword } = require('../../public/js/indexBrowser')
        const res = await dispatch.public.signIn({
            userName: userNameVal,
            password: encodePassword(psdVal)
        }).catch(function (err) {
            console.error(err)
            Toast.error('登录错误')
        })
        if (res.code !== 1) {
            switch (res.code) {
                case 11:
                    setUserNameErrTips('用户名或邮箱不存在')
                    break
                case 12:
                    setPsdErrTips('密码不正确')
                    break
                default:
                    Toast.info(res.msg)
            }
            return
        }
        window.location.href = '/'
    }, [dispatch.public])

    /** @desc 回车确认登录 */
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
                <h3>欢迎回来</h3>
                <div className="item user-name">
                    <ErrorTips errTips={userNameErrTips}/>
                    <div className={`input ${userNameErrTips ? 'error' : ''}`}>
                        <span className="iconfont">&#xe78b;</span>
                        <input onChange={(event) => {
                            const val = trim(event.target.value)
                            if (val === '') {
                                setUserNameErrTips('请输入用户名或邮箱')
                            } else {
                                setUserNameErrTips(null)
                            }
                        }} ref={userName} type="text" name="userName" placeholder="用户名/邮箱"/>
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
                    <div className="tips">
                        <a href="/login/forgetpsd">忘记密码?</a>
                    </div>
                </div>
                <div className="submit">
                    <button onClick={submitHandle}>登录</button>
                </div>
            </div>
        </div>
        <div className="sign-more">
            <a href="/login/signup">没有账户，即刻注册</a>
            <a className="go-home" href="/">保持登出</a>
        </div>
    </>
}
