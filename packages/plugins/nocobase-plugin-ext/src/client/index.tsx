import { Plugin } from '@nocobase/client';
import { DataDictionarySelectFieldInterface } from './interfaces';

export class NocobasePluginExtClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.dataSourceManager.addFieldInterfaces([
      DataDictionarySelectFieldInterface
    ])
    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default NocobasePluginExtClient;
