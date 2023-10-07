import * as redis from "redis";
import { promisify } from "util";
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_HOST_LOCAL,
  REDIS_PORT_LOCAL,
  redisPasswordLocal,
} from "../config";

let redisHost: string = REDIS_HOST;
let redisPort: number = parseInt(`${REDIS_PORT}`);
let redisPsd: string = REDIS_PASSWORD;
const envProd = process.env.NODE_ENV === "production" ? true : false;
if (!envProd) {
  redisHost = REDIS_HOST_LOCAL;
  redisPort = parseInt(`${REDIS_PORT_LOCAL}`);
  redisPsd = redisPasswordLocal;
}
export const client = redis.createClient({
  host: redisHost,
  port: redisPort,
});
client.auth(`${redisPsd}`);

export const connectToRedis = (): void => {
  if (envProd) client.auth(`${REDIS_PASSWORD}`);
  client.on("connect", (err) => {
    if (!err) {
      console.log("Reids connection success");
    } else {
      console.log("Reids connection error. Please make sure Reids is running. " + err);
    }
  });
  client.select("0", function (err) {
    if (err) console.log(err);
    console.log("Redis is connected 0!");
  });
  client.on("error", (err) => {
    throw new Error(err);
  });
};
export const expireAsync = promisify(client.expire).bind(client); // 设置过期时间
export const existsAsync = promisify(client.exists).bind(client); // 判断键值是否存在
export const delAsync = promisify(client.del).bind(client); // 删除
export const getAsync = promisify(client.get).bind(client); // 获取单个值
export const setAsync = promisify(client.set).bind(client); // 设置单个值
export const hmsetAsync = promisify(client.hmset).bind(client); // 设置多个值，以json形式
export const hgetallAsync = promisify(client.hgetall).bind(client); // 获取多个值，以json形式
