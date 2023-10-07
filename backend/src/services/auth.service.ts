import * as nodemailer from "nodemailer";
import { create } from "svg-captcha";
import { decodePassword, settingReturnParams } from "../utils";
import { createToken } from "../utils/passportAuth";
import userModel from "../models/user.model";
import { secondLevelModel, websiteModel } from "../models/website.model";
import { expireAsync, setAsync, delAsync, getAsync } from "../utils/redisClient";
import { ServiceReturn } from "../interfaces/public.interface";
import { ValidateCode } from "../interfaces/auth.interface";
import { User, Site, Level } from "../interfaces/user.interface";
import { SignupDto, ChangePsdDto, BindEmailDto, ForgetPsdDto, SignoutDto } from "../dtos/auth.dto";
import { JWT_EXPIRY, GRAPH_CODE_EXPIRY, EMAIL_CODE_EXPIRY, FIRSTLEVELID } from "../config";
import { BaseJson } from "../interfaces/types";

/** @desc 图形验证码流程---邮箱验证码类似
 * 生成端图形验证码
 * 1:生成uuid, 图形验证码text, 图形验证码data为svg
 * 2:以uuid为key, text为value存到redis中。第一次uuid()生成，第二次在/auth/graph参数中把第一次的存在cookie/localstorage通过参数传上来.(小写存入)
 * 3:设置过期时间为1分钟
 * 注册获取
 * 1:dto中检测参数必须有uuidKey, graphCode/emailCode
 * 2:用获取到的uuidKey在redis中查找text，若未查到表明已过期
 * 3:检测客户端传进来的graphCode/emailCode是否等于，redis中的text。不相等表明不正确。(小写对比)
 * 客户端
 * 1:请求(/auth/graph)(/auth/email)接口获取到uuidKey设置到cookie/localstorage中，并显示获取到的svg。此后再次请求都带上此uuid
 * 2:在需要图形验证的地方(如:登录),附带参数uuidKey,grapCode
 * 总结
 * 后端在graphValidate去取与存取，signup读取并对比===uuidKey
 * 前端(/auth/graph)(/auth/email)存到cookie参数并带上。(/auth/graph)(/auth/email)参数读取cookie并带上===uuidKey
 */
export default class AuthService {
  public async setting(params: BaseJson): ServiceReturn<User> {
    if (!params) return { code: 11, msg: "Params is required" };
    if (!params.userId) return { code: 12, msg: "UserId is required" };
    const userId = params.userId;
    delete params.userId;
    const userFound = await userModel.findOneAndUpdate({ _id: userId }, params, { new: true });
    return { code: 1, msg: "Setting success", data: userFound };
  }

  public async getSetting(userId: string): ServiceReturn<User> {
    const userFound: User = await userModel.findOne({ _id: userId }, settingReturnParams);
    return { code: 1, msg: "Get setting success", data: userFound };
  }

  public async changePsd(params: ChangePsdDto): ServiceReturn<User> {
    const { oldPsd, newPsd, userId } = params;
    // 解密密码为用户原始输入密码
    const oldPassword = decodePassword(oldPsd);

    // 比对老密码是否正确
    const userFound: User = await userModel.findById(userId);
    if (!userFound) return { code: 11, msg: "User not exist" };
    const isMatch: boolean = await userFound.comparePassword(oldPassword);
    if (!isMatch) return { code: 12, msg: "You're password not matching" };

    // 更新用户密码
    userFound.password = decodePassword(newPsd);
    await userFound.save();

    // mongoose对象转为正常对象
    const userInfo = userFound.toObject();
    delete userInfo.password;
    return { code: 1, msg: "Password changed success", data: userFound };
  }

  public async graphValidate(uuidKey: string): ServiceReturn<ValidateCode> {
    const graphCreate = create({
      size: 4,
      ignoreChars: "0o1iIl",
      noise: 3,
      color: true,
      background: "#fff",
      fontSize: 60,
    });
    const key = `graphcode:${uuidKey}`;

    await setAsync(key, graphCreate.text.toLowerCase());
    await expireAsync(key, GRAPH_CODE_EXPIRY);
    return { code: 1, msg: "Graph code success", data: { uuidKey, code: graphCreate.data } };
  }

