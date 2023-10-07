import React, { Component } from 'react'
import { logReport } from '../../public/js'

import './index.scss'

export default class ErrorBoundary extends Component {
  state = {
      err: Error('Unexpected Error'),
      hasError: false
  };

  static getDerivedStateFromError (error) {
      // 更新 state 使下一次渲染能够显示降级后的 UI
      return {
          err: error,
          hasError: true
      }
  }

  componentDidCatch (error, errorInfo) {
      console.log(errorInfo)
      // 你同样可以将错误日志上报给服务器
      logReport({
          message: 'client-app-err-react',
          errMsg: error && error.message,
          timestampClient: new Date().getTime(),
          componentStack: errorInfo && errorInfo.componentStack,
          stack: error && error.stack,
          framework: true
      })
  }

  render () {
      if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
          const { err } = this.state
          return (
              <div className="error-boundary">
                  <h1>{err.message}</h1>
                  <pre>{err.stack}</pre>
              </div>
          )
      }

      return this.props.children
  }
}
