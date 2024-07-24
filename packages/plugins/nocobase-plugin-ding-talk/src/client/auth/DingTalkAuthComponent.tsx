import React, { useState } from 'react';
import { Button } from 'antd';
import { DingtalkOutlined } from '@ant-design/icons';
import type { Authenticator } from '@nocobase/plugin-auth/client';
import { SchemaComponent, useResource } from '@nocobase/client';
// import { usePluginTranslation } from '../locale';

export const DingTalkAuthButton = (props: { authenticator: Authenticator }) => {
  const [loading, setLoading] = useState(false);
  const resource = useResource('community-ding-talk');
  const onClick = async () => {
    setLoading(true);
    try {
      const res = await resource.getAuthUrl({
        values: {
          authenticator: props.authenticator.name,
          redirect: new URLSearchParams(location.search ? location.search.substring(1) : '').get('redirect') || '',
        }
      })
      console.log('uu', res, res.data)
      location.href = res.data.data;
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  return (
    <Button loading={loading} disabled={loading} icon={<DingtalkOutlined />} style={{ width: '100%' }} onClick={onClick}>{props.authenticator.title || props.authenticator.name}</Button>
  )
}

export const DingTalkAuthAdminSettingsForm = (props: { authenticator: Authenticator }) => {
  // const t = usePluginTranslation()
  console.log('aaa', props)
  return (
    <SchemaComponent
      // scope={{ t }}
      schema={{
        type: 'object',
        properties: {
          communityDingTalkAuth: {
            type: 'void',
            properties: {
              public: {
                type: 'object',
                properties: {
                  autoSignup: {
                    'x-decorator': 'FormItem',
                    type: 'boolean',
                    // title: '{{t("Sign up automatically when the user does not exist")}}',
                    title: '用户不存在时自动注册',
                    required: false,
                    'x-component': 'Checkbox',
                  },
                },
              },
              internal: {
                type: 'object',
                properties: {
                  userCheckType: {
                    'x-decorator': 'FormItem',
                    type: 'string',
                    title: '用户验证方式',
                    required: true,
                    'x-component': 'Select',
                    'x-component-props': {
                      // defaultValue: 'orgEmail',
                      options: [
                        { value: 'orgEmail', label: '企业邮箱' },
                        { value: 'personalEmail', label: '个人邮箱' },
                        { value: 'mobile', label: '手机号' },
                      ]
                    }
                  },
                  emailDomain: {
                    'x-decorator': 'FormItem',
                    type: 'string',
                    title: '邮箱域名，多个使用英文逗号分隔',
                    required: true,
                    'x-component': 'Input',
                  },
                  appKey: {
                    'x-decorator': 'FormItem',
                    type: 'string',
                    title: '应用ID',
                    required: true,
                    'x-component': 'Input',
                  },
                  appSecret: {
                    'x-decorator': 'FormItem',
                    type: 'string',
                    title: '应用秘钥',
                    required: true,
                    'x-component': 'Password',
                  },
                }
              }
            },
          },
        },
      }}
    />
  );
}
