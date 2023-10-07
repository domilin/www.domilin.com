import React, { useEffect } from 'react'
import './index.scss'
import Signin from './Signin'
import ForgetPsd from './ForgetPsd'
import Signup from './Signup'

const cavasBg = () => {
    const canvas = document.getElementById('waveBg')
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentNode.offsetWidth
    canvas.height = canvas.parentNode.offsetHeight

    // 如果浏览器支持requestAnimFrame则使用requestAnimFrame否则使用setTimeout
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60)
                }
    })()
    // 初始角度为0
    let step = 0
    // 定义三条不同波浪的颜色
    const lines = ['#eff0f2',
        '#f6f2f1',
        '#f1f1f1']
    function loop () {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        step++
        // 画3个不同颜色的矩形
        for (let j = lines.length - 1; j >= 0; j--) {
            ctx.fillStyle = lines[j]
            // 每个矩形的角度都不同，每个之间相差45度
            const angle = (step + j * 45) * Math.PI / 180
            const deltaHeight = Math.sin(angle) * 50
            const deltaHeightRight = Math.cos(angle) * 50
            ctx.beginPath()
            ctx.moveTo(0, canvas.height / 2 + deltaHeight)
            ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2 + deltaHeight - 50, canvas.width / 2, canvas.height / 2 + deltaHeightRight - 50, canvas.width, canvas.height / 2 + deltaHeightRight)
            ctx.lineTo(canvas.width, canvas.height)
            ctx.lineTo(0, canvas.height)
            ctx.lineTo(0, canvas.height / 2 + deltaHeight)
            ctx.closePath()
            ctx.fill()
        }
        window.requestAnimFrame(loop)
    }
    loop()
}
export default ({ match }) => {
    const loginType = match.params.type
    useEffect(() => {
        cavasBg()
    }, [])
    return <div className="signin-wrapper">
        <canvas id="waveBg" className="wave-bg"></canvas>
        {loginType === 'signin' && <Signin/>}
        {loginType === 'signup' && <Signup/>}
        {loginType === 'forgetpsd' && <ForgetPsd/>}
    </div>
}
