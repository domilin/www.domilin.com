import React, { useState, useEffect } from 'react'
import { bool, func } from 'prop-types'
import { isPc, windowOffset } from '../../public/js'

import './index.scss'

const ImgPopup = (props) => {
    const { src, show, close } = props

    const [imgShow, setImgShow] = useState(false)
    const [imgStyle, setImgStyle] = useState({
        height: 'auto',
        width: '100%'
    })

    useEffect(() => {
        if (!src) return
        const imgTemp = new Image()
        imgTemp.src = src
        imgTemp.onload = function () {
            const ih = imgTemp.height
            const iw = imgTemp.width
            if (isPc()) {
                if (iw >= ih && ((iw >= 1000 && ih * 1000 / iw <= 600) || (iw < 1000 && ih <= 600))) {
                    setImgStyle({
                        height: 'auto',
                        maxWidth: '1000px'
                    })
                } else {
                    setImgStyle({
                        maxHeight: '600px',
                        width: 'auto'
                    })
                }
            } else {
                const wh = windowOffset().height * 0.8
                const ww = windowOffset().width
                if ((iw >= ww && ih * ww / iw <= wh) || (iw < ww && ih <= wh)) {
                    setImgStyle({
                        height: 'auto',
                        width: '100%'
                    })
                } else {
                    setImgStyle({
                        height: wh,
                        width: 'auto'
                    })
                }
            }

            setImgShow(true)
        }
    }, [src])

    const [equipment, setEquipment] = useState('pc')
    useEffect(() => {
        if (isPc()) return
        setEquipment('phone')
        const Hammer = require('hammerjs')

        const $ele = document.getElementById('imgPopContent')
        const hammertime = new Hammer($ele, {})
        hammertime.get('pinch').set({
            enable: true
        })
        let posX = 0
        let posY = 0
        let scale = 1
        let lastScale = 1
        let lastPosX = 0
        let lastPosY = 0
        let maxPosX = 0
        let maxPosY = 0
        let transform = ''
        const el = $ele

        hammertime.on('doubletap pan pinch panend pinchend', function (ev) {
            if (ev.type === 'doubletap') {
                transform = 'translate3d(0, 0, 0) scale3d(2, 2, 1)'
                scale = 2
                lastScale = 2
                try {
                    if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() !== 'matrix(1, 0, 0, 1, 0, 0)') {
                        transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
                        scale = 1
                        lastScale = 1
                    }
                } catch (err) {
                    console.error(err)
                }
                el.style.webkitTransform = transform
                transform = ''
            }

            // pan
            if (scale !== 1) {
                posX = lastPosX + ev.deltaX
                posY = lastPosY + ev.deltaY
                maxPosX = Math.ceil((scale - 1) * el.clientWidth / 2)
                maxPosY = Math.ceil((scale - 1) * el.clientHeight / 2)
                if (posX > maxPosX) posX = maxPosX
                if (posX < -maxPosX) posX = -maxPosX
                if (posY > maxPosY) posY = maxPosY
                if (posY < -maxPosY) posY = -maxPosY
            }

            // pinch
            if (ev.type === 'pinch') scale = Math.max(0.999, Math.min(lastScale * (ev.scale), 4))
            if (ev.type === 'pinchend') lastScale = scale

            // panend
            if (ev.type === 'panend') {
                lastPosX = posX < maxPosX ? posX : maxPosX
                lastPosY = posY < maxPosY ? posY : maxPosY
            }

            if (scale !== 1) transform = 'translate3d(' + posX + 'px,' + posY + 'px, 0) ' + 'scale3d(' + scale + ', ' + scale + ', 1)'
            if (transform) el.style.webkitTransform = transform
        })
    }, [])

    return <div className={`img-popup-wrapper ${equipment}`} style={{ display: show && imgShow ? 'flex' : 'none' }}>
        <div className="img-position">
            <div
                id="imgPopContent"
                className="img-content">
                {src && <img src={src} style={{ ...imgStyle }} alt="img-viewer"/>}
            </div>
            <a className="iconfont close-icon" onClick={close}>&#xe646;</a>
        </div>
        <div className="img-popup-mask" onClick={close}/>
    </div>
}

ImgPopup.propTypes = {
    show: bool.isRequired,
    close: func.isRequired
}

export default ImgPopup
