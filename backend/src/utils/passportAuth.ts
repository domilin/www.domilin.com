import { Request, Handler } from "express";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";
import * as passport from "passport";
import * as passportJwt from "passport-jwt";
import { VerifiedCallback, Strategy } from "passport-jwt";
import UserModel from "../models/user.model";
import { User } from "../interfaces/user.interface";
import { PassportAuthenticate } from "../interfaces/types";
import { existsAsync } from "./redisClient";
import { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_ALG, JWT_EXPIRY } from "../config";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

/** @desc passport passport-jwt使用逻辑
 * 1: App.js中使用app.use(passport.initialize())初始化
 * 2: passport.use(new JwtStrategy(options, callback))初始化策略
 *    options: 解密token所需要的参数，跟加密时对应
 *    callback(req--框架request, payload--通过上述options解密之后的数据, done--返回给auth.middleware的callback验证信息)
 *    过期时间expiresIn此处为多少毫秒时间，jsonwebtoken会根据此值计算什么时候过期，自动返回是否过期
 * 3: login中createToken并返回给前端存进，其它请求时header带authorization=token
 * 4: 需要验证码的接口添加auth.middleware中间件，告知passport此接口要验证，passport根据Strategy策略开始验证token是否正确。token由客户端request的header中传上来
 * @desc token 过期说明
 * jwt中自带有是否过期判断
 * 为后期扩展+注销时前端没有删除authorization=token情况，注销时删除redis中此token记录
 * 在token存储到了redis中，过期时间跟jwt过期时间一致
 * 两层过期时间判断：redis判断，jwt自身判断
 */

/** @desc 登录时创建token */
export const createToken = (user: User): string => {
  const payload = { _id: user._id }; // 存放有效信息，用于验证时查询用户，此处放用户id
  const secret: string = JWT_SECRET; // secret保存在服务器端
  const expiresIn: number = JWT_EXPIRY;
  const options: jwt.SignOptions = {
    jwtid: uuid.v4(), // jwt的唯一身份标识，主要用来作为一次性token,从而回避重放攻击
    expiresIn: expiresIn, // jwt的过期时间，这个过期时间必须要大于签发时间
    issuer: JWT_ISSUER, // jwt签发者
    audience: JWT_AUDIENCE, // 接收jwt的一方
    algorithm: JWT_ALG, // 声明加密的算法 通常直接使用 HMAC SHA256
  };
  return jwt.sign(payload, secret, options);
};

/** @desc 路由验证中间件调用 */
export const authenticate: PassportAuthenticate = (callback) =>
  passport.authenticate("jwt", { session: false, failWithError: true }, callback);

/** @desc 初始化initialize + strategy。创建策略 */
export default class PasswordAuth {
  public initialize = (): Handler => {
    passport.use(this.strategy());
    return passport.initialize();
  };

  private strategy(): Strategy {
    const options = {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"), // 从请求中提取authorization=token
      passReqToCallback: true, // 请求将被传递到验证回调
      secretOrKey: JWT_SECRET,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: [JWT_ALG],
    };
    return new JwtStrategy(options, async function (
      req: Request,
      payload: User,
      done: VerifiedCallback
    ) {
      try {
        // 检测token是否存在redis中
        const tokenExist = await existsAsync(`token:${payload._id}`);
        if (!tokenExist) {
          return done(null, false, {
            message: "Token has expired",
          });
        }

        // 验证是否有此用户
        const user = await UserModel.findOne({ _id: payload._id });
        if (!user) {
          return done(null, false, {
            message: "The user in the token was not found",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    });
  }
}
