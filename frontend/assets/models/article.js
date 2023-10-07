import { axiosAjax } from '../public/js/index'
import { article } from '../public/js/apis'

export default {
    state: {
        articleDetail: {
            _id: '',
            title: '',
            content: '',
            channelId: '',
            tags: [],
            comments: [],
            createdAt: 0,
            user: {
                avatar: null,
                nickName: null,
                email: null,
                userName: null
            }
        },
        articleList: {
            currentPage: 1,
            pageSize: 1,
            totalPage: 1,
            totalSize: 1,
            list: []
        },
        channelList: [],
        curChannel: null,
        tagList: [],
        album: {
            _id: '',
            title: ''
        },
        albumList: {
            currentPage: 1,
            pageSize: 1,
            totalPage: 1,
            totalSize: 1,
            list: []
        }
    },
    reducers: {
        setCurChannel: (state, payload) => {
            state.curChannel = payload
        },
        tagListSet: (state, payload) => {
            state.tagList = payload
        },
        articleListSet: (state, payload) => {
            if (!payload) return
            state.articleList = payload
        },
        articleListAdd: (state, payload) => {
            if (!payload) return
            const tempList = state.articleList.list.concat(payload.list)
            state.articleList = { ...payload, list: tempList }
        },
        articleDetailSet: (state, payload) => {
            state.articleDetail = payload
        },
        channelListSet: (state, payload) => {
            state.channelList = payload
        },
        albumListSet: (state, payload) => {
            state.albumList = payload
        },
        albumSet: (state, payload) => {
            state.album = payload
        }
    },
    effects: (dispatch) => ({
        async articleAdd (payload, rootState) {
            const res = await axiosAjax({
                type: 'put',
                url: article.article,
                params: payload
            })
            return res
        },
        async articleEdit (payload, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: article.article,
                params: payload
            })
            return res
        },
        async articleUserGet (payload, rootState) {
            // const { keywords, currentPage, pageSize, articleId, expressRequest, expressResponse } = payload
            const res = await axiosAjax({
                type: 'get',
                url: article.articleUser,
                params: payload,
                req: payload.expressRequest,
                res: payload.expressResponse
            })
            return res
        },
        async articleDel ({ articleId }, rootState) {
            const res = await axiosAjax({
                type: 'delete',
                url: article.article,
                params: { articleId }
            })
            return res
        },
        async articleGet (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: article.article,
                params: payload
            })
            return res
        },
        async tagAdd (name, rootState) {
            const res = await axiosAjax({
                type: 'post',
                noLoading: true,
                url: article.tag,
                params: { name }
            })
            return res
        },
        async tagGet ({ name, _id }, rootState) {
            const res = await axiosAjax({
                type: 'get',
                noLoading: true,
                url: article.tag,
                params: { name, _id }
            })
            if (res && res.code === 1) dispatch.article.tagListSet(res.data)
            return res
        },
        async channelGet (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: article.channel
            })
            if (res && res.code === 1) dispatch.article.channelListSet(res.data)
            return res
        },
        async albumGet (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: article.album,
                params: payload._id ? payload : {
                    pageSize: 10,
                    ...payload
                }
            })

            if (res && res.code === 1) {
                if (payload._id) {
                    dispatch.article.albumSet(res.data)
                } else {
                    dispatch.article.albumListSet(res.data)
                }
            }

            return res
        },
        async albumGetByArticleId (payload, rootState) {
            const res = await axiosAjax({
                type: 'get',
                url: article.albumByArticle,
                params: payload
            })

            if (res && res.code === 1) dispatch.article.albumListSet({ list: res.data })
            return res
        }
    })
}
