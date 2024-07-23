import { Context, Next } from '@nocobase/actions';
import Application from '@nocobase/server';
import { AuthName } from '../constants';
import { DingTalkAuth } from '../auth/DingTalkAuth';
import { DingTalkApi } from '../openapi/dingTalkApi';

// const wait = (ms?: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getReqUrl(req: Context['request']) {
  const proto = req.get('X-Forwarded-Proto')?.split(',')?.[0] || req.protocol;
  const host = req.get('X-Forwarded-Host')?.split(',')?.[0] || req.host;
  return process.env.APP_URL || `${proto}://${host}${process.env.APP_PUBLIC_PATH || '/'}`
}

export const dingTalkActions = {
  getAuthUrl: async (ctx: Context, next: Next) => {
    const {authenticator: authenticatorName, redirect } = ctx.action.params.values;
    if (!authenticatorName) {
      ctx.throw(400, '认证器不能为空')
    }
    const app: Application = ctx.app;
    const auth = (await app.authManager.get(authenticatorName, ctx)) as DingTalkAuth
    const redirectUri = `${getReqUrl(ctx.request)}api/community-ding-talk:redirectAuth?authenticator=${encodeURIComponent(authenticatorName)}&redirect=${encodeURIComponent(redirect || '')}`;
    ctx.body = auth.dingTalkApi.getLoginUrl(redirectUri)

    await next();
  },
  redirectAuth: async (ctx: Context, next: Next) => {
    const {authenticator: authenticatorName, redirect, code, authCode, state }  = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, '认证器不能为空');
    }
    if (!code) {
      ctx.throw(400, 'OAuth 2.0 临时授权码不存在');
    }
    const app: Application = ctx.app;
    const auth = (await app.authManager.get(authenticatorName, ctx)) as DingTalkAuth

    const { user, token } = await auth.signIn()
    ctx.redirect(`${redirect || process.env.APP_PUBLIC_PATH || '/'}?authenticator${encodeURIComponent(authenticatorName)}&token=${encodeURIComponent(token)}`)
  },
}
