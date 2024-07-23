import { Plugin } from '@nocobase/client';
import AuthPlugin from '@nocobase/plugin-auth/client';
import { DingTalkAuthAdminSettingsForm, DingTalkAuthButton } from './auth/DingTalkAuthComponent';

export class NocobasePluginDingTalkClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    // console.log(this.app);
    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()

    const auth = this.app.pm.get(AuthPlugin);
    auth.registerType('community-ding-talk-auth', {
      components: {
        SignInButton: DingTalkAuthButton,
        AdminSettingsForm: DingTalkAuthAdminSettingsForm,
      },
    });
  }
}

export default NocobasePluginDingTalkClient;
