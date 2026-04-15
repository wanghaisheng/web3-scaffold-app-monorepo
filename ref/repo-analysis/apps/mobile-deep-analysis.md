# Mobile App 深度分析报告

## 概述
`@onekeyhq/mobile` 是基于 React Native + Expo 的移动端钱包应用，支持 iOS 和 Android 平台，是 OneKey 生态系统的核心移动客户端。

## 技术架构

### 核心技术栈
- **React Native**: 0.81.5
- **Expo SDK**: 54.0.26  
- **TypeScript**: 严格类型检查
- **Metro**: JavaScript 打包工具
- **Detox**: E2E 测试框架

### 平台支持
- **iOS**: 通过 Xcode 构建，支持 iOS 模拟器和真机
- **Android**: 通过 Gradle 构建，支持多种分发渠道
- **分发渠道**: Google Play、华为应用市场、直接分发

## 目录结构深度分析

### 1. **原生代码层**

#### Android 目录 (57 items)
```
android/
├── app/                    # 应用主模块
│   ├── src/main/          # 主要源码
│   ├── build.gradle       # 应用级构建配置
│   └── proguard-rules.pro # 代码混淆规则
├── build.gradle           # 项目级构建配置
├── gradle/                # Gradle 包装器
├── gradlew                # Gradle 执行脚本
└── sentry.properties      # Sentry 错误追踪配置
```

**关键特性**:
- 多渠道构建配置 (Google、华为、直接分发)
- ProGuard 代码混淆
- Sentry 错误监控集成
- 自定义构建逻辑

#### iOS 目录 (53 items)
```
ios/
├── OneKeyWallet.xcworkspace/ # Xcode 工作空间
├── OneKeyWallet.xcodeproj/   # Xcode 项目
├── OneKeyWallet/            # 主要应用代码
├── ServiceExtension/         # 后台服务扩展
├── Podfile                  # CocoaPods 依赖
├── Podfile.lock            # 锁定依赖版本
└── *.lproj/                # 多语言本地化文件
```

**关键特性**:
- 支持 20+ 语言本地化
- 后台服务扩展
- CocoaPods 依赖管理
- Sentry 错误监控
- 隐私信息配置

### 2. **应用配置层**

#### 核心配置文件
- **package.json**: 依赖管理和脚本定义
- **app.json**: Expo 应用配置
- **eas.json**: EAS (Expo Application Services) 构建配置
- **babel.config.js**: Babel 转换配置
- **metro.config.js**: Metro 打包配置

#### EAS 构建配置
```json
{
  "build": {
    "development": {
      "channel": "development",
      "distribution": "internal"
    },
    "preview": {
      "channel": "preview", 
      "distribution": "internal"
    },
    "production": {
      "channel": "production",
      "distribution": "store"
    }
  }
}
```

### 3. **测试框架**

