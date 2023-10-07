import React, { useState } from "react";
import { useMount } from "@umijs/hooks/lib";
import { Layout, Menu } from "antd/lib";
import { useDispatch } from "react-redux";
import { menus } from "../../routes/index";
import { RootDispatch } from "../../models/store";
import { urlMatch } from "../../public/index";
import logo from "../../public/images/logo.svg";

const { Sider } = Layout;
const { SubMenu } = Menu;

interface EProps {
  collapsed: boolean;
}
export default ({ collapsed }: EProps): JSX.Element => {
  const [curOpenKeys, setCurOpenKeys] = useState<string[]>([]);
  const [curSelectedKeys, setCurSelectedKeys] = useState<string[]>([]);
  const dispatch: RootDispatch = useDispatch();
  useMount(() => {
    const routeMatch = urlMatch(window.location.pathname);
    const curPath = routeMatch?.path.split("/:")[0];
    let breadcrumb: string[] = [];
    for (const item of menus) {
      if (!item.path && item.children) {
        for (const itemChild of item.children) {
          if (itemChild.path === curPath) {
            breadcrumb = [item.title, itemChild.title];
            setCurSelectedKeys([item.key, itemChild.key]);
            setCurOpenKeys([item.key]);
            break;
          }
        }
      } else {
        if (item.path === curPath) {
          breadcrumb = [item.title];
          setCurSelectedKeys([item.key]);
          break;
        }
      }
    }
    // 设置面包屑菜单
    dispatch.common.breadcrumbData(breadcrumb);
  });
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="logo">
        <img src={logo} alt="Domilin" />
      </div>
      <Menu theme="dark" selectedKeys={curSelectedKeys} openKeys={curOpenKeys} mode="inline">
        {menus.map((item, index) => {
          if (!item.path && item.children) {
            return (
              <SubMenu
                key={item.key}
                title={
                  <span
                    className="menu-item"
                    onClick={(): void => setCurOpenKeys([item.key === curOpenKeys[0] ? "" : item.key])}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </span>
                }
              >
                {item.children.map((itemChild, indexChild) => {
                  return (
                    <Menu.Item key={itemChild.key}>
                      <a href={itemChild.path}>{itemChild.title}</a>
                    </Menu.Item>
                  );
                })}
              </SubMenu>
            );
          } else {
            return (
              <Menu.Item key={item.key}>
                <a href={item.path}>
                  {item.icon}
                  {item.title}
                </a>
              </Menu.Item>
            );
          }
        })}
      </Menu>
    </Sider>
  );
};
