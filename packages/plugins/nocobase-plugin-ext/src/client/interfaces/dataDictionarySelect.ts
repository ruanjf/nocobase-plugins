import { ISchema } from '@formily/react';
import { CollectionFieldInterface, operators, defaultProps } from '@nocobase/client';

export class DataDictionarySelectFieldInterface extends CollectionFieldInterface {
  name = 'dataDictionarySelect';
  type = 'object';
  group = 'choices';
  // order = 2;
  // sortable = true;
  title = '{{t("Data dictionary select", { ns: "nocobase-plugin-ext" })}}';
  default = {
    interface: 'dataDictionarySelect',
    type: 'string',
    uiSchema: {
      type: 'string',
      'x-component': 'RemoteSelect',
      'x-component-props': {
        // manual: false,
        fieldNames: {
          label: 'dictLabel',
          value: 'id',
        },
        service: {
          // resource: 'rbDataDictionaryItems',
          action: 'list',
          params: {
            // filter: {
            //   dictionaryType: {
            //     id: 'projectType',
            //   },
            // },
            sort: ['dictSort', 'id']
          },
        },
      },
    },
  };
  availableTypes = ['string', 'integer', 'bigInt', 'boolean'];
  hasDefaultValue = true;
  properties = {
    ...defaultProps,
  };
  filterable = {
    operators: [...operators.enumType].map(a => {
      if (a.schema) {
        a = {...a};
        a.schema = undefined;
      }
      return a;
    }),
  };
  titleUsable = true;
  schemaInitialize(schema: ISchema, { block }) {
    console.log('schema block', schema, block);
    if (!schema['x-component']) {
      schema['x-component'] = 'RemoteSelect'
    }
    const props = (schema['x-component-props'] = schema['x-component-props'] || {});
    if (!props.fieldNames) {
      props.fieldNames = {
        label: 'dictLabel',
        value: 'id',
      }
    }
  }
}
