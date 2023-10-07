import { axiosAjax, sortBy } from '../public/js/index'
import { user } from '../public/js/apis'

const getDragDrop = (sites, dragId, dropId, params) => {
    let dragItem = null
    let dropItem = null
    let dragKey = null
    let dropKey = null
    let dragChildKey = null
    let dropChildKey = null
    let maxSort = 0
    for (const key in sites) {
        const val = sites[key]

        if (val.sort > maxSort) maxSort = val.sort

        if (val._id === dragId) {
            dragKey = key
            dragItem = { ...val }
        }
        if (val._id === dropId) {
            dropKey = key
            dropItem = { ...val }
        }

        if ((val._id !== dragId || val._id !== dropId) && val.type && val.type === 'folder') { // 没有folderId表明是文件夹
            for (const childKey in val.children) {
                const childVal = val.children[childKey]

                if (childVal.sort > maxSort) maxSort = childVal.sort

                if (childVal._id === dragId) {
                    dragChildKey = childKey
                    dragItem = { ...childVal }
                }
                if (childVal._id === dropId) {
                    dropChildKey = childKey
                    dropItem = { ...childVal }
                }

                if (!params || !params.maxSort) if (dragItem && dropItem) break
            }
        }

        if (!params || !params.maxSort) if (dragItem && dropItem) break
    }
    return {
        dragItem,
        dropItem,
        dragKey,
        dropKey,
        dragChildKey,
        dropChildKey,
        maxSort
    }
}

const reSort = (sites, dragItem, dropItem) => {
    for (const key in sites) {
        const val = sites[key]
        if (val.sort === dragItem.sort) {
            val.sort = dropItem.sort
        }
        if (val._id !== dragItem._id) {
            if (dragItem.sort > dropItem.sort) {
                if (val.sort < dragItem.sort && val.sort >= dropItem.sort) {
                    val.sort += 1
                }
            }

            if (dragItem.sort < dropItem.sort) {
                if (val.sort > dragItem.sort && val.sort <= dropItem.sort) {
                    val.sort -= 1
                }
            }

            if (val.type && val.type === 'folder') { // 没有folderId表明是文件夹
                for (const childKey in val.children) {
                    const childVal = val.children[childKey]
                    if (childVal.sort === dragItem.sort) {
                        childVal.sort = dropItem.sort
                    }

                    if (childVal._id !== dragItem._id) {
                        if (dragItem.sort > dropItem.sort) {
                            if (childVal.sort < dragItem.sort && childVal.sort >= dropItem.sort) {
                                childVal.sort += 1
                            }
                        }

                        if (dragItem.sort < dropItem.sort) {
                            if (childVal.sort > dragItem.sort && childVal.sort <= dropItem.sort) {
                                childVal.sort -= 1
                            }
                        }
                    }
                }
                val.children = val.children.sort(sortBy('sort', true))
            }
        }
    }

    return sites.sort(sortBy('sort', true))
}

