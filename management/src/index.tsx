import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { logReport } from "./public";

import { store } from "./models/store";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
window.reduxStore = store; // 挂载到全局对象上，ajax未登录时使用

// ErrorBoundary不能捕获异步与事件处理错误，用原生JS的error监控
// const logErrorToServer = () => {};
window.onerror = function(message, source, lineno, colno, error): void {
  logReport({
    message: "client-app-err-window",
    errMsg: message,
    timestampClient: new Date().getTime(),
    source: source,
    lineno: lineno,
    colno: colno,
    stack: error && error.stack,
    framework: true
  });
};

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
