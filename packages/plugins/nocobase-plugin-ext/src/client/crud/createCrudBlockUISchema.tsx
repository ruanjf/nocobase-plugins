import { ISchema } from '@formily/react';
import { uid } from '@formily/shared';
import { CollectionFieldOptions } from '@nocobase/client';

export type FieldConfig = {
  name: string
  type: string
  list: boolean
  create: boolean
  edit: boolean
  valueRequired: boolean
}

export type Opertion = 'create' | 'edit' | 'delete'

export type ConfigType = {
  collectionTitle: string
  tableSize: string
  opertions: Opertion[]
  fieldConfigs: FieldConfig[]
}

export const opertions: ConfigType['opertions'] = ['create', 'edit', 'delete']

export const sysFieldNames = ['createdAt', 'createdBy', 'updatedAt', 'updatedBy']

export const createDefaultConfig = ({
  collection,
  collectionFields
}: {
  collection: {
    dataSource: string,
    name: string,
    title?: string
  },
  collectionFields: CollectionFieldOptions[]
}) => {
  const val: ConfigType = {
    collectionTitle: collection.title || collection.name,
    tableSize: 'small',
    opertions: opertions,
    fieldConfigs: collectionFields
      .filter(a => !!a.uiSchema)
      .map(a => ({
        name: a.name,
        title: a.uiSchema?.title || a.comment || a.name,
        type: a.type,
        list: true,
        create: !sysFieldNames.includes(a.name) && !(a.primaryKey && a.autoIncrement),
        edit: !sysFieldNames.includes(a.name),
        valueRequired: !a.allowNull
      } as FieldConfig))
  }
  return val
}

export const createConfigSchema = ({
  t
}: {
  t: (title: string) => string
}) => {
  return {
    properties: {
      collectionTitle: {
        title: t('Table title'),
        'x-pattern': 'readPretty',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      tableSize: {
        title: t('Table size'),
        enum: [
          {
            label: t('Small'),
            value: 'small',
          },
          {
            label: t('Middle'),
            value: 'middle',
          },
          {
            label: t('Large'),
            value: 'large',
          },
        ],
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
      },
      opertions: {
        title: t('CRUD opertions'),
        enum: [
          {
            label: t('Create'),
            value: 'create',
          },
          {
            label: t('Edit'),
            value: 'edit',
          },
          {
            label: t('Delete'),
            value: 'delete',
          },
        ],
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          mode: 'multiple',
        }
      },
      fieldConfigs: {
        type: 'array',
        title: t('Fields config'),
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        'x-component-props': {
          pagination: { pageSize: 1000 },
          scroll: { y: 'calc(100vh - 500px)' },
          size: 'small',
        },
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                width: 50,
                title: t('Sort'),
                align: 'center',
              },
              properties: {
                sortable: {
                  type: 'void',
                  'x-component': 'ArrayTable.SortHandle',
                },
              },
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: t('Field name'),
              },
              properties: {
                title: {
                  'x-component': 'Input',
                  'x-pattern': 'readPretty',
                },
              },
            },
            column3: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: t('List'),
              },
              properties: {
                list: {
                  type: 'booleam',
                  default: false,
                  'x-component': 'Checkbox',
                },
              },
            },
            column4: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: t('Create'),
              },
              properties: {
                create: {
                  type: 'booleam',
                  default: false,
                  'x-component': 'Checkbox',
                },
              },
            },
            column5: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: t('Edit'),
              },
              properties: {
                edit: {
                  type: 'booleam',
                  default: false,
                  'x-component': 'Checkbox',
                },
              },
            },
          },
        }
      },
    },
  }
}

