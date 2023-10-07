import Router from 'express-promise-router'
import { axiosAjax } from '../../assets/public/js'
import { user } from '../../assets/public/js/apis'

const router = new Router()

// 前端使用download.js下载，此功能暂时无用
router.get('/', async function (req, res, next) {
    const resData = await axiosAjax({
        type: 'get',
        url: user.exportBookmark,
        req
    })
    if (resData.code === 1) {
        res.send(resData.data)
    } else {
        res.send(resData)
    }
})

export default router
