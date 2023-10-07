import * as moment from "moment";

// MongoDB
export const MONGO_USER = "admin";
export const MONGO_PASSWORD = "YourPassword";
export const MONGO_PATH = "@localhost=27017";
export const MONGO_DATABASE = "domilin";
export const MONGODB_URI_LOCAL = "mongodb://localhost=27017/domilin";

// Redis
export const REDIS_HOST = "localhost";
export const REDIS_PORT = 6379;
export const REDIS_PASSWORD = "YourPassword";
export const REDIS_HOST_LOCAL = "localhost";
export const REDIS_PORT_LOCAL = 6379;
// export const REDIS_PASSWORD_LOCAl = "123456";
export const redisPasswordLocal = "123456";

// JWT
export const JWT_SECRET = "Domilin891014#";
export const JWT_ISSUER = "domilin"; // jwt签发者
export const JWT_AUDIENCE = "domilin-users"; // 接收jwt的一方
export const JWT_ALG = "HS256";
export const JWT_EXPIRY = moment().utc().add({ days: 7 }).unix(); // 以秒为单位

// Server
export const PORT = 3080;
export const DOMAIN = "https://www.domilin.com";
export const EMAIL_CODE_EXPIRY = 60 * 10; // 以秒为单位
export const GRAPH_CODE_EXPIRY = 60 * 10; // 以秒为单位

const prod = process.env.NODE_ENV === "production";

// 新用户默认自定义导航firstLevelId
export const FIRSTLEVELID = prod ? "5f20f7278f604c33991e740a" : "61b4ce22bab2e2dfb4de3903";

// 前端官方账号
export const OFFICIALUSERID = prod ? "5f3f2d3f6a36725e79059c3e" : "5f3278597a43cb28b43d174c";

// 用户推荐一级导航+二级导航id
export const RECOMMENDFIRSTLEVELID = prod ? "5f27ecece1337d7b72cd5b48" : "61b4d67f6969f7f8c51047ca";
export const RECOMMENDSECONDLEVELID = prod
  ? "5f27ed20e1337d7b72cd5b49"
  : "61b4d6936969f7f8c51047cb";
