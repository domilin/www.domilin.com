import { axiosAjax } from '../public/js/index'
import { poster } from '../public/js/apis'
import Toast from '../components/Toast'

export async function posterGet (payload) {
    const res = await axiosAjax({
        type: 'get',
        url: poster.poster,
        params: payload
    })
    if (!res) {
        Toast.info('海报获取错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function posterAdd (payload) {
    const res = await axiosAjax({
        type: 'put',
        url: poster.poster,
        params: payload
    })

    if (!res) {
        Toast.info('海报上传错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function posterEdit (payload) {
    const res = await axiosAjax({
        type: 'post',
        url: poster.poster,
        params: payload
    })

    if (!res) {
        Toast.info('海报修改错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function posterDel (payload) {
    const res = await axiosAjax({
        type: 'delete',
        url: poster.poster,
        params: payload
    })

    if (!res) {
        Toast.info('海报删除错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function posterCreate (payload) {
    const res = await axiosAjax({
        type: 'post',
        url: poster.create,
        params: payload
    })

    if (!res) {
        Toast.info('海报制作错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function uploadPosterImg (payload) {
    const res = await axiosAjax({
        type: 'post',
        formData: true,
        url: poster.uploadPosterImg,
        params: payload
    })

    if (!res) {
        Toast.info('海报上传错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function uploadFont (payload) {
    const res = await axiosAjax({
        type: 'post',
        formData: true,
        url: poster.uploadFont,
        params: payload
    })

    if (!res) {
        Toast.info('字体上传错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function settingAdd (payload) {
    const res = await axiosAjax({
        type: 'put',
        url: poster.setting,
        params: payload
    })

    if (!res) {
        Toast.info('海报描述添加错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function settingEdit (payload) {
    const res = await axiosAjax({
        type: 'post',
        url: poster.setting,
        params: payload
    })

    if (!res) {
        Toast.info('海报描述编辑错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function settingDel (payload) {
    const res = await axiosAjax({
        type: 'delete',
        url: poster.setting,
        params: payload
    })

    if (!res) {
        Toast.info('海报描述删除错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function fontGet () {
    const res = await axiosAjax({
        type: 'get',
        url: poster.font
    })

    if (!res) {
        Toast.info('字体获取错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}

export async function fontAdd (payload) {
    const res = await axiosAjax({
        type: 'post',
        url: poster.font,
        params: payload
    })

    if (!res) {
        Toast.info('字体添加错误')
        return
    }
    if (res.code !== 1) {
        Toast.info(res.msg)
        return
    }
    return res
}
