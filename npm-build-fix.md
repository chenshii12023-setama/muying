# 微信小程序npm包构建修复指南

## 问题描述

**错误信息**: `NPM packages not found. Please confirm npm packages which need to build are belong to \`miniprogramRoot\` directory. Or you may edit project.config.json's \`packNpmManually\` and \`packNpmRelationList\``

这个错误表示微信开发者工具无法找到或正确构建npm包。

## 已完成的修复步骤

### 1. 安装npm依赖
```bash
npm install
```

### 2. 修改项目配置文件
已更新 `project.config.json`：
- 设置 `nodeModules: true`
- 设置 `packNpmManually: true`
- 添加 `packNpmRelationList` 配置

### 3. 手动构建npm包
创建了 `build-npm.js` 脚本并执行，成功生成 `miniprogram_npm` 目录。

## 在微信开发者工具中的操作

### 方法1：使用构建npm功能
1. 打开微信开发者工具
2. 点击菜单栏的 **工具** -> **构建npm**
3. 等待构建完成

### 方法2：手动构建（已自动完成）
如果构建npm功能仍然有问题，可以：
1. 在命令行中运行：`node build-npm.js`
2. 重新打开项目

## 验证修复效果

构建成功后，您应该能看到：
1. 项目中存在 `miniprogram_npm` 目录
2. `miniprogram_npm/tdesign-miniprogram` 目录包含所有组件文件
3. 小程序页面能正常使用TDesign组件

## 常见问题排查

### 1. 如果仍然提示错误
- 清除微信开发者工具缓存：**工具** -> **清除缓存** -> **清除所有缓存**
- 重新打开项目

### 2. 如果组件无法使用
检查页面配置是否正确引入组件：

```json
{
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button",
    "t-cell": "tdesign-miniprogram/cell/cell"
  }
}
```

### 3. 如果需要更新依赖
```bash
npm install
node build-npm.js
```

## 项目结构

修复后的项目结构：
```
muying/
├── miniprogram_npm/          # 构建生成的npm包目录
│   └── tdesign-miniprogram/  # TDesign组件库
├── node_modules/             # npm依赖
├── pages/                   # 小程序页面
├── package.json             # 项目依赖配置
├── project.config.json       # 项目配置（已修复）
└── build-npm.js            # 构建脚本
```

## 后续建议

1. **定期更新依赖**：定期运行 `npm update` 保持依赖最新
2. **备份配置**：保存修复后的 `project.config.json` 配置
3. **版本控制**：将 `miniprogram_npm` 目录加入 `.gitignore`，避免提交构建产物

如果还有其他问题，请联系开发团队。