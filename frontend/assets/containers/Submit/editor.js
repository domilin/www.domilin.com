import hljs from 'highlight.js'
import Toast from '../../components/Toast'
import { staticDomain } from '../../../config/config'

const toolbarOptions = [
    [{ header: [2, 3, false] }],
    [{ 'header': 2 }, 'bold', 'italic', 'underline', 'strike'],
    ['blockquote'],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    // ['link', 'image', 'video'],
    ['link', 'image', 'code-block'],
    ['clean']
]

export default ({ dispatch, setEditor }) => {
    const MediaQuill = require('media-quill')

    const Delta = MediaQuill.import('delta')
    const qlClean = function (value) {
        let range = this.quill.getSelection(true)
        let delta2 = this.quill.getContents(range.index, range.length)
        let delta = new Delta().retain(range.index + range.length)
        delta2.ops = delta2.ops.map(item => {
            if (!item.insert) {
                return item
            }

            if (typeof item.insert !== 'object') {
                return {
                    insert: item.insert
                }
            }

            switch (Object.keys(item.insert)[0]) {
                case 'LinkBlot':
                    return {
                        insert: item.insert.LinkBlot.text
                    }
                default:
                    return {
                        insert: item.insert
                    }
            }
        })
        delta = delta.concat(delta2)
        this.quill.updateContents(delta, MediaQuill.sources.USER)
        this.quill.deleteText(range.index, range.length)

        this.quill.videoInit()
    }

    const options = {
        modules: {
            syntax: {
                highlight: text => hljs.highlightAuto(text).value
            },
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    'clean': qlClean
                }
            },
            imageResize: {},
            clipboard: {
                imageUpload: async (url) => {
                    const res = await dispatch.public.uploadUrlImage({ url })
                    if (res.code !== 1) {
                        Toast.info(res.msg)
                        return
                    }
                    return staticDomain + res.data
                }
            },
            mediaUploader: {
                imageUpload: async (file) => {
                    if ((file.size / 1024).toFixed(0) > 2048) {
                        Toast.info('图片请小于2M')
                        return
                    }

                    const res = await dispatch.public.uploadArticleImage({
                        article: file
                    })
                    if (res.code !== 1) {
                        Toast.info(res.msg)
                        return
                    }
                    return staticDomain + res.data.url
                },
                videoUpload: async (file) => {
                    // toolbar已隐藏视频上传
                    const uploadUrl = await new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('https://hx24-media.huoxing24.com/video/news/2020/06/18/20200618082120636599.mp4')
                        }, 100000)
                    })

                    return uploadUrl
                }
            }
        },
        placeholder: '请输入博文内容',
        theme: 'snow'
    }
    const editorQuill = new MediaQuill('#editorQuill', options)
    setEditor(editorQuill)

    // 添加全屏按钮
    const fullscreenIcon = `<svg class="ql-fullscreen-svg" viewBox="0 0 1024 1024"><path d="M160 96h192q14.016 0.992 23.008 10.016t8.992 22.496-8.992 22.496T352 160H160v192q0 14.016-8.992 23.008T128 384t-23.008-8.992T96 352V96h64z m0 832H96v-256q0-14.016 8.992-23.008T128 640t23.008 8.992T160 672v192h192q14.016 0 23.008 8.992t8.992 22.496-8.992 22.496T352 928H160zM864 96h64v256q0 14.016-8.992 23.008T896 384t-23.008-8.992T864 352V160h-192q-14.016 0-23.008-8.992T640 128.512t8.992-22.496T672 96h192z m0 832h-192q-14.016-0.992-23.008-10.016T640 895.488t8.992-22.496T672 864h192v-192q0-14.016 8.992-23.008T896 640t23.008 8.992T928 672v256h-64z" p-id="8486"></path></svg>`
    const formats = document.createElement('span')
    formats.setAttribute('class', 'ql-formats ql-fullscreen-formats')
    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('class', 'ql-fullscreen')
    button.innerHTML = fullscreenIcon
    formats.appendChild(button)
    document.querySelector('.ql-toolbar').appendChild(formats)
}
