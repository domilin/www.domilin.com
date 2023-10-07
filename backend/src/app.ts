import * as cookieParser from "cookie-parser";
import * as path from "path";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as hpp from "hpp";
import * as compression from "compression";
import * as expressWinston from "express-winston";

import logger from "./utils/logger";
import { Route } from "./interfaces/public.interface";
import errorMiddleware from "./middlewares/error.middleware";
import { connectToRedis } from "./utils/redisClient";
import connectToMongo from "./utils/mongoClient";
import PassportAuth from "./utils/passportAuth";
import { PORT, DOMAIN } from "./config";
const passport = new PassportAuth();

class App {
  public app: express.Application;
  public port: string | number;
  public envProd: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = PORT || 3000;
    this.envProd = process.env.NODE_ENV === "production" ? true : false;

    connectToRedis();
    connectToMongo();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);

    // 日志搜集
    expressWinston.requestWhitelist.push("body"); // 把post参数打印至日志文件
    this.initializeLogger();
    // 错误处理
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    if (this.envProd) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(
        cors({
          origin: DOMAIN,
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          credentials: true,
        })
      );
    } else {
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(passport.initialize());
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(express.static(path.join(`${path.join(__dirname)}/../static`)));
    this.initializeLogger();
  }

  private initializeRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeLogger(): void {
    this.app.use(
      expressWinston.logger({
        winstonInstance: logger,
      })
    );
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  // server.js监听端口调用
  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 App listening on the port ${this.port}`);
    });
  }

  // 测试程序获取app实例方法
  public getServer(): express.Application {
    return this.app;
  }
}

export default App;
