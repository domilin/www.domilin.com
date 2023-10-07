import { axiosAjax } from '../public/js/index'
import { website } from '../public/js/apis'

export default {
    state: {
        curFirstLevel: null,
        firstLevel: [],
        secondLevel: [],
        websiteList: {
            currentPage: 1,
            pageSize: 1,
            totalPage: 1,
            totalSize: 1,
            list: []
        }
    },
    reducers: {
        curFirstLevelSet: (state, payload) => {
            state.curFirstLevel = payload
        },
        firstLevelSet: (state, payload) => {
            state.firstLevel = payload
        },
        secondLevelSet: (state, payload) => {
            state.secondLevel = payload
        },
        websiteListSet: (state, payload) => {
            if (!payload) return
            state.websiteList = payload
        }
    },
    effects: (dispatch) => ({
        async firstLevelGet (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: website.firstLevel,
                noLoading: true,
                params: payload
            })
            if (res && res.code === 1) dispatch.website.firstLevelSet(res.data)
            return res
        },
        async secondLevelGet (firstLevelId, rootState) {
            const res = await axiosAjax({
                type: 'get',
                noLoading: true,
                url: website.secondLevel,
                params: { firstLevelId }
            })
            if (res && res.code === 1) dispatch.website.secondLevelSet(res.data)
            return res
        },
        async siteListGet ({
            firstLevelId,
            secondLevelId,
            recommend,
            keywords,
            currentPage,
            pageSize
        }, rootState) { // 严选导航 + 我的导航--未注册用户默认导航 + 搜索导航
            const res = await axiosAjax({
                type: 'get',
                url: website.website,
                noLoading: true,
                params: {
                    firstLevelId,
                    secondLevelId,
                    recommend,
                    keywords,
                    currentPage,
                    pageSize: pageSize || 50
                }
            })
            if (res && res.code === 1) dispatch.website.websiteListSet(res.data)
            return res
        },
        async websiteListGet (payload, rootState) { // 主页推荐网站图标
            const second = await axiosAjax({
                type: 'get',
                url: website.secondLevel,
                params: payload
            })
            if (!second || second.code !== 1 || !second.data || !Array.isArray(second.data)) return second
            const site = await axiosAjax({
                type: 'get',
                url: website.website,
                params: {
                    ...payload,
                    currentPage: 1,
                    pageSize: 50
                }
            })
            if (site && site.code === 1 && site.data && site.data.list && Array.isArray(site.data.list)) {
                let keyName = 'secondLevelId'
                if (payload.recommend) keyName = 'recommendSecondLevelId'
                site.data.list.map(function (item, index) {
                    for (let val of second.data) {
                        if (val._id === item[keyName]) {
                            if ('children' in val) {
                                val.children.push(item)
                            } else {
                                val.children = [item]
                            }
                            break
                        }
                    }
                })
                dispatch.website.websiteListSet({ ...site.data, list: second.data })
            }
            return second
        }
    })
}
