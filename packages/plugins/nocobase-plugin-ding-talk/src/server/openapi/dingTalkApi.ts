export type Res<T> = {
  /** 请求ID。 */
  request_id: string;
  /** 返回码。 */
  errcode: number;
  /** 返回码描述。 */
  errmsg: string;
  /** 返回结果。 */
  result: T;
}

export type UserAccessTokenRes = {
  /** 生成的accessToken */
  accessToken?: string;
  /** 生成的refresh_token。可以使用此刷新token，定期的获取用户的accessToken */
  refreshToken?: string;
  /** 超时时间，单位秒。 */
  expireIn?: number;
  /** 所选企业corpId。 */
  corpId?: string;
}

export type UserRes = {
  /** 用户的钉钉昵称。 */
  nick?: string;
  /** 头像URL。 */
  avatarUrl?: string;
  /** 用户的手机号。如果要获取用户手机号，需要在钉钉开发者后台申请个人手机号信息权限 */
  mobile?: string;
  /** 用户的openId。 */
  openId?: string;
  /** 用户的unionId。 */
  unionId?: string;
  /** 用户的个人邮箱。 */
  email?: string;
  /** 手机号对应的国家号。 */
  stateCode?: string;
}

export type UserDetail = {
  /** 员工的userId。 */
  userid: string;
  /** 员工姓名。 */
  name: string;
  /** 员工邮箱。 */
  email?: string;
  /** 员工的企业邮箱。如果员工的企业邮箱没有开通，返回信息中不包含该数据。第三方企业应用不返回该参数。 */
  org_email?: string;
}

export type UserId = {
  /** 联系类型： 0：企业内部员工 1：企业外部联系人 */
  contact_type?: number;
  /** 用户的userid。 */
  userid: string;
}

export function checkResult<T>(res: Res<T>) {
  if (res.errcode !== 0) {
    throw new Error(JSON.stringify(res));
  }
  return res.result;
}

/**
 * 钉钉 API
 */
export class DingTalkApi {
  /**
   * 获取凭证
   */
  #oauth2 = ((api: DingTalkApi) => {
    const baseUrl = 'https://api.dingtalk.com';
    return {
      /**
       * 获取用户token
       * @param grantType 如果使用授权码换token，传authorization_code。如果使用刷新token换用户token，传refresh_token。
       * @param code OAuth 2.0 临时授权码，第三方企业应用需要接入统一授权套件/获取登录用户的访问凭证，获取临时授权码authCode。
       * @param refreshToken OAuth2.0刷新令牌，从返回结果里面获取。过期时间是30天。
       * @returns
       */
      async userAccessToken(grantType: 'authorization_code' | 'refresh_token', code?: string, refreshToken?: string) {
        return api.doRequest<UserAccessTokenRes>('POST', `${baseUrl}/v1.0/oauth2/userAccessToken`, null, {
          clientId: api.#appKey,
          clientSecret: api.#appSecret,
          code,
          refreshToken,
          grantType,
        });
      },
    }
  })(this);

  /**
   * 通讯录
   */
  #contact = ((api: DingTalkApi) => {
    const baseUrl = 'https://api.dingtalk.com';
    return {
      /**
       * 获取用户token
       * @param unionId 用户的unionId。如需获取当前授权人的信息，unionId参数可以传me。
       * @returns
       */
      async getUser(unionId: 'me' | string, accessToken: string) {
        return api.doRequest<UserRes>('GET', `${baseUrl}/v1.0/contact/users/${unionId}`, undefined, undefined, {
          'x-acs-dingtalk-access-token': accessToken
        });
      },
      /**
       * 根据手机号查询用户ID
       * @param mobile 用户的手机号。
       * @returns 员工的userId。
       */
      async getUserIdByMobile(mobile: string) {
        return checkResult(await api.doRequest<Res<UserId>>('POST', `https://oapi.dingtalk.com/topapi/v2/user/getbymobile`, {
          access_token: await api.getAccessToken()
        }, {
          mobile,
        }));
      },
      /**
       * 根据手机号查询用户ID
       * @param unionid 员工在当前开发者企业账号范围内的唯一标识
       * @returns 员工的userId。
       */
      async getUserIdByUnionId(unionid: string) {
        return checkResult(await api.doRequest<Res<UserId>>('POST', `https://oapi.dingtalk.com/topapi/user/getbyunionid`, {
          access_token: await api.getAccessToken()
        }, {
          unionid,
        }));
      },
      /**
       * 查询用户详情
       * @param userid 用户的userId。
       * @returns 员工的userId。
       */
      async getUserDetail(userid: string) {
        return checkResult(await api.doRequest<Res<UserDetail>>('POST', `https://oapi.dingtalk.com/topapi/v2/user/get`, {
          access_token: await api.getAccessToken()
        }, {
          userid,
        }));
      },
    }
  })(this);

  #appKey: string;
  #appSecret: string;
  #accessToken: string;
  #nextGetAccessTokenTime: number;

  constructor(appKey: string, appSecret: string) {
    this.#appKey = appKey;
    this.#appSecret = appSecret;
  }

  get oauth2() { return this.#oauth2; }
  get contact() { return this.#contact; }

  getLoginUrl(redirectUri: string) {
    return `https://login.dingtalk.com/oauth2/auth?redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&client_id=${this.#appKey}&scope=openid&state=${new Date().getTime()}&prompt=consent`;
  }

  async getAccessToken() {
    if (!this.#accessToken || this.#nextGetAccessTokenTime < new Date().getTime()) {
      const data = await this.doRequest<{expireIn: number, accessToken: string}>('POST', 'https://api.dingtalk.com/v1.0/oauth2/accessToken', null, {
        appKey: this.#appKey,
        appSecret: this.#appSecret
      })
      this.#nextGetAccessTokenTime = new Date().getTime() + data.expireIn * 1000 - 100000
      this.#accessToken = data.accessToken;
    }
    return this.#accessToken;
  }

  async doRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, params?: any, body?: any, headers?: any) {
    const url = `${path}${params ? '?' + toQueryString(params) : ''}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const r = {
      method,
      url,
      headers,
      params,
      body,
    };
    if (res.status < 200 || res.status >= 300) {
      const text = await res.text();
      console.error('fetch dingTalk api error: ', r, text);
      throw new Error(text);
    }
    return (await res.json()) as T;
  }

}

function toQueryString(params: any) {
  return Object.keys(params)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
}