#### Detox 配置
- **.detoxrc.js**: E2E 测试配置
- **e2e/**: 端到端测试用例
- **jest.harness.config.mjs**: Jest 测试配置

#### 测试脚本
```bash
# iOS 测试
detox:build:ios:sim:debug
detox:test:ios:sim:debug
detox:build:ios:sim:release  
detox:test:ios:sim:release

# Android 测试
detox:build:android:emu:debug
detox:test:android:emu:debug
detox:build:android:emu:release
detox:test:android:emu:release
```

### 4. **性能监控**

#### React Native Harness 集成
- **harness/**: 性能测试工具配置
- **harness-entry.js**: 测试入口点
- **jest-harness-setup.ts**: Jest 集成配置
- **rn-harness.config.mjs**: RN Harness 配置

#### 性能追踪脚本
- **build-bundle.js**: Bundle 构建和性能分析
- **add-rn-startup-performance-tracking.js**: 启动性能追踪
- **remove-rn-startup-performance-tracking.js**: 移除性能追踪

## 依赖分析

### 核心依赖分类

#### React Native 生态 (80+ 包)
```json
{
  "react-native": "0.81.5",
  "react-native-reanimated": "4.2.1",
  "react-native-screens": "4.23.0", 
  "react-native-gesture-handler": "2.30.0",
  "react-native-svg": "15.15.1",
  "@react-navigation/*": "导航组件",
  "@shopify/flash-list": "高性能列表"
}
```

#### Expo 模块 (40+ 包)
```json
{
  "expo": "54.0.26",
  "@expo-google-fonts/inter": "字体",
  "expo-camera": "相机",
  "expo-secure-store": "安全存储",
  "expo-local-authentication": "生物识别",
  "expo-notifications": "推送通知",
  "expo-image-picker": "图片选择"
}
```

#### OneKey 专用模块 (20+ 包)
```json
{
  "@onekeyfe/react-native-*": "OneKey 专用模块",
  "@onekeyhq/components": "UI组件库",
  "@onekeyhq/kit": "业务逻辑",
  "@onekeyhq/shared": "共享工具"
}
```

#### 硬件钱包集成
```json
{
  "@phantom/react-native-juicebox-sdk": "Juicebox 集成",
  "@onekeyfe/react-native-ble-utils": "BLE 蓝牙",
  "@onekeyfe/react-native-sni-connect": "SNI 连接"
}
```

#### 第三方服务
```json
{
  "@sentry/react-native": "错误监控",
  "@walletconnect/react-native-compat": "WalletConnect",
  "@react-native-google-signin/google-signin": "Google 登录",
  "react-native-purchases": "内购管理"
}
```

## 构建系统深度分析

### 1. **Metro 配置**
```javascript
// metro.config.js 关键特性
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    alias: {
      // React Native Web 兼容性别名
    },
  },
};
```

### 2. **Babel 配置**
```javascript
// babel.config.js 关键插件
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    // 自定义插件
    require('./babel-plugin-jest-compat'),
  ],
};
```

### 3. **Bundle 构建流程**
```javascript
// build-bundle.js 核心逻辑
- 代码分割优化
- 资源压缩
- Source map 生成
- 性能分析报告
```

## 多渠道构建策略

### Android 渠道配置
```bash
# Google Play 版本
android:google

# 华为应用市场版本  
android:huawei

# 直接分发版本
android
android:device
```

### 构建差异化
- **渠道标识**: 不同的 applicationId
- **资源替换**: 渠道特定的图标和名称
- **功能开关**: 渠道特定功能启用/禁用
- **统计配置**: 不同渠道的统计标识

## 安全特性

### 1. **生物识别认证**
```json
{
  "expo-local-authentication": "指纹/面容识别",
  "react-native-passkeys": "Passkey 支持",
  "@onekeyfe/react-native-check-biometric-auth-changed": "生物识别变更检测"
}
```

### 2. **安全存储**
```json
{
  "expo-secure-store": "系统级安全存储",
  "react-native-mmkv": "高性能本地存储",
  "realm": "本地数据库加密"
}
```

### 3. **网络安全**
```json
{
  "react-native-network-info": "网络状态检测",
  "react-native-capture-protection": "截屏保护",
  "expo-screen-capture": "屏幕录制防护"
}
```

## 性能优化

### 1. **启动性能**
- **启动追踪**: 自定义性能监控系统
- **Bundle 优化**: 代码分割和懒加载
- **预加载**: 关键资源预加载策略

### 2. **运行时性能**
```json
{
  "react-native-reanimated": "原生动画",
  "@shopify/flash-list": "高性能列表",
  "react-native-screens": "原生屏幕优化",
  "react-native-worklets": "JSI 性能提升"
}
```

### 3. **内存管理**
```json
{
  "react-native-performance-stats": "性能统计",
  "@onekeyfe/react-native-perf-memory": "内存监控",
  "realm": "高效数据库操作"
}
```

## 开发工作流

### 1. **开发命令**
```bash
# iOS 开发
yarn ios                    # 启动 iOS 模拟器
yarn ios:device           # 连接真机开发
yarn ios:pod-install      # 安装 iOS 依赖

# Android 开发  
yarn android              # 启动 Android 模拟器
yarn android:device       # 连接真机开发
yarn android:build        # 构建 APK

# Metro 开发服务器
yarn native-bundle        # 启动 Metro 打包服务
```

### 2. **测试工作流**
```bash
# E2E 测试
yarn detox:build:ios:sim:debug
yarn detox:test:ios:sim:debug

# 性能测试
yarn harness:test
yarn harness:test:android
```

### 3. **构建发布**
```bash
# EAS 云构建
eas build --platform ios
eas build --platform android

# 本地构建
yarn ios:build
yarn android:build
```

## 国际化支持

### 1. **多语言覆盖**
- **支持语言**: 20+ 种语言
- **本地化文件**: iOS (.lproj) 和 Android (res/values-*)
- **动态切换**: 运行时语言切换

### 2. **文本管理**
```json
{
  "@formatjs/intl-*": "国际化框架",
  "expo-localization": "设备语言检测",
  "react-native-localize": "本地化工具"
}
```

## 监控与分析

### 1. **错误监控**
```json
{
  "@sentry/react-native": "错误追踪",
  "react-native-logs": "日志系统"
}
```

### 2. **性能监控**
```json
{
  "@onekeyfe/react-native-perf-memory": "内存监控",
  "react-native-performance-stats": "性能统计"
}
```

### 3. **用户分析**
```json
{
  "@notifee/react-native": "通知分析",
  "jpush-react-native": "推送统计"
}
```

## 平台特定功能

### iOS 独有功能
- **Apple Pay**: 集成 Apple Pay 支付
- **iCloud**: 数据同步备份
- **Universal Links**: 深度链接支持
- **Background App Refresh**: 后台刷新

### Android 独有功能  
- **Google Pay**: 集成 Google Pay
- **Firebase**: 推送和分析服务
- **App Bundle**: 新的应用分发格式
- **Dynamic Feature Modules**: 动态功能模块

## 质量保证

### 1. **代码质量**
- **ESLint**: 代码规范检查
- **TypeScript**: 类型安全
- **Prettier**: 代码格式化

### 2. **测试覆盖**
- **Detox**: E2E 测试
- **Jest**: 单元测试
- **React Native Harness**: 性能测试

### 3. **安全审计**
- **依赖扫描**: 第三方库安全检查
- **代码审计**: 安全漏洞检测
- **渗透测试**: 应用安全测试

## 部署与发布

### 1. **应用商店发布**
- **Google Play**: 自动化发布流程
- **华为应用市场**: 特殊适配要求
- **TestFlight**: iOS 测试版本分发

### 2. **热更新**
```json
{
  "@onekeyfe/react-native-bundle-update": "热更新框架",
  "@onekeyfe/react-native-app-update": "应用更新"
}
```

### 3. **版本管理**
- **语义化版本**: 遵循 SemVer 规范
- **构建号**: 自动递增构建号
- **发布分支**: Git 分支管理策略

## 总结

Mobile App 作为 OneKey 的核心移动客户端，具备以下特点：

### 技术优势
1. **现代化技术栈**: React Native + Expo 最新版本
2. **完整测试体系**: E2E + 单元测试 + 性能测试
3. **多渠道支持**: 适配不同应用商店要求
4. **国际化完善**: 支持 20+ 种语言

### 架构优势
1. **模块化设计**: 清晰的依赖层次
2. **性能优化**: 多层次的性能优化策略
3. **安全优先**: 全面的安全防护措施
4. **开发效率**: 完善的开发工具链

### 业务优势
1. **全平台覆盖**: iOS + Android 完整支持
2. **硬件集成**: 支持多种硬件钱包
3. **用户体验**: 流畅的原生体验
4. **持续更新**: 热更新和快速迭代能力

---
*生成时间: 2026-03-22*
*分析范围: apps/mobile 目录完整分析*
