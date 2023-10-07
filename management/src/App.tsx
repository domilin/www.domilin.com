import React, { Component, Suspense } from "react";
import { renderRoutes } from "react-router-config";

import { RadioChangeEvent } from "antd/lib/radio";
import { Locale } from "antd/lib/locale-provider";
import moment from "moment/moment";
import { ConfigProvider } from "antd/lib";
import { IntlProvider } from "react-intl/lib/react-intl";
import enUS from "antd/es/locale/en_US";
import zhCN from "antd/es/locale/zh_CN";
import zhCNSelf from "./locales/zh-cn";
import enUSSelf from "./locales/en-us";
import "moment/locale/zh-cn";
import routes from "./routes/index";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
moment.locale("zh-cn");

interface Messages {
  [key: string]: string;
}
type LocaleName = "enus" | "zhcn";
interface EState {
  localeName: LocaleName;
  locale: Locale;
  messages: Messages;
}

export default class App extends Component<unknown, EState> {
  state = {
    localeName: "zhcn" as LocaleName,
    locale: zhCN,
    messages: zhCNSelf
  };
  changeLocale = (event: RadioChangeEvent): void => {
    this.setState({
      localeName: event.target.value
    });
    switch (event.target.value) {
      case "enus":
        this.setState({
          locale: enUS,
          messages: enUSSelf
        });
        moment.locale("en");
        break;
      case "zhcn":
        this.setState({
          locale: zhCN,
          messages: zhCNSelf
        });
        moment.locale("zh-cn");
        break;
      default:
        this.setState({
          locale: zhCN,
          messages: zhCNSelf
        });
        moment.locale("zh-cn");
    }
  };
  render(): JSX.Element {
    return (
      <IntlProvider locale="en" messages={this.state.messages}>
        <ConfigProvider locale={this.state.locale}>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              {renderRoutes(routes, {
                localeName: this.state.localeName,
                changeLocale: this.changeLocale
              })}
            </Suspense>
          </ErrorBoundary>
        </ConfigProvider>
      </IntlProvider>
    );
  }
}
