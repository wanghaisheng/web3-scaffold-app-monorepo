# OneKey 品牌名替换分析文档

## 一、概述

本文档分析在 OneKey 钱包项目中替换品牌名 `onekeyhq` / `OneKey` 的可行性和实施步骤。

---

## 二、品牌名涉及范围

### 2.1 包名 (Workspace)

| 类型     | 名称                      | 状态      |
| -------- | ------------------------- | --------- |
| 根项目   | `@onekeyhq/app-monorepo`  | ✅ 可替换 |
| Packages | `@onekeyhq/shared`        | ✅ 可替换 |
|          | `@onekeyhq/components`    | ✅ 可替换 |
|          | `@onekeyhq/core`          | ✅ 可替换 |
|          | `@onekeyhq/kit`           | ✅ 可替换 |
|          | `@onekeyhq/kit-bg`        | ✅ 可替换 |
|          | `@onekeyhq/qr-wallet-sdk` | ✅ 可替换 |
| Apps     | `@onekeyhq/desktop`       | ✅ 可替换 |
|          | `@onekeyhq/ext`           | ✅ 可替换 |
|          | `@onekeyhq/mobile`        | ✅ 可替换 |
|          | `@onekeyhq/web`           | ✅ 可替换 |
|          | `@onekeyhq/web-astro`     | ✅ 可替换 |
|          | `@onekeyhq/web-embed`     | ✅ 可替换 |

**数量**: 约 12 个

---

### 2.2 Git 外部依赖 (不可替换 ⚠️)

以下依赖指向 OneKey 托管的外部 Git 仓库，**无法修改**：

| 依赖                                        | Git URL                                  | 说明                |
| ------------------------------------------- | ---------------------------------------- | ------------------- |
| `@reown/appkit-ethers5-react-native`        | `github.com/OneKeyHQ/app-modules`        | Reown AppKit 定制版 |
| `@reown/appkit-scaffold-react-native`       | `github.com/OneKeyHQ/app-modules`        | Reown AppKit 脚手架 |
| `@reown/appkit-scaffold-utils-react-native` | `github.com/OneKeyHQ/app-modules`        | Reown AppKit 工具   |
| `jcore-react-native`                        | `github.com/OneKeyHQ/jcore-react-native` | 极光推送            |
| `jpush-react-native`                        | `github.com/OneKeyHQ/jpush-react-native` | JPush React Native  |

> **注意**: 这些是外部仓库的定制版本，品牌名嵌入在仓库地址中，无法通过配置修改。如需替换，需自行 fork 并维护这些仓库。

---

### 2.3 OneKey 硬件钱包 SDK (不可替换 ⚠️)

以下 npm 包是 OneKey 官方的硬件钱包 SDK，品牌名嵌入在包名中：

| 包名                                       | 功能          |
| ------------------------------------------ | ------------- |
| `@onekeyfe/hd-core`                        | 硬件钱包核心  |
| `@onekeyfe/hd-ble-sdk`                     | 蓝牙 SDK      |
| `@onekeyfe/hd-common-connect-sdk`          | 连接 SDK      |
| `@onekeyfe/hd-shared`                      | 共享模块      |
| `@onekeyfe/hd-transport`                   | 传输层        |
| `@onekeyfe/hd-transport-electron`          | Electron 传输 |
| `@onekeyfe/hd-web-sdk`                     | Web SDK       |
| `@onekeyfe/cross-inpage-provider-core`     | 页面注入核心  |
| `@onekeyfe/cross-inpage-provider-injected` | 页面注入      |
| `@onekeyfe/extension-bridge-hosted`        | 扩展桥接      |
| `@onekeyfe/onekey-cross-webview`           | 跨 WebView    |

> **重要**: 如果要完全去除 OneKey 品牌，需要替换整个硬件钱包集成方案。

---

### 2.4 代码中引用

在源代码、配置文件中有大量品牌引用，约 **4871 处**。

主要分布在：

- `package.json` 中的 npm scope
- 源代码中的字符串常量
- 配置文件
- 文档注释

---

## 三、替换方案

### 3.1 包名替换 (推荐)

修改所有 workspace 的 `package.json`：

```json
// 旧
"name": "@onekeyhq/kit"

// 新
"name": "@yourbrand/kit"
```

### 3.2 npm scope 替换

在根 `package.json` 中修改 `name`：

```json
// 旧
"name": "@onekeyhq/app-monorepo"

// 新
"name": "@yourbrand/app-monorepo"
```

### 3.3 代码批量替换

使用脚本批量替换源代码中的引用：

```bash
# 示例：替换 TypeScript 文件中的引用
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/onekeyhq/yourbrand/g'
```

### 3.4 保留不变的部分 (⚠️)

以下内容**无需也不能修改**：

| 类型                 | 示例                                     |
| -------------------- | ---------------------------------------- |
| GitHub 仓库地址      | `github.com/OneKeyHQ/app-modules`        |
| GitHub 仓库地址      | `github.com/OneKeyHQ/jcore-react-native` |
| GitHub 仓库地址      | `github.com/OneKeyHQ/jpush-react-native` |
| OneKey 硬件 SDK 包名 | `@onekeyfe/hd-*`                         |
| OneKey 页面注入包名  | `@onekeyfe/cross-inpage-provider-*`      |

---

## 四、实施建议

### 4.1 阶段一：准备工作

1. 确认新的品牌名和 npm scope
2. 评估是否需要 fork 维护外部 Git 依赖
3. 确定硬件钱包方案是否需要替换

### 4.2 阶段二：修改包名

1. 修改根 `package.json` 的 name
2. 修改所有 workspace 的 `package.json` 的 name
3. 更新 `package.json` 中的内部依赖引用
4. 运行 `yarn install` 重新生成 lockfile

### 4.3 阶段三：代码替换

1. 批量替换源代码中的品牌引用
2. 检查并修改配置文件
3. 验证编译和运行

### 4.4 阶段四：验证

1. 运行 `yarn tsc` 检查类型
2. 运行 `yarn build` 验证构建
3. 测试各端 (web/mobile/desktop/ext) 功能

---

## 五、注意事项

1. **Git 依赖必须保留原始地址** - 修改后无法拉取代码
2. **硬件钱包 SDK 无法替换** - 需要评估是否使用官方方案
3. **UI 文本资源** - 国际化文件中可能有品牌相关文本，需单独处理
4. **法律问题** - 如涉及商标，建议咨询法务

---

## 六、简化方案

如果只需快速替换包名，可以只修改：

1. 根 `package.json` 的 `name` 字段
2. 所有 workspace 的 `package.json` 的 `name` 字段
3. `yarn.lock` (删除后重新生成)

其他代码中的文本引用可以渐进式处理。