export default {
    state: {
        curLevel: null,
        levels: [],
        sites: []
    },
    reducers: {
        setCurlevel: (state, payload) => {
            state.curLevel = payload
        },
        levelsSet: (state, payload) => {
            if (!payload) return
            const levelsNew = payload.sort(sortBy('sort', true))

            state.curLevel = levelsNew.length > 0 && levelsNew[0]._id
            state.levels = levelsNew
        },
        sitesSet: (state, payload) => {
            if (!payload) return
            state.sites = payload.sort(sortBy('sort', true))
        },
        foderNameEdit: (state, payload) => {
            if (!payload) return
            for (const key in state.sites) {
                const val = state.sites[key]
                if (val.type === 'folder' && val._id === payload._id) {
                    val.name = payload.name
                }
            }
        }
    },
    effects: (dispatch) => ({
        async levelAddXhr (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const levels = rootState.user.levels
            const res = await axiosAjax({
                type: 'put',
                url: user.level,
                params: {
                    ...payload,
                    // 后端会再次重新获取新加分类的排序，此处添加sort字段，是接口dto检测需要，实际无用途
                    sort: levels.length > 0 ? levels[levels.length - 1].sort + 1 : 0
                }
            })
            if (res.code === 1) dispatch.user.levelsSet(res.data)
            return res
        },
        async levelEditXhr (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                url: user.level,
                params: {
                    ...payload
                }
            })
            if (res.code === 1) dispatch.user.levelsSet(res.data)
            return res
        },
        async levelDelXhr ({ _id }, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'delete',
                url: user.level,
                params: { _id }
            })
            if (res.code === 1) {
                dispatch.user.sitesSet(res.data.sites)
                dispatch.user.levelsSet(res.data.levels)
            }
            return res
        },
        async siteAddXhr (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const sites = rootState.user.sites
            const res = await axiosAjax({
                type: 'put',
                url: user.site,
                params: {
                    ...payload,
                    sort: sites.length > 0 ? sites[sites.length - 1].sort + 1 : 0
                }
            })
            if (res.code === 1) dispatch.user.sitesSet(res.data)
            return res
        },
        async siteEditXhr (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                url: user.site,
                params: payload
            })
            if (res.code === 1) dispatch.user.sitesSet(res.data)
            return res
        },
        async folderEditXhr (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                noLoading: true,
                url: user.folder,
                params: payload
            })
            if (res && res.code === 1) dispatch.user.foderNameEdit(payload)
            return res
        },
        async sitesFoldersLevelsSortXhr (payload, rootState) {
            const resSort = await axiosAjax({
                type: 'post',
                noLoading: true,
                url: user.sitesFoldersLevelsSort,
                params: payload
            })
            if (!resSort || resSort.code !== 1) return { code: -101, msg: '网站排序失败' }
        },
        async siteDelXhr ({ _id }, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }
            const sites = { ...rootState.user.sites }

            // 获取文件夹Id
            let delFolderId = null
            let delSiteId = null
            let changeSiteId = null
            let changeSiteSort = null
            let delKey = null
            let changeKey = null
            for (const key in sites) {
                const val = sites[key]
                if (val._id !== _id && 'children' in val && val.children.length === 2) {
                    for (const childKey in val.children) {
                        const childSite = (val.children)[childKey]
                        if (childSite._id === _id) {
                            delKey = childKey
                        }
                    }
                    if (!delKey) continue

                    if (parseInt(delKey) === 0) changeKey = 1
                    if (parseInt(delKey) === 1) changeKey = 0
                    const delItem = val.children[delKey]
                    const changeItem = val.children[changeKey]

                    delFolderId = val._id
                    delSiteId = delItem._id
                    changeSiteId = changeItem._id
                    changeSiteSort = val.sort

                    if (delKey) break
                }
            }

            let sitesNew = null
            if (delSiteId) {
                sitesNew = await axiosAjax({
                    type: 'delete',
                    url: user.site,
                    params: {
                        delFolderSite: {
                            delFolderId,
                            delSiteId,
                            changeSiteId,
                            changeSiteSort
                        }
                    }
                })
            } else {
                sitesNew = await axiosAjax({
                    type: 'delete',
                    url: user.site,
                    params: { siteId: _id }
                })
            }

            if (sitesNew.code === 1) dispatch.user.sitesSet(sitesNew.data)
            return sitesNew
        },
        async sitesFoldersSort ({ dragId, dropId }, rootState) {
            if (!dragId || !dropId || dragId === dropId) return
            const sites = [...rootState.user.sites]

            // 获取dragId, dropId的item
            const { dragItem, dropItem } = getDragDrop(sites, dragId, dropId)
            if (!dragItem || !dropItem) return

            // 重新排序
            const sitesNew = reSort(sites, dragItem, dropItem)
            dispatch.user.sitesSet(sitesNew)

            // 服务端重新排序
            await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })
        },
        async levelsSort ({ dragId, dropId }, rootState) {
            if (!dragId || !dropId || dragId === dropId) return
            const levels = [...rootState.user.levels]

            // 获取dragId, dropId的item
            const { dragItem, dropItem } = getDragDrop(levels, dragId, dropId)
            if (!dragItem || !dropItem) return

            // 重新排序
            const levelsNew = reSort(levels, dragItem, dropItem)
            dispatch.user.levelsSet(levelsNew)

            // 服务端重新排序
            await dispatch.user.sitesFoldersLevelsSortXhr({ levels: levelsNew })
        },
        async sitesFolderNew ({ dragId, dropId }, rootState) {
            if (document.getElementById(`websiteFolder${dragId}`)) return // 如果拖动文件夹，若为创建或移至文件夹内，不继续执行
            if (!dragId || !dropId || dragId === dropId) return
            const sites = [...rootState.user.sites]

            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const { dragItem, dropItem, dragKey, dropKey, maxSort } = getDragDrop(sites, dragId, dropId, { maxSort: true })
            if (!dragItem || !dropItem || dragItem.folderId) return // 文件夹内不新建，也不添加到文件夹

            // 重新排序，folder.sort与原dropItem.sort相同，故要把dropItem.sort为全部最大排序+1
            const folderSort = parseInt(dropItem.sort)
            const createFolder = await axiosAjax({
                type: 'put',
                noLoading: true,
                url: user.folder,
                params: {
                    levelId: dropItem.levelId,
                    sort: folderSort,
                    name: 'Folder',
                    children: [dragItem._id, dropItem._id]
                }
            })
            if (!createFolder || createFolder.code !== 1) return { code: -101, msg: '创建文件夹失败' }

            const newFolderTmp = createFolder.data
            dragItem.folderId = newFolderTmp._id
            dropItem.folderId = newFolderTmp._id
            dropItem.sort = maxSort + 1
            newFolderTmp.children = [dragItem, dropItem]

            sites[dropKey] = newFolderTmp
            sites.splice(dragKey, 1)

            const sitesNew = sites.sort(sortBy('sort', true))
            dispatch.user.sitesSet(sitesNew)

            // 服务端重新排序
            await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })
        },
        async sitesFolderAdd ({ dragId, dropId }, rootState) {
            if (document.getElementById(`websiteFolder${dragId}`)) return // 如果拖动文件夹，若为创建或移至文件夹内，不继续执行
            if (!dragId || !dropId || dragId === dropId) return
            const sites = [...rootState.user.sites]

            const { dragItem, dropItem, dragKey, dropKey } = getDragDrop(sites, dragId, dropId)

            // 文件夹内不新建，也不添加文件内
            if (!dragItem || !dropItem || dragItem.folderId) return

            const dragItemNew = { ...dragItem }
            const dropItemNew = { ...dropItem.children[0] }
            dragItem.folderId = dropItem._id
            dropItem.children.push(dragItem)
            sites[dropKey] = dropItem
            sites.splice(dragKey, 1)

            // 重新排序，移入的在文件夹第一个
            const sitesNew = reSort(sites, dragItemNew, dropItemNew)
            dispatch.user.sitesSet(sitesNew)

            // 服务端重新排序
            await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })
        },
        async sitesFolderOuter ({ dragId, dropId }, rootState) {
            if (document.getElementById(`websiteFolder${dragId}`)) return // 如果拖动文件夹，若为创建或移至文件夹内，不继续执行
            if (!dragId || !dropId || dragId === dropId) return
            const sites = [...rootState.user.sites]

            const { dragItem, dropItem, dragChildKey, dropKey } = getDragDrop(sites, dragId, dropId)
            if (!dropKey) return

            const children = [...dropItem.children]
            if (children.length <= 2) {
                delete children[0].folderId
                delete children[1].folderId
                children[0].sort = dropItem.sort
                const dragItemNew = { ...children[1] }
                let dropItemNew = { ...sites[parseInt(dropKey) + 1] }
                if (Object.keys(dropItemNew).length === 0) dropItemNew = { ...children[0] } // 文件夹处于排序最后一个
                sites.splice(dropKey, 1)
                const sitesLast = sites.concat(children)

                // 重新排序，剩余两个分散开，减法去一个sort大的sort，两个item挨着
                const sitesNew = reSort(sitesLast, dragItemNew, dropItemNew)
                dispatch.user.sitesSet(sitesNew)

                // 服务端重新排序
                await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })

                // 服务端删除空文件夹
                const delFolder = await axiosAjax({
                    type: 'delete',
                    url: user.folder,
                    noLoading: true,
                    params: { _id: dropItem._id }
                })
                if (!delFolder || delFolder.code !== 1) return { code: -101, msg: '删除文件夹失败' }
            } else {
                sites[dropKey].children.splice(dragChildKey, 1)
                delete dragItem.folderId
                const dragItemNew = { ...dragItem }
                let dropItemNew = { ...sites[parseInt(dropKey) + 1] }
                if (Object.keys(dropItemNew).length === 0) dropItemNew = { ...sites[dropKey] } // 文件夹处于排序最后一个
                sites.push(dragItem)

                // 重新排序，移出在此文件夹后
                const sitesNew = reSort(sites, dragItemNew, dropItemNew)
                dispatch.user.sitesSet(sitesNew)

                // 服务端重新排序
                await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })
            }
        },
        async siteFolderLevelChange ({ dragId, dropId }, rootState) {
            const sites = [...rootState.user.sites]

            let dragItem = null
            let dropItem = null
            for (const val of sites) {
                if (!dragItem && val._id === dragId) {
                    val.levelId = dropId // 更改levelId分类

                    if (val.type && val.type === 'folder') {
                        // 更改子site的levelId
                        for (const childSite of val.children) {
                            childSite.levelId = dropId
                        }
                    }

                    dragItem = { ...val }
                }

                // 获取目标level的第一个，site/folder
                if (!dropItem && val._id !== dragId && val.levelId === dropId) {
                    dropItem = { ...val }
                }
                if (dragItem && dropItem) break
            }

            // 前端重新排序
            const sitesNew = dropItem ? reSort(sites, dragItem, dropItem) : sites
            dispatch.user.sitesSet(sitesNew)

            // 服务端重新排序
            await dispatch.user.sitesFoldersLevelsSortXhr({ sitesFolders: sitesNew })
        },
        async levelSiteGet (payload, rootState) {
            // const userId = payload && payload.userId ? payload.userId : rootState.public.userInfo.userId
            // 服务会自动从cookie中获取userId，在此userId参数暂时不用再传
            const params = {
                type: 'get',
                noLoading: true,
                url: user.levelsite
            }
            if (payload && payload.req) params.req = payload.req
            const res = await axiosAjax(params)
            if (res && res.code === 1) {
                dispatch.user.sitesSet(res.data.sites)
                dispatch.user.levelsSet(res.data.levels)
            }
            return res
        },
        async outerLinkGetSetting ({ userName }, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: user.outerLinkGetSetting,
                params: { userName }
            })
            if (res.code === 1) {
                dispatch.user.levelsSet(res.data.levels)
                dispatch.user.sitesSet(res.data.sites)

                const levels = res.data.levels
                levels && dispatch.user.setCurlevel(levels.length > 0 ? levels[0]._id : null)

                delete res.data.levels
                delete res.data.sites
                dispatch.public.settingData(res.data)
            }
            return res
        },
        async addToMine ({ levelId, siteId }, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                url: user.addToMine,
                params: { levelId, siteId }
            })
            if (res && res.code === 1) {
                dispatch.user.sitesSet(res.data)
            }
            return res
        },
        async recommendToOffcial ({ siteId }, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                url: user.recommendToOffcial,
                params: { siteId }
            })
            return res
        },
        async getSiteInfo ({ url }, rootState) {
            const res = await axiosAjax({
                type: 'post',
                url: user.getSiteInfo,
                params: { url }
            })
            return res
        },
        async importBookmark ({ checked, levelId }, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'post',
                url: user.importBookmark,
                params: { checked, levelId }
            })
            return res
        },
        async exportBookmark (payload, rootState) {
            const userId = rootState.public.userInfo.userId
            if (!userId) return { code: -100, msg: '请登录或注册' }

            const res = await axiosAjax({
                type: 'get',
                url: user.exportBookmark
            })
            return res
        }
    })
}
