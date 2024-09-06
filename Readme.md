
## 已有插件

[DingTalk](./packages/plugins/nocobase-plugin-ding-talk/) [![NPM badge](https://img.shields.io/npm/v/nocobase-plugin-ding-talk.svg)](https://www.npmjs.com/package/nocobase-plugin-ding-talk)


## 安装Nocobase

```shell
yarn install
yarn nocobase install
yarn dev
```

### 更新 Nocobase

#### 更新到最新版

`yarn nocobase upgrade`

#### 更新到指定版本

1. 修改`package.json`中的`@nocobase/cli`和`@nocobase/devtools`版本号
2. 执行`yarn install`安装新版本
3. 执行`yarn nocobase upgrade --skip-code-update`更新命令，其中`--skip-code-update`参数为无需加载新的版本


## 创建插件

```shell
yarn pm create nocobase-plugin-ding-talk
# 如果创建的插件未在插件管理器里显示，可以通过 pm add 命令手动添加
yarn pm add nocobase-plugin-ding-talk
# 激活插件
yarn pm enable nocobase-plugin-ding-talk
```

## 更新插件

```shell
# model变化时执行
yarn nocobase upgrade
```


## 打包插件

```shell
yarn build nocobase-plugin-ding-talk --tar

# 分步骤
yarn build nocobase-plugin-ding-talk
yarn nocobase tar nocobase-plugin-ding-talk
```

## 发布插件到npm仓库
```shell
yarn publish packages/plugins/nocobase-plugin-ding-talk --registry=https://registry.npmjs.org
```
