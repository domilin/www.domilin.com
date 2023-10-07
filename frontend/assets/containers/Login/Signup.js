import React, { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { trim, isPsd, isUsername } from '../../public/js/index'
import { useCallbackAsync } from '../../public/hooks'
import Toast from '../../components/Toast'
import ErrorTips from './ErrorTips'

export default () => {
    const dispatch = useDispatch()
    const [psdHide, setPsdHide] = useState(true)
    const [psdErrTips, setPsdErrTips] = useState(null)
    const [userNameErrTips, setUserNameErrTips] = useState(null)
    const psd = useRef()
    const userName = useRef()
    const submitHandle = useCallbackAsync(async () => {
        const psdVal = trim(psd.current.value)
        const userNameVal = trim(userName.current.value)

        if (userNameVal === '' || userNameVal.length < 6 || userNameVal.length > 16) {
            setUserNameErrTips('请输入6-16字符用户名')
            return
        }

        if (!isUsername(userNameVal)) {
            setUserNameErrTips('用户名请勿包含中文或特殊字符')
            return
        }

        if (!isPsd(psdVal)) {
            setPsdErrTips('密码为6-16位包含大小写字母和数字的字符')
            return
        }

        const { encodePassword } = require('../../public/js/indexBrowser')
        const params = {
            userName: userNameVal,
            password: encodePassword(psdVal)
        }

        let resData = { code: -100, msg: '' }
        resData = await dispatch.public.signUp(params).catch(function (err) {
            console.error(err)
            Toast.error('注册错误')
        })

        if (resData.code !== 1) {
            switch (resData.code) {
                case 12:
                    setUserNameErrTips('用户名已存在')
                    break
                default:
                    Toast.info(resData.msg)
            }
            return
        }

        // 注册完即刻登录
        const signinRes = await dispatch.public.signIn({
            userName: userNameVal,
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

    /** @desc 回车确认注册 */
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
                <h3>注册一个账号以同步您的资料</h3>
                <div className="item user-name">
                    <ErrorTips errTips={userNameErrTips}/>
                    <div className={`input ${userNameErrTips ? 'error' : ''}`}>
                        <span className="iconfont">&#xe78b;</span>
                        <input onChange={(event) => {
                            const val = trim(event.target.value)
                            if (val === '' || val.length < 6 || val.length > 16) {
                                setUserNameErrTips('请输入6-16字符用户名')
                            } else if (!isUsername(val)) {
                                setUserNameErrTips('用户名请勿包含中文或特殊字符')
                            } else {
                                setUserNameErrTips(null)
                            }
                        }} ref={userName} type="text" name="userName" placeholder="用户名"/>
                    </div>
                </div>
                <div className="item password">
                    <ErrorTips errTips={psdErrTips}/>
                    <div className={`input ${psdErrTips ? 'error' : ''}`}>
                        <span className="iconfont">&#xe6c1;</span>
                        <input
                            onChange={(event) => {
                                if (!isPsd(trim(event.target.value))) {
                                    setPsdErrTips('密码为6-16位包含大小写字母和数字的字符')
                                } else {
                                    setPsdErrTips(null)
                                }
                            }}
                            ref={psd}
                            type={psdHide ? 'password' : 'text'}
                            name="password"
                            placeholder="密码"
                        />
                        <em className="iconfont show-password" onClick={() => setPsdHide(!psdHide)}>&#xe7fe;</em>
                    </div>
                </div>
                <div className="submit">
                    <button onClick={submitHandle}>注册</button>
                </div>
            </div>
        </div>
        <div className="sign-more">
            <a href="/login/signin">已有账户，即刻登录</a>
        </div>
    </>
}
