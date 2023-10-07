import React, { lazy } from "react";
import { RouteConfig } from "react-router-config";
import Layout from "../components/Layout";

/** @desc
 * ----------菜单配置----------
 * 跳转为<a>标签刷新页面跳转, 别用<Link>路由跳转，否则不能设置当前(展开，选择)路由, 因为在Menu的useMount中设置的
 * key: selectKey当前选择项, openKey当前展开项
 * path: routes路由配置项，除”/:“参数的路径
 */
import {
  ChromeOutlined,
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  FileImageOutlined,
  FolderOutlined
} from "@ant-design/icons/lib";
export const menus = [
  {
    key: "home",
    path: "/",
    title: "主页",
    icon: <HomeOutlined />
  },
  {
    key: "websiteManage",
    title: "网站管理",
    icon: <ChromeOutlined />,
    children: [
      {
        key: "website",
        path: "/website",
        title: "导航与网址"
      }
    ]
  },
  {
    key: "wallpaperManage",
    title: "壁纸管理",
    icon: <FileImageOutlined />,
    children: [
      {
        key: "wallpaper",
        path: "/wallpaper",
        title: "壁纸列表"
      }
    ]
  },
  {
    key: "articleManage",
    title: "文章管理",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "article",
        path: "/article",
        title: "文章列表"
      }
    ]
  },
  {
    key: "albumManage",
    title: "专辑管理",
    icon: <FolderOutlined />,
    children: [
      {
        key: "album",
        path: "/album",
        title: "专辑列表"
      },
      {
        key: "albumArticle",
        path: "/albumarticle",
        title: "专辑文章编辑"
      }
    ]
  },
  {
    key: "userManage",
    title: "用户管理",
    icon: <UserOutlined />,
    children: [
      {
        key: "user",
        path: "/user",
        title: "用户列表"
      }
    ]
  }
];

/** @desc ----------路由配置---------- */
// const Layout = lazy(() => import("../components/Layout"));
const Home = lazy(() => import("../pages/Home"));
const Website = lazy(() => import("../pages/Website"));
const Article = lazy(() => import("../pages/Article"));
const User = lazy(() => import("../pages/User"));
const Wallpaper = lazy(() => import("../pages/Wallpaper"));
const Album = lazy(() => import("../pages/Album"));
const AlbumArticle = lazy(() => import("../pages/Album/AlbumArticle"));
const NoMatch = lazy(() => import("../pages/NoMatch"));
const Demo = lazy(() => import("../pages/Demo"));

const routes: RouteConfig[] = [
  {
    path: "/demo",
    component: Demo
  },
  {
    component: Layout,
    routes: [
      {
        path: ["", "/"],
        component: Home,
        exact: true,
        strict: true
      },
      {
        path: "/website",
        component: Website
      },
      {
        path: "/article",
        component: Article
      },
      {
        path: "/user",
        component: User
      },
      {
        path: "/wallpaper",
        component: Wallpaper
      },
      {
        path: "/album",
        component: Album
      },
      {
        path: ["/albumarticle", "/albumarticle/:albumId"],
        component: AlbumArticle,
        exact: true,
        strict: false
      },
      {
        path: "*",
        component: NoMatch
      }
    ]
  }
];

export default routes;
