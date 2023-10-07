import LoggerRoute from "./logger.route";
import IndexRoute from "./index.route";
import AuthRoute from "./auth.route";
import ArticleRoute from "./article.route";
import WebsiteRoute from "./website.route";
import PublicRoute from "./public.route";
import AdminAuthRoute from "./admin.auth.route";
import AdminWebsiteRoute from "./admin.wallpaper.route";
import AdminWallpaperRoute from "./admin.website.route";
import AdminArticleRoute from "./admin.article.route";
import UserRoute from "./user.route";
import SpiderRoute from "./spider.route";
import Wallpaper from "./wallpaper.route";
import Poster from "./poster.route";

export default [
  new LoggerRoute(),
  new IndexRoute(),
  new AuthRoute(),
  new AdminAuthRoute(),
  new AdminWebsiteRoute(),
  new AdminWallpaperRoute(),
  new AdminArticleRoute(),
  new PublicRoute(),
  new ArticleRoute(),
  new WebsiteRoute(),
  new UserRoute(),
  new SpiderRoute(),
  new Wallpaper(),
  new Poster(),
];
