import React, { useState, useCallback, useRef } from 'react'
import ReactCrop from 'react-image-crop'
import './index.scss'

export default ({ onComplete, image }) => {
    const imgRef = useRef(null)
    const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 / 1 })

    const onLoad = useCallback(img => {
        imgRef.current = img
    }, [])

    const makeClientCrop = async crop => {
        if (!imgRef.current || !crop.width || !crop.height) return
        await createCropPreview(imgRef.current, crop, 'newFile.jpeg').catch(function (err) {
            console.error(err)
        })
    }

    const createCropPreview = async (image, crop, fileName) => {
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        canvas.width = crop.width
        canvas.height = crop.height
        const ctx = canvas.getContext('2d')

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                blob.name = fileName
                onComplete(blob)
            }, 'image/jpeg')
        })
    }

    return <ReactCrop
        src={image}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={c => setCrop(c)}
        onComplete={makeClientCrop}
    />
}
