import path from 'path'
import fs from 'fs'

import { isObject } from '../../assets/public/js/index'

const winston = require('winston')
const { createLogger, format, transports } = winston
require('winston-daily-rotate-file')

// 确保项目根目录存在logs文件夹
const logDirectory = path.resolve('./', 'logs')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// 根据日期生成文件
const transportFile = (obj) => new (winston.transports.DailyRotateFile)(Object.assign({
    datePattern: 'YYYY-MM-DD-HH',
    // zippedArchive: true,
    maxSize: '20m',
    maxFiles: '1d'
}, obj))

// 信息输出
const formatPrintf = (info) => {
    try {
        let { timestamp, level, message } = info
        let obj = {
            level: level,
            timestamp: timestamp,
            message: message
        }

        if (info.meta) { // 由express-winston中间件打印，包含meta信息
            const meta = info.meta
            const req = meta.req
            obj.url = `${req.method} ${req.headers.host + req.originalUrl}`
            req.query && (obj.query = JSON.stringify(req.query))
            req.body && (obj.body = JSON.stringify(req.body))

            meta.error && Object.keys(meta.error).map(function (key, index) { // 暂时有errpath， errmessage
                obj[`err_${key}`] = isObject(meta.error[key]) ? JSON.stringify(meta.error[key]) : meta.error[key]
            })
            meta.stack && (obj.stack = meta.stack.replace(/[\r\n]/g, ''))

            obj.cookies = `${req.headers.cookie}`
            obj.userAgent = req.headers['user-agent']

            meta.res && Object.keys(meta.res).map(function (key, index) { // 暂时有resstatusCode
                obj[`res_${key}`] = isObject(meta.res[key]) ? JSON.stringify(meta.res[key]) : meta.res[key]
            })
            meta.responseTime && (obj.responseTime = meta.responseTime)

            obj.meta = JSON.stringify(meta)
        } else {
            Object.keys(info).map(function (key, index) {
                if (key !== 'level' && key !== 'timestamp' && key !== 'message') {
                    if (key === 'stack' || key === 'componentStack') {
                        obj[key] = info[key].replace(/[\r\n]/g, '')
                    } else {
                        obj[key] = isObject(info[key]) ? JSON.stringify(info[key]) : info[key]
                    }
                }
            })
        }

        return JSON.stringify(obj)
    } catch (err) {
        return JSON.stringify({
            level: 'error',
            message: err.message || 'winston printf error'
        })
    }
}

const transportLevelFile = (level) => transportFile({
    level: level,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(formatPrintf)
    ),
    filename: path.resolve(logDirectory, `${level}-%DATE%.log`)
})

const logger = createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5
})
logger.configure({
    level: 'verbose'
})
logger.configure({
    level: 'debug'
})
logger.configure({
    level: 'silly',
    transports: [
        transportFile({ // 此没有级别则从最低级silly全部打印
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(formatPrintf)
            ),
            filename: path.resolve(logDirectory, 'info-%DATE%.log')
        }),
        // transportLevelFile('http'), // level以当前级别包含关系，如: http则打印http+info+wran+error; warn则打印wran+error
        // transportLevelFile('error'), // error则只打印error
        transportLevelFile('warn'),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(info => {
                    const { timestamp, level, message } = info
                    return `${timestamp} [${level}]: ${message}`
                })
            )
        })
    ]
})

/** @desc 日志级别(error, warn, info, http, verbose, debug, silly)
 * 符合RFC5424指定的严重性顺序。官方地址:https://tools.ietf.org/html/rfc5424
 * error:0 严重错误，会导致程序或页面崩溃，必须马上处理：程序运行错误, ejs模板错误, middleware其它运行中间件错误
 * warn:1 警告需要尽早解决，对于那些目前还不是错误，然而不及时处理也会变成错误的情况。内存或cpu使用率过高, 接口请求错误, 接口请求成功但code!==1
 * info:2 有意义的事件信息，记录程序正常的运行状态，比如收到请求，成功执行。通过查看info,可以快速定位error，warn。info不宜过多，通常情况下不超过debug的10%
 * http:3 请求日志，可查看当前请求头信息与状态码等
 * verbose:4 冗余信息，记录一些有用可长期存在的信息
 * debug:5 调试信息，与程序运行时的流程相关的详细信息以及当前变量状态
 * silly:6 临时信息，临时日志后期可删除
 * */

