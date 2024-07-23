import { Plugin } from '@nocobase/server';
import { DingTalkAuth } from './auth/DingTalkAuth';
import { dingTalkActions } from './actions/dingTalkActions';
import { AuthName, ResoureName } from './constants';

export class NocobasePluginDingTalkServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.authManager.registerTypes(AuthName, {
      title: '钉钉登录(社区)',
      auth: DingTalkAuth,
    });

    this.app.resourceManager.define({
      name: ResoureName,
      actions: dingTalkActions,
    })
    this.app.acl.allow(ResoureName, '*');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default NocobasePluginDingTalkServer;
