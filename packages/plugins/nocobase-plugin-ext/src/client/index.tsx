import { Plugin } from '@nocobase/client';
import { DataDictionarySelectFieldInterface } from './interfaces';
import { crudInit } from './crud/crudBlockInitializer';

export class NocobasePluginExtClient extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.dataSourceManager.addFieldInterfaces([
      DataDictionarySelectFieldInterface
    ])

    crudInit(this.app);
  }
}

export default NocobasePluginExtClient;
