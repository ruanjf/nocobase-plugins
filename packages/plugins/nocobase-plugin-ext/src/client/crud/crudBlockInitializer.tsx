import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Application,
  Collection,
  CollectionFieldOptions,
  DataBlockInitializer,
  FormDialog,
  SchemaComponent,
  SchemaComponentOptions,
  useCollectionManager,
  useGlobalTheme,
  useSchemaInitializer,
  useSchemaInitializerItem,
} from '@nocobase/client';
import { SchemaOptionsContext } from '@formily/react';
import { ArrayTable, FormLayout } from '@formily/antd-v5';
import { TableOutlined } from '@ant-design/icons';
import { createConfigSchema, createCrudBlockUISchema, createDefaultConfig } from './createCrudBlockUISchema';
import { usePluginTranslation } from '../locale';


export const CrudBlockInitializer = ({
  filterCollections,
  onlyCurrentDataSource,
  hideSearch,
  createBlockSchema,
  showAssociationFields,
}: {
  filterCollections: (options: { collection?: Collection; associationField?: CollectionFieldOptions }) => boolean;
  onlyCurrentDataSource: boolean;
  hideSearch?: boolean;
  createBlockSchema?: (options: any) => any;
  showAssociationFields?: boolean;
}) => {
  const itemConfig = useSchemaInitializerItem();
  const { createCrudBlock } = useCreateCrudBlock();

  return (
    <DataBlockInitializer
      {...itemConfig}
      componentType={'Calendar'}
      icon={<TableOutlined />}
      onCreateBlockSchema={async (options) => {
        if (createBlockSchema) {
          return createBlockSchema(options);
        }
        createCrudBlock(options);
      }}
      onlyCurrentDataSource={onlyCurrentDataSource}
      hideSearch={hideSearch}
      filter={filterCollections}
      showAssociationFields={showAssociationFields}
    />
  );
};

export const useCreateCrudBlock = () => {
  const { insert } = useSchemaInitializer();
  const { t } = usePluginTranslation();
  const cm = useCollectionManager();
  const options = useContext(SchemaOptionsContext);
  const { theme } = useGlobalTheme();

  const createCrudBlock = async ({ item }) => {
    const collectionFields = cm.getCollectionFields(item.name);
    console.log('cf', item, collectionFields)
    const values = await FormDialog(
      t('Create CRUD block'),
      () => {
        return (
          <SchemaComponentOptions scope={{...options.scope, t}} components={{ ...options.components, ArrayTable }}>
            <FormLayout layout={'vertical'}>
              <SchemaComponent schema={createConfigSchema({ t })}
              />
            </FormLayout>
          </SchemaComponentOptions>
        );
      },
      theme,
    ).open({
      initialValues: createDefaultConfig({ collection: item, collectionFields })
    });
    console.log('values', values)
    insert(
      createCrudBlockUISchema({
        collectionName: item.name,
        collectionFields,
        dataSource: item.dataSource,
        config: values,
      }),
    );
  };

  return { createCrudBlock };
};

export function useCreateAssociationCrudBlock() {
  const { insert } = useSchemaInitializer();
  const { t } = useTranslation();
  const options = useContext(SchemaOptionsContext);
  const { theme } = useGlobalTheme();
  const cm = useCollectionManager();

  const createAssociationCrudBlock = async ({ item }) => {
    const field = item.associationField;

    const collectionFields = cm.getCollectionFields(item.name);
    const values = await FormDialog(
      t('Create CRUD block'),
      () => {
        return (
          <SchemaComponentOptions scope={{...options.scope, t}} components={{ ...options.components, ArrayTable }}>
            <FormLayout layout={'vertical'}>
              <SchemaComponent
                schema={createConfigSchema({ t })}
              />
            </FormLayout>
          </SchemaComponentOptions>
        );
      },
      theme,
    ).open({
      initialValues: createDefaultConfig({ collection: item, collectionFields }),
    });
    insert(
      createCrudBlockUISchema({
        collectionName: item.name,
        collectionFields,
        association: `${field.collectionName}.${field.name}`,
        dataSource: item.dataSource,
        config: values,
      }),
    );
  };

  return { createAssociationCrudBlock };
}

export const crudInit = (app: Application) => {
  app.addComponents({ CrudBlockInitializer });

  const blockInitializers = app.schemaInitializerManager.get('page:addBlock');
  blockInitializers?.add('dataBlocks.crud', {
    title: '{{t("CRUD", { ns: "nocobase-plugin-ext" })}}',
    Component: 'CrudBlockInitializer',
  });

  app.schemaInitializerManager.addItem('popup:common:addBlock', 'dataBlocks.crud', {
    title: '{{t("CRUD", { ns: "nocobase-plugin-ext" })}}',
    Component: 'CrudBlockInitializer',
    useComponentProps() {
      const { createAssociationCrudBlock } = useCreateAssociationCrudBlock();
      const { createCrudBlock } = useCreateCrudBlock();

      return {
        onlyCurrentDataSource: true,
        filterCollections({ associationField }) {
          if (associationField) {
            return ['hasMany', 'belongsToMany'].includes(associationField.type);
          }
          return false;
        },
        createBlockSchema: ({ item, fromOthersInPopup }) => {
          if (fromOthersInPopup) {
            return createCrudBlock({ item });
          }
          createAssociationCrudBlock({ item });
        },
        showAssociationFields: true,
        hideSearch: true,
      };
    },
  });

};
