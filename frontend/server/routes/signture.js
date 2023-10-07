import { promisify } from 'util'
import express from 'express'
import request from 'request'

import sign from './signture/sign'
import clientDB from './signture/client'

const router = express.Router()
const client = clientDB()

const getAsync = promisify(client.get).bind(client) // 获取当个值
const setAsync = promisify(client.set).bind(client) // 设置单个值
const hmsetAsync = promisify(client.hmset).bind(client) // 设置多个值，以json形式
const hgetallAsync = promisify(client.hgetall).bind(client) // 获取多个值，以json形式

// 用户名：chenxiangming@huoxing24.com 密码：hxcj@2019
const config = {
    appID: 'wxec2dc083d4024311',
    appSecret: 'b78d95fd673f7fe469d2f957e877a34a'
}

// accessToken与jsApiTickets过期时间
const deadTime = 2 * 60 * 60 * 1000

/** 请求获取access_token */
const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appID + '&secret=' + config.appSecret
const getAccessToken = () => new Promise((resolve, reject) => {
    request(tokenUrl, function (error, response, data) {
        if (error) reject(new Error(`getAccessToken: ${error}`))

        if (response && response.statusCode && response.statusCode === 200) {
            const accessToken = JSON.parse(data).access_token
            if (accessToken) {
                resolve(accessToken)
            } else {
                reject(new Error(`getAccessToken: ${response.body}`))
            }
        } else {
            reject(new Error(`getAccessToken: ${response.body}`))
        }
    })
})

/**
 * 请求获取Jsapi_Ticket
 * @param {* URL链接} hrefURL
 * @param {* token} accessToken
 */
const getJsapiTicket = (reqUrl, accessToken) => {
    const ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi'
    return new Promise((resolve, reject) => {
        request(ticketUrl, function (error, response, data) {
            if (error) reject(new Error(`getJsapiTicket: ${error}`))

            if (response.statusCode && response.statusCode === 200) {
                const content = JSON.parse(data)
                if (!content) reject(new Error(`getJsapiTicket: ${response.body}`))

                if (content.errcode === 0) {
                    resolve(sign(content.ticket, reqUrl))
                } else if (content.errcode === 40001) {
                    resolve({ errcode: 40001, errmsg: 'invalid credential, access_token is invalid or not latest' })
                } else {
                    reject(new Error(`getJsapiTicket: ${response.body}`))
                }
            } else {
                reject(new Error(`getJsapiTicket: ${response.body}`))
            }
        })
    })
}

async function getAndSetAccessToken () {
    const token = await getAccessToken()
    const access = {
        'token': token,
        'time': new Date().getTime()
    }
    await hmsetAsync('access', access)
    return access
}

async function dueClear (reqUrl) {
    const access = await getAndSetAccessToken()
    const ticketObj = await noDueVerify(access, reqUrl)
    return ticketObj
}

async function noDueVerify (access, reqUrl) {
    const ticketsArrStr = await getAsync('tickets')
    const ticketsArr = JSON.parse(ticketsArrStr)

    // 如果tickets不存在redis中，请求ticket并存入
    if (!ticketsArrStr || !Array.isArray(ticketsArr)) {
        console.log('redis no tickets')
        let ticketObj = await getJsapiTicket(reqUrl, access.token)
        if (ticketObj.hasOwnProperty('errcode') && ticketObj.errcode === 40001) {
            console.log('accessToken time live, but accessToken die')
            // accessToken未到过期时间，但过期了重新请求
            const newAccess = await getAndSetAccessToken()
            ticketObj = await getJsapiTicket(reqUrl, newAccess.token)
        }
        await setAsync('tickets', JSON.stringify([ticketObj]))
        return ticketObj
    }

    // 检测当前url是否之前获取过jsApiTicket
    let ticketIndex = -1
    let tempArr = ticketsArr.slice(0)
    for (let key in ticketsArr) {
        const ticketDie = parseInt(Date.parse(new Date()) / 1000) - parseInt(ticketsArr[key].timestamp) > deadTime / 1000
        if (ticketDie) tempArr.splice(ticketIndex, 1) // 删除已过期的ticket
        if (ticketsArr[key].url === reqUrl && !ticketDie) { // 未过期且是当前url，下一步重新获取
            ticketIndex = key
            break
        }
    }
    if (ticketIndex === -1) { // 没获取过或已过期，去获取
        console.log('no ticket or ticket die')
        let ticketObj = await getJsapiTicket(reqUrl, access.token)
        if (ticketObj.hasOwnProperty('errcode') && ticketObj.errcode === 40001) {
            console.log('accessToken time live, but accessToken die')
            // accessToken未到过期时间，但过期了重新请求
            const newAccess = await getAndSetAccessToken()
            ticketObj = await getJsapiTicket(reqUrl, newAccess.token)
        }
        tempArr.push(ticketObj)
        await setAsync('tickets', JSON.stringify(tempArr))
        return ticketObj
    } else { // 获取过，直接返回之前信息
        console.log('ticket live')
        return ticketsArr[ticketIndex]
    }
}

router.post('/', async function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('X-Powered-By', ' 3.2.1')
    res.header('Content-Type', 'application/json;charset=utf-8')

    const reqUrl = req.body.url
    const access = await hgetallAsync('access')

    if (access) { // 请求过access_token并且存储到redis
        if (new Date().getTime() - parseInt(access.time) > deadTime) { // accessToken已過期
            console.log('access die')
            dueClear(reqUrl).then(function (data) {
                res.json(data)
            }).catch(function (err) {
                res.status(404).send(err.message)
            })
        } else { // accessToken未過期
            console.log('access live')
            noDueVerify(access, reqUrl).then(function (data) {
                res.json(data)
            }).catch(function (err) {
                res.status(404).send(err.message)
            })
        }
    } else { // 未请求过access_token
        console.log('no access')
        dueClear(reqUrl).then(function (data) {
            res.json(data)
        }).catch(function (err) {
            res.status(404).send(err.message)
        })
    }
})

export default router
