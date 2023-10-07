
import fse from 'fs-extra'
import { resolve } from 'path'
import { SitemapStream, streamToPromise } from 'sitemap'
// external libs provided as example only
import { parser } from 'stream-json/Parser'
import { streamArray } from 'stream-json/streamers/StreamArray'
import map from 'through2-map'
import { createGzip } from 'zlib'
import axios from 'axios'
import { frontendDomain, apiDomain } from '../../config/config'
import { article, website } from '../../assets/public/js/apis'
import moment from 'moment'
import schedule from 'node-schedule'

const sitemapJson = resolve(__dirname, '../../static/sitemap.json')
const dateFormat = (eventDateString) => {
    const dateStr = new Date(eventDateString)
    return moment(dateStr).format('YYYY-MM-DD hh:mm:ss')
}
const initSitemap = async () => {
    // 读取siteMap文件
    const fileExist = await fse.pathExists(sitemapJson)
    if (!fileExist) await fse.outputJson(sitemapJson, [])
    const data = await fse.readJson(sitemapJson)
    if (data.length !== 0) return

    const mapArr = []

    // 海报制作相关路由
    mapArr.push({
        url: `/poster`,
        priority: 0.1,
        changefreq: 'monthly'
    })
    mapArr.push({
        url: `/postermaker`,
        priority: 0.1,
        changefreq: 'monthly'
    })

    // 获取文章详情链接
    const resArticle = await axios({
        method: 'get',
        url: `${apiDomain}${article.article}`,
        params: { sitemap: 0 }
    })
    if (resArticle && resArticle.data && resArticle.data.data && Array.isArray(resArticle.data.data)) {
        for (const val of resArticle.data.data) {
            mapArr.push({
                url: `/article/${val._id}`,
                lastmod: dateFormat(val.updatedAt),
                priority: 0.5 // 0.0-1.0之间 值越大优先级越高
            })
        }
    }

    // 获取频道链接
    const resChannel = await axios({
        method: 'get',
        url: `${apiDomain}${article.channel}`
    })
    if (resChannel && resChannel.data && resChannel.data.data && Array.isArray(resChannel.data.data)) {
        for (const val of resChannel.data.data) {
            mapArr.push({
                url: `/article/channel/${val._id}`,
                lastmod: dateFormat(val.updatedAt),
                priority: 0.55,
                changefreq: 'daily'
            })
        }
    }

    mapArr.push({
        url: `/article/channel`,
        priority: 0.6,
        changefreq: 'weekly'
    })

    mapArr.push({
        url: `/article/album`,
        priority: 0.65,
        changefreq: 'weekly'
    })

    // 获取专辑列表链接
    const resAlbum = await axios({
        method: 'get',
        url: `${apiDomain}${article.album}`,
        params: {
            currentPage: 1,
            pageSize: 1000
        }
    })
    if (resAlbum && resAlbum.data && resAlbum.data.data && Array.isArray(resAlbum.data.data)) {
        for (const val of resAlbum.data.data) {
            mapArr.push({
                url: `/article/album/${val._id}`,
                lastmod: dateFormat(val.updatedAt),
                priority: 0.7,
                changefreq: 'daily'
            })
        }
    }

    // 获取网站一级导航链接
    const resFirst = await axios({
        method: 'get',
        url: `${apiDomain}${website.firstLevel}`
    })
    if (resFirst && resFirst.data && resFirst.data.data && Array.isArray(resFirst.data.data)) {
        for (const val of resFirst.data.data) {
            const firstUrl = `/career/${val._id}`
            mapArr.push({
                url: firstUrl,
                lastmod: dateFormat(val.updatedAt),
                priority: 0.75,
                changefreq: 'weekly'
            })

            // 获取网站二级导航
            const resSecond = await axios({
                method: 'get',
                url: `${apiDomain}${website.secondLevel}`,
                params: { firstLevelId: val._id }
            })
            if (resSecond && resSecond.data && resSecond.data.data && Array.isArray(resSecond.data.data)) {
                for (const valIn of resSecond.data.data) {
                    const secondUrl = `${firstUrl}/${valIn._id}`
                    mapArr.push({
                        url: secondUrl,
                        lastmod: dateFormat(val.updatedAt),
                        priority: 0.8,
                        changefreq: 'weekly'
                    })
                }
            }
        }
    }

    await fse.outputJson(sitemapJson, mapArr)
}

// let sitemapCache // 缓存sitemap---此处使用缓存
export default (app) => {
    // 启动后初始化init
    initSitemap()

    /** @desc 定时执行更新sitemap.json
     * 每分钟的第30秒触发： '30 * * * * *'
     * 每小时的1分30秒触发 ：'30 1 * * * *'
     * 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
     * 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
     * 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
     * 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
    */
    schedule.scheduleJob('30 1 2 * * *', async () => {
        const fileExist = await fse.pathExists(sitemapJson)
        if (!fileExist) return
        const data = await fse.readJson(sitemapJson)

        const res = await axios({
            method: 'get',
            url: `${apiDomain}${article.article}`,
            params: { sitemap: 1 }
        })
        if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
            for (const val of res.data.data) {
                data.push({
                    url: `/article/${val._id}`,
                    lastmod: dateFormat(val.updatedAt),
                    priority: 0.5 // 0.0-1.0之间 值越大优先级越高
                })
            }
        }
        await fse.outputJson(sitemapJson, data)
    })

    app.get('/sitemap.xml', async function (req, res) {
        res.header('Content-Type', 'application/xml')
        res.header('Content-Encoding', 'gzip')

        // if we have a cached entry send it
        // if (sitemapCache) {
        //     res.send(sitemapCache)
        //     return
        // }

        try {
            // this could just as easily be a db response
            const gzippedStream = fse
                // read our list of urls in
                .createReadStream(sitemapJson)
                // stream parse the json - this avoids having to pull the entire file into memory
                .pipe(parser())
                .pipe(streamArray()) // replace with streamValues for JSONStream
                .pipe(map.obj((chunk) => chunk.value))
                .pipe(new SitemapStream({ hostname: frontendDomain }))
                .pipe(createGzip())

            // This takes the result and stores it in memory - > 50mb
            streamToPromise(gzippedStream).then((sm) => {
                // sitemapCache = sm
            })
            // stream the response to the client at the same time
            gzippedStream.pipe(res).on('error', (e) => {
                throw e
            })
        } catch (e) {
            console.error(e)
            res.status(500).end()
        }
    })
}
