import { BaseAuth, AuthConfig } from '@nocobase/auth';
import { AuthModel } from '@nocobase/plugin-auth';
import { DingTalkApi } from '../openapi/dingTalkApi';

export type AuthConfigOptions = {
  public: {
    autoSignup: boolean;
  }
  internal: {
    userCheckType: 'orgEmail' | 'personalEmail' | 'mobile';
    emailDomains: string[];
    appKey?: string;
    appSecret?: string;
  }
}

export class DingTalkAuth extends BaseAuth {

  #authConfigOptions: AuthConfigOptions;
  #dingTalkApi: DingTalkApi;

  constructor(config: AuthConfig) {
    // 设置用户数据表
    const userCollection = config.ctx.db.getCollection('users');
    super({ ...config, userCollection });
    this.#authConfigOptions = config.options as AuthConfigOptions;
    this.#dingTalkApi = new DingTalkApi(this.#authConfigOptions.internal.appKey, this.#authConfigOptions.internal.appSecret)
    this.#authConfigOptions = {
      ...this.#authConfigOptions,
      internal: {
        userCheckType: this.#authConfigOptions.internal.userCheckType,
        emailDomains: config.options.internal.emailDomain?.split('\s*,\s*') || [],
      }
    }
  }

  async validate() {
    const ctx = this.ctx;
    const { authenticator: authenticatorName, code, authCode, state }  = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, '认证器不能为空');
    }
    if (!code) {
      ctx.throw(400, 'OAuth 2.0 临时授权码不存在');
    }

    const auth = this;

    const tokenRes = await auth.dingTalkApi.oauth2.userAccessToken('authorization_code', code);
    const userRes = await auth.dingTalkApi.contact.getUser('me', tokenRes.accessToken);
    const { userid: userId } = await auth.dingTalkApi.contact.getUserIdByUnionId(userRes.unionId);

    const authenticator = this.authenticator as AuthModel;
    let au = await authenticator.findUser(userId);
    if (au) {
      // 用户存在
      return au;
    }

    const userDetail = await auth.dingTalkApi.contact.getUserDetail(userId);
    const user = {
      userId: userId,
      unionId: userRes.unionId,
      mobile: userRes.mobile,
      email: userRes.email,
      name: userDetail.name || userRes.nick,
      orgEmail: userDetail.org_email,
    }

    let filter: any;
    if (this.#authConfigOptions.internal.userCheckType === 'personalEmail') {
      if (!user.email) {
        ctx.throw(400, '用户邮箱未配置');
      }
      if (!this.#authConfigOptions.internal.emailDomains.some(a => userDetail.email.endsWith(a))) {
        ctx.throw(400, `邮箱域名未启用 ${user.email}`);
      }
      filter = {
        email: user.email,
      }
    } else if (this.#authConfigOptions.internal.userCheckType === 'orgEmail') {
      if (!user.orgEmail) {
        ctx.throw(400, '用户企业邮箱未配置');
      }
      if (!this.#authConfigOptions.internal.emailDomains.some(a => userDetail.org_email.endsWith(a))) {
        ctx.throw(400, `邮箱域名未启用 ${user.orgEmail}`);
      }
      filter = {
        email: user.orgEmail,
      }
    } else {
      filter = {
        phone: user.mobile
      }
    }

    // 已有用户，则进行绑定
    let ncUser = await this.userRepository.findOne({ filter });
    if (ncUser) {
      await this.authenticator.addUser(user, {
        through: {
          uuid: userId,
        },
      });
      return await authenticator.findUser(userId);
    }

    // 新用户
    if (this.#authConfigOptions.public.autoSignup) {
      return await authenticator.findOrCreateUser(userId, {
        nickname: user.name,
        username: filter.email?.split('@')?.[0] || user.mobile || userId,
        email: filter.email,
        phone: user.mobile,
        meta: JSON.stringify(user),
      });
    }

    return null;
  }

  get dingTalkApi() {
    return this.#dingTalkApi;
  }

  get authConfigOptions() {
    return this.#authConfigOptions;
  }
}
