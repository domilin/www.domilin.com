import React, { Component } from 'react'

class ToastBox extends Component {
    constructor () {
        super()
        this.transitionTime = 300
        this.state = { notices: [] }
    }

    getNoticeKey = () => {
        const { notices } = this.state
        return `notice-${new Date().getTime()}-${notices.length}`
    }

    removeNotice = (key) => {
        const { notices } = this.state
        this.setState({
            notices: notices.filter((notice) => {
                if (notice.key === key) {
                    if (notice.onClose) setTimeout(notice.onClose, this.transitionTime)
                    return false
                }
                return true
            })
        })
    }

    addNotice = (notice) => {
        const { notices } = this.state
        notice.key = this.getNoticeKey()

        // notices.push(notice) // 展示所有的提示
        notices[0] = notice // 仅展示最后一个提示

        this.setState({ notices })
        if (notice.duration > 0) {
            setTimeout(() => {
                this.removeNotice(notice.key)
            }, notice.duration)
        }
        return () => {
            this.removeNotice(notice.key)
        }
    }

    render () {
        const { notices } = this.state
        const icons = {
            info: 'toast-info',
            success: 'toast-success',
            error: 'toast-error',
            loading: 'toast-loading'
        }
        return (
            <div className="toast-wrapper">
                {notices.map(notice => (
                    <div
                        onClick={() => this.removeNotice(notice.key)}
                        className="toast-mask"
                        key={notice.key}>
                        <div className='toast-content'>
                            <div className={`toast-icon ${icons[notice.type]}`}/>
                            <div className='toast-text' style={{ display: notice.content === '' ? 'none' : '' }}>{notice.content}</div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default ToastBox