  public async emailValidate(email: string, uuidKey: string): ServiceReturn<ValidateCode> {
    const code = this.generateValidteCode();
    const options = {
      from: "Domilin<domilin@qq.com>",
      to: email,
      bcc: "密送",
      subject: "DOMILIN 哆咪书签 邮箱验证码",
      text: code,
      html: this.emailHtml(code),
    };
    const info = await this.mailTransport.sendMail(options);
    const key = `emailcode:${uuidKey}`;
    await setAsync(key, code.toLowerCase());
    await expireAsync(key, EMAIL_CODE_EXPIRY);
    return {
      code: 1,
      msg: "Email validate code send success",
      data: { uuidKey, info: info.response },
    };
  }

  /** @desc 找回密码
   * 错误码: 11邮箱验证码过期，12邮箱验证码错误，13图形验证码过期，14图形验证码错误，15邮箱未绑定
   */
  public async forgetPsd(params: ForgetPsdDto): ServiceReturn<User> {
    const { uuidKey, emailCode, graphCode, email, password } = params;
    // 从redis中获取uuidKey的邮箱验证码进行对比
    const emailCodeFound = await getAsync(`emailcode:${uuidKey}`);
    if (!emailCodeFound) return { code: 11, msg: "Email verification code expired" };
    if (emailCodeFound !== emailCode.toLowerCase())
      return { code: 12, msg: "Email verification code error" };

    // 从redis中获取uuidKey的图形验证码进行对比
    const graphCodeFound = await getAsync(`graphcode:${uuidKey}`);
    if (!graphCodeFound) return { code: 13, msg: "Graphic verification code expired" };
    if (graphCodeFound !== graphCode.toLowerCase())
      return { code: 14, msg: "Graphic verification code error" };

    // 查找用户是否已经注册
    const userFound: User = await userModel.findOne({ email: email }, { password, email });
    if (!userFound) return { code: 15, msg: `You're email ${email} don't exist` };

    // 解密密码为用户原始输入密码
    params.password = decodePassword(password);

    // 更新用户密码
    userFound.password = params.password;
    await userFound.save();

    // mongoose对象转为正常对象
    const userInfo = userFound.toObject();
    delete userInfo.password;
    return { code: 1, msg: "Password changed success", data: userFound };
  }

  /** @desc 为了降低用户注册门槛，只需要输入用户名和密码，即可注册 */
  public async signUp(params: SignupDto): ServiceReturn<User> {
    const { userName, password } = params;

    // 用户名字符数应当: 6-16个字符
    if (userName && (userName.length < 6 || userName.length > 16))
      return { code: 11, msg: `User name character should > 6 and < 16` };

    // 验证用户名不能包含中文跟特殊字符
    const userNameReg = /^[a-zA-Z0-9_]{0,}$/;
    if (!userNameReg.test(userName))
      return { code: 11, msg: `User name must use english character` };

    // 查找用户是否已经注册
    const userFound: User = await userModel.findOne({ userName }, { password, userName });
    if (userFound) return { code: 12, msg: `Your userName already exist` };

    // 给密码加盐,不明文存储密码
    /** model的pre前置方法(中间件)save已自动保存时加salt */

    // 解密密码为用户原始输入密码
    params.password = decodePassword(password);

    const secondLevels = await secondLevelModel
      .find({ firstLevelId: FIRSTLEVELID })
      .sort({ sort: 1 });
    if (secondLevels) {
      const levels: Level[] = [];
      secondLevels.map(function (item) {
        levels.push({
          _id: item._id,
          name: item.name,
          icon: item.icon,
          sort: item.sort + 1,
        });
      });
      params.levels = levels;
    }

    // ---------------------默认推荐导航网址
    const websiteList = await websiteModel
      .find({ recommendFirstLevelId: FIRSTLEVELID })
      .sort({ sort: 1 });
    if (websiteList) {
      const sites: Site[] = [];
      websiteList.map(function (item, index) {
        sites.push({
          _id: item._id,
          name: item.name,
          sort: index,
          icon: item.icon,
          iconType: "official",
          officialIcon: item.icon,
          intro: item.intro,
          url: item.url,
          background: item.background,
          levelId: item.recommendSecondLevelId,
        });
      });
      params.sites = sites;
    }

    // 创建用户到数据库
    const createUser: User = await userModel.create(params);

    return { code: 1, msg: "Signup success", data: createUser };
  }

