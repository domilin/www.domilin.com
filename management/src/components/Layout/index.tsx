import React, { FC, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { renderRoutes, RouteConfigComponentProps } from "react-router-config";
import { Layout, Breadcrumb } from "antd/lib";
import { RadioChangeEvent } from "antd/lib/radio";
import "./index.scss";
import HeaderSlef from "./Header";
import MenuSelf from "./Menu";
import ErrorBoundary from "../ErrorBoundary";
import Loading from "../Loading";
import Signin from "./Signin";
import { RootState } from "../../models/store";

const { Content } = Layout;

interface Eprops extends RouteConfigComponentProps {
  localeName?: string;
  changeLocale?: (event: RadioChangeEvent) => void;
}

const LayoutWrapper: FC<Eprops> = ({ route, localeName, changeLocale }) => {
  const { breadcrumb } = useSelector((state: RootState) => ({
    breadcrumb: state.common.breadcrumb
  }));
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <Layout>
      <ErrorBoundary>
        <MenuSelf collapsed={collapsed} />
      </ErrorBoundary>
      <Layout className="site-layout">
        <ErrorBoundary>
          <HeaderSlef
            localeName={localeName}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            changeLocale={changeLocale}
          />
        </ErrorBoundary>
        <Content>
          <Signin />
          <Breadcrumb className="site-layout-nav">
            {breadcrumb.map((item: string, index: number) => {
              return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>;
            })}
          </Breadcrumb>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <div className="site-layout-content">{renderRoutes(route && route.routes)}</div>
            </Suspense>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutWrapper;