export const createCrudBlockUISchema = (options: {
  collectionName: string;
  collectionFields: CollectionFieldOptions[]
  config: ConfigType;
  dataSource: string;
  association?: string;
}): ISchema => {
  const { config, collectionName, collectionFields, dataSource, association } = options;
  const collectionFieldMap = collectionFields.reduce((r, v) => {
    r[v.name] = v
    return r;
  }, {} as {[key: string]: CollectionFieldOptions})

  const schema = {
    "type": "void",
    "x-decorator": "TableBlockProvider",
    "x-acl-action": `${collectionName}:list`,
    "x-use-decorator-props": "useTableBlockDecoratorProps",
    "x-decorator-props": {
        "collection": collectionName,
        "dataSource": dataSource,
        "action": "list",
        "params": {
            "pageSize": 20
        },
        "rowKey": "id",
        "showIndex": true,
        "dragSort": false
    },
    "x-toolbar": "BlockSchemaToolbar",
    "x-settings": "blockSettings:table",
    "x-component": "CardItem",
    "x-filter-targets": [],
    "properties": {
        "actions": {
            "type": "void",
            "x-initializer": "table:configureActions",
            "x-component": "ActionBar",
            "x-component-props": {
                "style": {
                    "marginBottom": "var(--nb-spacing)"
                }
            },
            "properties": {
                [uid()]: {
                    "type": "void",
                    "title": "{{ t(\"Filter\") }}",
                    "x-action": "filter",
                    "x-toolbar": "ActionSchemaToolbar",
                    "x-settings": "actionSettings:filter",
                    "x-component": "Filter.Action",
                    "x-use-component-props": "useFilterActionProps",
                    "x-component-props": {
                        "icon": "FilterOutlined"
                    },
                    "x-align": "left",
                },
                ...(config.opertions.includes('create') && {[uid()]: {
                    "type": "void",
                    "x-action": "create",
                    "x-acl-action": "create",
                    "title": "{{t('Add new')}}",
                    "x-toolbar": "ActionSchemaToolbar",
                    "x-settings": "actionSettings:addNew",
                    "x-component": "Action",
                    "x-decorator": "ACLActionProvider",
                    "x-component-props": {
                        "openMode": "drawer",
                        "type": "primary",
                        "component": "CreateRecordAction",
                        "icon": "PlusOutlined"
                    },
                    "x-align": "right",
                    "x-acl-action-props": {
                        "skipScopeCheck": true
                    },
                    "properties": {
                        "drawer": {
                            "type": "void",
                            "title": "{{ t(\"Add record\") }}",
                            "x-component": "Action.Container",
                            "x-component-props": {
                                "className": "nb-action-popup"
                            },
                            "properties": {
                                "tabs": {
                                    "type": "void",
                                    "x-component": "Tabs",
                                    "x-component-props": {},
                                    "x-initializer": "popup:addTab",
                                    "x-initializer-props": {
                                        "gridInitializer": "popup:addNew:addBlock"
                                    },
                                    "properties": {
                                        "tab1": {
                                            "type": "void",
                                            "title": "{{t(\"Add new\")}}",
                                            "x-component": "Tabs.TabPane",
                                            "x-designer": "Tabs.Designer",
                                            "x-component-props": {},
                                            "properties": {
                                                "grid": {
                                                    "type": "void",
                                                    "x-component": "Grid",
                                                    "x-initializer": "popup:addNew:addBlock",
                                                    "properties": {
                                                        [uid()]: {
                                                            "type": "void",
                                                            "x-component": "Grid.Row",
                                                            "properties": {
                                                                [uid()]: {
                                                                    "type": "void",
                                                                    "x-component": "Grid.Col",
                                                                    "properties": {
                                                                        [uid()]: {
                                                                            "type": "void",
                                                                            "x-acl-action-props": {
                                                                                "skipScopeCheck": true
                                                                            },
                                                                            "x-acl-action": "rbCompanies:create",
                                                                            "x-decorator": "FormBlockProvider",
                                                                            "x-use-decorator-props": "useCreateFormBlockDecoratorProps",
                                                                            "x-decorator-props": {
                                                                                "dataSource": dataSource,
                                                                                "collection": collectionName
                                                                            },
                                                                            "x-toolbar": "BlockSchemaToolbar",
                                                                            "x-settings": "blockSettings:createForm",
                                                                            "x-component": "CardItem",
                                                                            "properties": {
                                                                                [uid()]: {
                                                                                    "type": "void",
                                                                                    "x-component": "FormV2",
                                                                                    "x-use-component-props": "useCreateFormBlockProps",
                                                                                    "properties": {
                                                                                        "grid": {
                                                                                            "type": "void",
                                                                                            "x-component": "Grid",
                                                                                            "x-initializer": "form:configureFields",
                                                                                            "properties": {
                                                                                              ...(config.fieldConfigs.filter(a => a.create).reduce((r,v) => {
                                                                                                r[uid()] = {
                                                                                                  "type": "void",
                                                                                                  "x-component": "Grid.Row",
                                                                                                  "properties": {
                                                                                                    [uid()]: {
                                                                                                      "type": "void",
                                                                                                      "x-component": "Grid.Col",
                                                                                                      "properties": {
                                                                                                        [v.name]: {
                                                                                                          // "type": v.type || "string",
                                                                                                          "required": v.valueRequired,
                                                                                                          "x-toolbar": "FormItemSchemaToolbar",
                                                                                                          "x-settings": "fieldSettings:FormItem",
                                                                                                          "x-component": "CollectionField",
                                                                                                          "x-decorator": "FormItem",
                                                                                                          "x-collection-field": `${collectionName}.${v.name}`,
                                                                                                          "x-component-props": {
                                                                                                            ...(collectionFieldMap[v.name]?.target ? {
                                                                                                              "fieldNames": {
                                                                                                                "label": collectionFieldMap[v.name]?.targetKey || "id",
                                                                                                                "value": collectionFieldMap[v.name]?.targetKey || "id"
                                                                                                              }
                                                                                                            } : {})
                                                                                                          },
                                                                                                        }
                                                                                                      },
                                                                                                    }
                                                                                                  },
                                                                                                }
                                                                                                return r;
                                                                                              }, {})),
                                                                                            },
                                                                                        },
                                                                                        [uid()]: {
                                                                                            "type": "void",
                                                                                            "x-initializer": "createForm:configureActions",
                                                                                            "x-component": "ActionBar",
                                                                                            "x-component-props": {
                                                                                                "layout": "one-column"
                                                                                            },
                                                                                            "properties": {
                                                                                                [uid()]: {
                                                                                                    "title": "{{ t(\"Submit\") }}",
                                                                                                    "x-action": "submit",
                                                                                                    "x-component": "Action",
                                                                                                    "x-use-component-props": "useCreateActionProps",
                                                                                                    "x-toolbar": "ActionSchemaToolbar",
                                                                                                    "x-settings": "actionSettings:createSubmit",
                                                                                                    "x-component-props": {
                                                                                                        "type": "primary",
                                                                                                        "htmlType": "submit",
                                                                                                        "confirm": {
                                                                                                            "title": "Perform the {{title}}",
                                                                                                            "content": "Are you sure you want to perform the {{title}} action?"
                                                                                                        }
                                                                                                    },
                                                                                                    "x-action-settings": {
                                                                                                        "triggerWorkflows": []
                                                                                                    },
                                                                                                    "type": "void",
                                                                                                }
                                                                                            },
                                                                                        }
                                                                                    },
                                                                                }
                                                                            },
                                                                        }
                                                                    },
                                                                }
                                                            },
                                                        }
                                                    },
                                                }
                                            },
                                        }
                                    },
                                }
                            },
                        }
                    },
                }}),
                ...(config.opertions.includes('delete') && {[uid()]: {
                    "title": "{{ t(\"Delete\") }}",
                    "x-action": "destroy",
                    "x-component": "Action",
                    "x-use-component-props": "useBulkDestroyActionProps",
                    "x-component-props": {
                        "icon": "DeleteOutlined",
                        "confirm": {
                            "title": "{{t('Delete record')}}",
                            "content": "{{t('Are you sure you want to delete it?')}}"
                        }
                    },
                    "x-toolbar": "ActionSchemaToolbar",
                    "x-settings": "actionSettings:bulkDelete",
                    "x-decorator": "ACLActionProvider",
                    "x-acl-action-props": {
                        "skipScopeCheck": true
                    },
                    "x-action-settings": {
                        "triggerWorkflows": []
                    },
                    "x-acl-action": "rbCompanies:destroy",
                    "x-align": "right",
                    "type": "void",
                }}),
                [uid()]: {
                    "title": "{{ t(\"Refresh\") }}",
                    "x-action": "refresh",
                    "x-component": "Action",
                    "x-use-component-props": "useRefreshActionProps",
                    "x-toolbar": "ActionSchemaToolbar",
                    "x-settings": "actionSettings:refresh",
                    "x-component-props": {
                        "icon": "ReloadOutlined"
                    },
                    "x-align": "right",
                    "type": "void",
                }
            },
        },
        [uid()]: {
            "type": "array",
            "x-initializer": "table:configureColumns",
            "x-component": "TableV2",
            "x-use-component-props": "useTableBlockProps",
            "x-component-props": {
                "rowKey": "id",
                "rowSelection": {
                    "type": "checkbox"
                },
                "size": config.tableSize || undefined,
            },
            "properties": {
                ...(config.fieldConfigs.filter(a => a.list).reduce((r,v) => {
                  r[uid()] = {
                    "type": "void",
                    "x-decorator": "TableV2.Column.Decorator",
                    "x-toolbar": "TableColumnSchemaToolbar",
                    "x-settings": "fieldSettings:TableColumn",
                    "x-component": "TableV2.Column",
                    "properties": {
                      [v.name]: {
                        "x-collection-field": `${collectionName}.${v.name}`,
                        "x-component": "CollectionField",
                        "x-component-props": {
                          "ellipsis": true,
                          "enableLink": false,
                        },
                        "x-read-pretty": true,
                        "x-decorator": null,
                        "x-decorator-props": {
                          "labelStyle": {
                            "display": "none"
                          }
                        },
                      }
                    },
                  }
                  return r;
                }, {})),
                [uid()]: {
                    "type": "void",
                    "title": "{{ t(\"Actions\") }}",
                    "x-decorator": "TableV2.Column.ActionBar",
                    "x-component": "TableV2.Column",
                    "x-toolbar": "TableColumnSchemaToolbar",
                    "x-initializer": "table:configureItemActions",
                    "x-settings": "fieldSettings:TableColumn",
                    "x-toolbar-props": {
                        "initializer": "table:configureItemActions"
                    },
                    "x-action-column": "actions",
                    "x-component-props": {
                        "fixed": "right"
                    },
                    "properties": {
                        [uid()]: {
                            "type": "void",
                            "x-decorator": "DndContext",
                            "x-component": "Space",
                            "x-component-props": {
                                "split": "|"
                            },
                            "properties": {
                                ...(config.opertions.includes('edit') && {[uid()]: {
                                    "type": "void",
                                    "title": "{{ t(\"Edit\") }}",
                                    "x-action": "update",
                                    "x-toolbar": "ActionSchemaToolbar",
                                    "x-settings": "actionSettings:edit",
                                    "x-component": "Action.Link",
                                    "x-component-props": {
                                        "openMode": "drawer",
                                        "icon": "EditOutlined"
                                    },
                                    "x-decorator": "ACLActionProvider",
                                    "x-designer-props": {
                                        "linkageAction": true
                                    },
                                    "properties": {
                                        "drawer": {
                                            "type": "void",
                                            "title": "{{ t(\"Edit record\") }}",
                                            "x-component": "Action.Container",
                                            "x-component-props": {
                                                "className": "nb-action-popup"
                                            },
                                            "properties": {
                                                "tabs": {
                                                    "type": "void",
                                                    "x-component": "Tabs",
                                                    "x-component-props": {},
                                                    "x-initializer": "popup:addTab",
                                                    "properties": {
                                                        "tab1": {
                                                            "type": "void",
                                                            "title": "{{t(\"Edit\")}}",
                                                            "x-component": "Tabs.TabPane",
                                                            "x-designer": "Tabs.Designer",
                                                            "x-component-props": {},
                                                            "properties": {
                                                                "grid": {
                                                                    "type": "void",
                                                                    "x-component": "Grid",
                                                                    "x-initializer": "popup:common:addBlock",
                                                                    "properties": {
                                                                        [uid()]: {
                                                                            "type": "void",
                                                                            "x-component": "Grid.Row",
                                                                            "properties": {
                                                                                [uid()]: {
                                                                                    "type": "void",
                                                                                    "x-component": "Grid.Col",
                                                                                    "properties": {
                                                                                        [uid()]: {
                                                                                            "type": "void",
                                                                                            "x-acl-action-props": {
                                                                                                "skipScopeCheck": false
                                                                                            },
                                                                                            "x-acl-action": `${collectionName}:update`,
                                                                                            "x-decorator": "FormBlockProvider",
                                                                                            "x-use-decorator-props": "useEditFormBlockDecoratorProps",
                                                                                            "x-decorator-props": {
                                                                                                "action": "get",
                                                                                                "dataSource": dataSource,
                                                                                                "collection": collectionName
                                                                                            },
                                                                                            "x-toolbar": "BlockSchemaToolbar",
                                                                                            "x-settings": "blockSettings:editForm",
                                                                                            "x-component": "CardItem",
                                                                                            "properties": {
                                                                                                [uid()]: {
                                                                                                    "type": "void",
                                                                                                    "x-component": "FormV2",
                                                                                                    "x-use-component-props": "useEditFormBlockProps",
                                                                                                    "properties": {
                                                                                                        "grid": {
                                                                                                            "type": "void",
                                                                                                            "x-component": "Grid",
                                                                                                            "x-initializer": "form:configureFields",
                                                                                                            "properties": {
                                                                                                              ...(config.fieldConfigs.filter(a => a.edit).reduce((r,v) => {
                                                                                                                r[uid()] = {
                                                                                                                  "type": "void",
                                                                                                                  "x-component": "Grid.Row",
                                                                                                                  "properties": {
                                                                                                                    [uid()]: {
                                                                                                                      "type": "void",
                                                                                                                      "x-component": "Grid.Col",
                                                                                                                      "properties": {
                                                                                                                        [v.name]: {
                                                                                                                          // "type": v.type || "string",
                                                                                                                          "required": v.valueRequired,
                                                                                                                          "x-read-pretty": collectionFieldMap[v.name]?.primaryKey || false,
                                                                                                                          "x-toolbar": "FormItemSchemaToolbar",
                                                                                                                          "x-settings": "fieldSettings:FormItem",
                                                                                                                          "x-component": "CollectionField",
                                                                                                                          "x-decorator": "FormItem",
                                                                                                                          "x-collection-field": `${collectionName}.${v.name}`,
                                                                                                                          "x-component-props": {
                                                                                                                            ...(collectionFieldMap[v.name]?.target ? {
                                                                                                                              "fieldNames": {
                                                                                                                                "label": collectionFieldMap[v.name]?.targetKey || "id",
                                                                                                                                "value": collectionFieldMap[v.name]?.targetKey || "id"
                                                                                                                              }
                                                                                                                            } : {})
                                                                                                                          },
                                                                                                                        }
                                                                                                                      },
                                                                                                                    }
                                                                                                                  },
                                                                                                                }
                                                                                                                return r;
                                                                                                              }, {})),
                                                                                                            },
                                                                                                        },
                                                                                                        [uid()]: {
                                                                                                            "type": "void",
                                                                                                            "x-initializer": "editForm:configureActions",
                                                                                                            "x-component": "ActionBar",
                                                                                                            "x-component-props": {
                                                                                                                "layout": "one-column"
                                                                                                            },
                                                                                                            "properties": {
                                                                                                                [uid()]: {
                                                                                                                    "title": "{{ t(\"Submit\") }}",
                                                                                                                    "x-action": "submit",
                                                                                                                    "x-component": "Action",
                                                                                                                    "x-use-component-props": "useUpdateActionProps",
                                                                                                                    "x-toolbar": "ActionSchemaToolbar",
                                                                                                                    "x-settings": "actionSettings:updateSubmit",
                                                                                                                    "x-component-props": {
                                                                                                                        "type": "primary",
                                                                                                                        "htmlType": "submit",
                                                                                                                        "confirm": {
                                                                                                                            "title": "Perform the {{title}}",
                                                                                                                            "content": "Are you sure you want to perform the {{title}} action?"
                                                                                                                        }
                                                                                                                    },
                                                                                                                    "x-action-settings": {
                                                                                                                        "triggerWorkflows": []
                                                                                                                    },
                                                                                                                    "type": "void",
                                                                                                                }
                                                                                                            },
                                                                                                        }
                                                                                                    },
                                                                                                }
                                                                                            },
                                                                                        }
                                                                                    },
                                                                                }
                                                                            },
                                                                        }
                                                                    },
                                                                }
                                                            },
                                                        }
                                                    },
                                                }
                                            },
                                        }
                                    },
                                }})
                            },
                        }
                    },
                }
            },
        }
    },
  };

  if (association) {
    schema['x-decorator-props']['association'] = association;
  }
  return schema;
};