  /** @desc 绑定邮箱 */
  public async bindEmail(params: BindEmailDto): ServiceReturn<User> {
    const { email, uuidKey, emailCode, userId } = params;

    // 查找用户是否存在
    const userFound = await userModel.findById(userId);
    if (!userFound) return { code: 11, msg: "User don't exist" };

    // 查找邮箱是否已经被绑定
    const emailFound = await userModel.find({ _id: userId, email });
    if (emailFound && emailFound.length > 0) return { code: 12, msg: "Email has been bound" };

    // 从redis中获取uuidKey的邮箱验证码进行对比
    const emailCodeFound = await getAsync(`emailcode:${uuidKey}`);
    if (!emailCodeFound) return { code: 13, msg: "Email verification code expired" };
    if (emailCodeFound !== emailCode.toLowerCase())
      return { code: 14, msg: "Email verification code error" };

    userFound.email = email;
    await userFound.save();

    return { code: 1, msg: "Bind email success" };
  }

  /** @desc 错误码: 11用户不存在，12密码不匹配 */
  public async signIn(userName: string, password: string): ServiceReturn<User> {
    // 可能是用户名登录，也可能是邮箱登录

    // 根据用户名查找是否存在此用户
    let userFound = null;
    const userNameFound: User = await userModel.findOne(
      { userName: userName },
      { password: 1, userName: 1 }
    );
    if (userNameFound) userFound = userNameFound;

    // 根据邮箱查找是否存在此用户
    const userEmailFound: User = await userModel.findOne(
      { email: userName },
      { password: 1, email: 1, userName: 1 }
    );
    if (userEmailFound) userFound = userEmailFound;

    // 邮箱，用户名都未找到--->用户不存在
    if (!userNameFound && !userEmailFound) return { code: 11, msg: "User don't exist" };

    // 解密密码为用户原始输入密码
    const originalPassword = decodePassword(password);

    // 比对密码是否正确
    const isMatch: boolean = await userFound.comparePassword(originalPassword);
    if (!isMatch) return { code: 12, msg: "You're password not matching" };

    // 创建jwt-token
    const token = createToken(userFound);

    // 把token存入redis{_id: token}，在需要jwt验证的地方获取
    const key = `token:${userFound._id}`;
    await setAsync(key, token);
    await expireAsync(key, JWT_EXPIRY);

    // mongoose对象转为正常对象
    const userInfo = userFound.toObject();
    delete userInfo.password;
    return { code: 1, msg: "Signin success", data: { ...userInfo, token } };
  }

  public async singOut(params: SignoutDto): ServiceReturn<void> {
    await delAsync(`token:${params.userId}`);
    return { code: 1, msg: "Signout success" };
  }

  private emailHtml(emailValidateCode: string): string {
    return `<div style="padding: 10px 0; color: #333; font-size: 14px;">
    您的邮箱验证码为: <span style="padding: 5px 10px; background: #eee; margin-left: 10px; color: #666">${emailValidateCode}</span>
    </div>`;
  }

  private generateValidteCode(): string {
    //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    let str = "";
    for (let i = 0; i < 4; ++i) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }

  private mailTransport = nodemailer.createTransport({
    // host: "", //邮箱服务的主机，如smtp.qq.com
    // port: "", //对应的端口号
    service: "qq",
    secure: true, //安全方式发送,建议都加上
    auth: {
      user: "domilin@qq.com",
      pass: "gebygfyrfsbmbbcb",
    },
  });
}
