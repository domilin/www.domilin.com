import { promisify } from 'util'
import Router from 'express-promise-router'
import clientDB from './signture/client'
import { axiosAjax } from '../../assets/public/js'
import { standby } from '../../assets/public/js/apis'

const router = new Router()
const client = clientDB()
const getAsync = promisify(client.get).bind(client) // 获取当个值
const setAsync = promisify(client.set).bind(client) // 设置单个值
// const hmsetAsync = promisify(client.hmset).bind(client) // 设置多个值，以json形式
// const hgetallAsync = promisify(client.hgetall).bind(client) // 获取多个值，以json形式

// 获取城市
const requestCity = async () => {
    const resCity = await axiosAjax({
        type: 'get',
        noLoading: true,
        host: standby.apiHost,
        url: standby.city,
        params: { appkey: standby.appkey }
    })
    if (parseInt(resCity.code) !== 10000 || (resCity.result && parseInt(resCity.result.status) !== 0)) return
    const data = JSON.stringify(resCity.result.result)
    await Promise.all([
        setAsync('city', data),
        setAsync('cityExpiry', new Date().getTime())
    ])
    return data
}
const getCity = async () => {
    const redisCity = await getAsync('city')
    if (!redisCity) {
        const res = await requestCity()
        return res
    }
    const redisCityExpiry = await getAsync('cityExpiry')
    // 12小时过期
    if (new Date().getTime() > parseInt(redisCityExpiry) + 12 * 60 * 60 * 1000) {
        const res = await requestCity()
        return res
    }
    return redisCity
}
router.get('/city', async function (req, res, next) {
    // 检测redis中是否有city
    // 没有则获取
    // 有检测是否到期
    // 到期则重启获取
    const resCity = await getCity()
    res.send({ code: 1, data: resCity })
})

// 获取天气
const requestWeather = async ({ citycode }) => {
    const resWeather = await axiosAjax({
        type: 'get',
        noLoading: true,
        host: standby.apiHost,
        url: standby.weather,
        params: { appkey: standby.appkey, citycode }
    })
    if (parseInt(resWeather.code) !== 10000 || (resWeather.result && parseInt(resWeather.result.status) !== 0)) return
    const data = JSON.stringify(resWeather.result.result)
    await Promise.all([
        setAsync(`weather${citycode}`, data),
        setAsync(`weatherExpiry${citycode}`, new Date().getTime())
    ])
    return data
}
const getWeather = async ({ citycode }) => {
    const redisWeather = await getAsync(`weather${citycode}`)
    if (!redisWeather) {
        const res = await requestWeather({ citycode })
        return res
    }
    const redisWeatherExpiry = await getAsync(`weatherExpiry${citycode}`)
    // 1分钟过期
    if (new Date().getTime() > parseInt(redisWeatherExpiry) + 60 * 1000) {
        const res = await requestWeather({ citycode })
        return res
    }
    return redisWeather
}
router.get('/', async function (req, res, next) {
    const citycode = req.query.citycode
    const resWeather = await getWeather({ citycode })
    res.send({ code: 1, data: resWeather })
})

export default router
