import Router from 'express-promise-router'
import { deepCompare } from '../../assets/public/js/index'

const router = new Router()

let logArr = []
let logPreTime = new Date().getTime() // 1秒内logArr中不存在的errObj才上报，防止强刷
router.post('/', async function (req, res, next) {
    try {
        const { body, headers, cookies, ip } = req
        const cookiesTmp = {}
        Object.keys(cookies).map(function (key, index) { // 排除不必要的信息
            const keyTrue = key.indexOf('Hm_lvt_') === -1 &&
                key.indexOf('Hm_lpvt_') === -1 &&
                key.indexOf('CNZZDATA') === -1 &&
                key !== 'yp_riddler_id' &&
                key !== 'UM_distinctid'
            if (keyTrue) {
                cookiesTmp[key] = cookies[key]
            }
        })
        const logObj = {
            ...body,
            ip: ip,
            userAgent: headers['user-agent'],
            cookies: cookiesTmp
        }
        const logCurTime = new Date().getTime()
        const logPrint = () => {
            if (body.framework) { // 如果框架自动打印包含framework字段
                delete logObj.framework
                switch (logObj.message) {
                    case 'client-api-msg':
                    case 'client-api-err':
                        res.logger.warn({ ...logObj })
                        break
                    case 'client-app-err':
                    case 'client-app-err-react':
                    case 'client-app-err-window':
                    case 'client-ajax-handle-err':
                        res.logger.error({ ...logObj })
                        break
                    default:
                        res.logger.info({ ...logObj })
                }
            } else { // 打印前端自定义日志
                if (body.level) {
                    const level = body.level
                    delete body.level
                    res.logger[level]({ ...body, message: `client: ${body.message || 'browser'}` })
                } else {
                    res.logger.info({ ...body, message: `client: ${body.message || 'browser'}` })
                }
            }
        }
        if (logCurTime - logPreTime >= 1000 && logArr.length !== 0) {
            logArr = []
            logArr.push(logObj)
            logPreTime = logCurTime
            logPrint()
        } else {
            const hasLogObj = () => {
                for (let val of logArr) {
                    if (deepCompare(val, logObj)) {
                        return true
                    }
                }
                return false
            }
            if (logArr.length !== 0 && hasLogObj()) return
            logArr.push(logObj)
            logPrint()
        }
        res.send({
            code: 1,
            msg: 'Log reported successfully'
        })
    } catch (err) {
        res.send({
            code: -1,
            msg: err.message
        })
    }
})

export default router
