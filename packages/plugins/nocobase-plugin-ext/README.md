# nocobase-plugin-ext

## 功能

- `CRUD`增删查改快捷生成
- 支持数据字典`FieldInterface`

## 开发

### 创建插件

```shell
yarn pm create nocobase-plugin-ext
# 如果创建的插件未在插件管理器里显示，可以通过 pm add 命令手动添加
yarn pm add nocobase-plugin-ext
# 激活插件
yarn pm enable nocobase-plugin-ext
```

### 打包插件

```shell
yarn build nocobase-plugin-ext --tar

# 分步骤
yarn build nocobase-plugin-ext
yarn nocobase tar nocobase-plugin-ext
```

### 发布插件到npm仓库
```shell
npm publish packages/plugins/nocobase-plugin-ext --registry=https://registry.npmjs.org
```