/** @desc 后端自动打印: 包含meta字段，后端自动打印在/server/app/app.js中的错误处理中间件统一捕获错误
 * error
 * 1:ejs模板错误; 2:react后端运行错误; 2:middleware其它中间件错误(包括自动捕获至全局的错误errorHandle);
 * warn
 * 1:api接口请求错误400/500; 2:api接口请求正确200但code!==1; 3:内存或cpu使用过高等性能警告
 * http
 * 1:所有相关请求
 * ----example----
 * warn
 * {message: 'api-err', httpCode: 400/500, url: '/failed', errMsg: 'error message', stack: 'stack'} // 由ajax公共函数统一打印
 * error
 * {message: 'api-msg', httpCode: 200, url: '/succeed', resCode: -1, resMsg: 'res.msg', stack: 'stack'} // 由ajax公共函数统一打印
 * middleware error
 * {level: 'error', message: 'middlewareerror', error: 'error', stack: 'stack', meta: {}} // 由错误中间件统一打印
 * */

/** @desc 前端日志上报: 框架前端自动打印multiPublic/index.js中logReport参数params包含framework:true。前端所有日志message中都包含’client‘字符串
 * error
 * 1:js运行错误browser/index.js; 2:react组件捕获错误browser/app.js;
 * warn
 * 1:api接口请求错误400/500; 2:api接口请求正确200但code!==1;
 * 1
 * ----example----
 * {message: 'client-api-msg', url: '/succeed', params:{}, httpCode: 200, resCode: -1, resMsg: 'res.msg', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage}
 * {message: 'client-api-err', url: '/failed', params:{}, httpCode: 400/500, errMsg: 'error message', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage}
 * {message: 'client-ajax-handle-err', url: '/failed', params:{}, httpCode: 200, errMsg: 'error message', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage}
 * {message: 'client-app-err', errMsg: 'error message', userAgent: '', stack: '', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage} // ejs项目
 * {message: 'client-app-err-react', errMsg: 'error message', timetampClient: '', userAgent: '', stack: '', componentStack: '', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage}
 * {message: 'client-app-err-window', errMsg: 'error message', timetampClient: '', userAgent: '', source: '', lineno: '', colno: '', stack: '', ip: '', userAgent: '', cookies: '', localStorage: '', sessionStorage}
 * */

/** @desc 自定义日志，开发者主动打印。react程序中调用multiPublic/index.js的logReport方法{level: 'error'} level为主动传入字段
 * { level: 'error', message: trace, stack: 'stack'}
 * ----example----
 * logReport({ level: 'error', message: '', path: '' }) // 前端程序
 * res.logger.error({ message: '', path: '' }) // 后端路由
 * logger.error({ message: '', path: '' }) // 调用文件
 * */

/** @desc 整体描述
 * 前端日志上报为: ajax调用nodejs的/logger路由，由node调动此日志程序打印。所有message中包含'client'字符。logger路由判断params中是否有framework为框架打印否则为自定义打印
 * 后端日志打印为: app.js中的错误中间件统一捕获利用此日志程序打印。路由中可调用res.logger，或者调用server/app/logger.js
 * 前后端同构react程序日志打印为: 调用multiPublic/index.js中的logReport方法打印[为前端打印，如果后端报错会直接由app.js错误中间件处理]
 * */

/** @desc 使用示例
 * logger.error('error test')
 * logger.warn('warn test')
 * logger.info('info test')
 * logger.http('http test')
 * logger.verbose('verbose test')
 * logger.debug('debug test')
 * logger.silly('silly test')
 * logger.log({ level: 'verbose', message: 'log verbose test' })
 * */

/** @desc 日志格式/字段
 * 文件日志格式统一采用JSON，便于ELK解析处理。
 * 日志中的各个字段的值，都应该尽量使用英文，不使用中文。
 * 日志具体字段，分为基础数据 + 扩展数据。基础数据，是底层日志框架自带的，所有日志都会包含。扩展数据，不同类型的日志，包含不同的字段。
 * */
/* const loggerParams = {
    /!** ---------基础数据------- **!/
    level: 'error',
    message: 'middlewareError',
    // message: 'HTTP GET /',
    timestamp: '2019-11-29 19:59:58',
    /!** ---------扩展字段------- **!/
    httpCode: '400/500',
    url: '/failed',
    errMsg: 'error message'
    // httpCode: 200,
    // url: '/succeed',
    // resCode: -1,
    // resMsg: 'res.msg'
    // eg: 以下为http请求日志，请求头中所有信息可在此查看
    // url: '',
    // query: {},
    // body: {}
    // res_statusCode: 200,
    // responseTime: 1,
    // meta: {} // 其它请求信息userAgent, cookies等,以多层json数据存在,由express-winston自动打印，备份作为其它问题查询
    // eg: 以下为ejs+router等中间件错误日志
    // url: '',
    // query: {},
    // body: {}
    // err_message: 200,
    // err_path: 200,
    // meta: {} // 其它错误信息process, trace等,以多层json数据存在,由express-winston自动打印，备份作为其它问题查询
}
console.log(loggerParams) */

export default logger
