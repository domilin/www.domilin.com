import React, { useState } from "react";
import { Layout, Avatar, Drawer, Radio } from "antd/lib";
import { RadioChangeEvent } from "antd/lib/radio";
import { useIntl } from "react-intl/lib/react-intl";
import { MenuUnfoldOutlined, MenuFoldOutlined, GlobalOutlined } from "@ant-design/icons/lib";
import logo from "../../public/images/logo-white.png";
const { Header } = Layout;

interface EProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  localeName?: string;
  changeLocale?: (event: RadioChangeEvent) => void;
}
export default ({ localeName, collapsed, setCollapsed, changeLocale }: EProps): JSX.Element => {
  const [visible, setVisible] = useState<boolean>(false);
  const { formatMessage: f } = useIntl();
  return (
    <Header className="site-layout-header" style={{ padding: 0 }}>
      <div className="header-left">
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: "trigger",
          onClick: () => setCollapsed(!collapsed)
        })}
      </div>
      <div className="header-right">
        <Avatar className="user-avatar" icon={<img className="user-avatar-use-logo" src={logo} alt="Domilin" />} />
        <div className="user-name">哆咪</div>
        <div className="change-language" onClick={(): void => setVisible(true)}>
          <GlobalOutlined />
        </div>
        <Drawer
          title={f({ id: "changeLocaleTitle" }, { type: localeName ? localeName.toUpperCase() : "" })}
          placement="right"
          closable={false}
          onClose={(): void => setVisible(!visible)}
          visible={visible}
        >
          <Radio.Group value={localeName} onChange={changeLocale}>
            <Radio.Button key="en" value="enus">
              English
            </Radio.Button>
            <Radio.Button key="cn" value="zhcn">
              中文
            </Radio.Button>
          </Radio.Group>
        </Drawer>
      </div>
    </Header>
  );
};
