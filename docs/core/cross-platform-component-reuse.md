# Web 和 App 组件跨平台复用机制

## 一、核心原理

OneKey 通过**文件后缀机制 + 构建工具配置**实现 Web 和 App 组件的跨平台复用。

### 1.1 文件后缀机制

使用不同的文件后缀来区分平台实现：

| 后缀 | 平台 | 优先级 |
|------|------|--------|
| `.native.ts` | React Native (iOS/Android) | 最高 (RN 环境) |
| `.web.ts` | Web 浏览器 | 最高 (Web 环境) |
| `.desktop.ts` | Electron 桌面 | 最高 (Desktop 环境) |
| `.ext.ts` | 浏览器扩展 | 最高 (Extension 环境) |
| `.ios.ts` | iOS 特定 | 次高 |
| `.android.ts` | Android 特定 | 次高 |
| 无后缀 | 通用 | 最低 (回退) |

### 1.2 构建工具配置

不同平台使用不同的构建工具，但都支持文件后缀优先级：

- **Web**：Webpack 通过 `resolve.extensions` 配置
- **React Native**：Metro 通过 `sourceExts` 配置
- **Desktop**：Webpack/RSPack 通过 `resolve.extensions` 配置

## 二、Web 端实现机制

### 2.1 Webpack 配置

**文件：`development/webpack/utils.js`**

```javascript
exports.createResolveExtensions = function ({ platform, configName }) {
  const result = uniq([
    // 平台特定后缀（优先级最高）
    ...['.ts', '.tsx', '.js', '.jsx'].map((ext) => `.${platform}${ext}`),
    
    // Web 特定后缀
    '.web.ts',
    '.web.tsx',
    '.web.mjs',
    '.web.js',
    '.web.jsx',
    
    // 通用后缀（回退）
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs',
    '.js',
    '.jsx',
    '.json',
    '.wasm',
    '.d.ts',
  ]);
  return result;
};
```

**使用示例**：

```javascript
// development/webpack/webpack.base.config.js
const baseResolve = ({ platform, configName, basePath }) => ({
  mainFields: ['browser', 'module', 'main'],
  aliasFields: ['browser', 'module', 'main'],
  extensions: createResolveExtensions({ platform, configName }),
  symlinks: true,
  alias: {
    // 关键：将 react-native 映射到 react-native-web
    'react-native$': 'react-native-web',
    // ... 其他 alias
  },
  fallback: {
    // Node.js 模块的浏览器 polyfill
    crypto: require.resolve('@onekeyhq/shared/src/modules3rdParty/cross-crypto/index.js'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    // ...
  },
});
```

### 2.2 React Native Web 映射

Webpack 配置中的关键 alias：

```javascript
alias: {
  // 将所有 react-native 引用映射到 react-native-web
  'react-native$': 'react-native-web',
  
  // 具体组件映射
  'react-native/Libraries/Components/View/ViewStylePropTypes$':
    'react-native-web/dist/exports/View/ViewStylePropTypes',
  'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
    'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
  // ...
}
```

这使得在 Web 环境中使用 React Native 组件时，自动使用 react-native-web 的实现。

## 三、React Native 端实现机制

### 3.1 Metro 配置

**文件：`apps/mobile/metro.config.js`**

```javascript
config.resolver = config.resolver || {};
config.resolver.sourceExts = [
  ...(config.resolver.sourceExts || []),
  'text-js',
  'd.ts',
  'cjs',
  'min.js',
  'svgx', // 自定义 SVG 扩展
];

// Node.js 模块的 React Native polyfill
config.resolver.extraNodeModules = {
  crypto: require.resolve('@onekeyhq/shared/src/modules3rdParty/cross-crypto/index.native.js'),
  fs: require.resolve('react-native-level-fs'),
  path: require.resolve('path-browserify'),
  stream: require.resolve('readable-stream'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tcp-socket'),
  zlib: require.resolve('browserify-zlib'),
};
```

### 3.2 平台特定文件解析

Metro 在解析模块时会自动选择平台特定的文件：

```javascript
// Metro 内部解析逻辑（简化）
function resolveModule(modulePath, platform) {
  const extensions = [
    `.${platform}.ts`,
    `.${platform}.tsx`,
    '.ts',
    '.tsx',
    `.${platform}.js`,
    `.${platform}.jsx`,
    '.js',
    '.jsx',
  ];
  
  for (const ext of extensions) {
    const fullPath = modulePath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return modulePath; // 回退到原始路径
}
```

## 四、具体实现示例

### 4.1 useBackHandler Hook

**Web 实现：`packages/components/src/hooks/useBackHandler.ts`**

```typescript
import { useCallback, useEffect } from 'react';

const stopDefaultBackHandler = () => true;

export const useBackHandler = (
  callback: () => boolean = stopDefaultBackHandler,
  enable: boolean | undefined = true,
  isKeyDown = true,
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback?.();
      }
    },
    [callback],
  );

  useEffect(() => {
    if (!enable) return;
    globalThis.addEventListener(isKeyDown ? 'keydown' : 'keyup', handleKeyDown);
    return () => {
      globalThis.removeEventListener(
        isKeyDown ? 'keydown' : 'keyup',
        handleKeyDown,
      );
    };
  }, [enable, handleKeyDown, isKeyDown]);
};
```

**React Native 实现：`packages/components/src/hooks/useBackHandler.native.ts`**

```typescript
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

const stopDefaultBackHandler = () => true;

export const useBackHandler = (
  callback: () => boolean = stopDefaultBackHandler,
  enable: boolean | undefined = true,
) => {
  useEffect(() => {
    if (!enable) return;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      callback,
    );
    return () => backHandler.remove();
  }, [callback, enable]);
};
```

**使用方式**（平台无关）：

```typescript
import { useBackHandler } from '@onekeyhq/components';

// 在任何平台都可以这样使用
useBackHandler(() => {
  // 处理返回逻辑
  return true; // 阻止默认行为
});
```

### 4.2 Button 组件

Button 组件使用 Tamagui 实现跨平台样式：

```typescript
// packages/components/src/primitives/Button/index.tsx
import {
  ThemeableStack,
  styled,
  useProps,
  withStaticProperties,
} from '@onekeyhq/components/src/shared/tamagui';

export interface IButtonProps extends ThemeableStackProps {
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  size?: 'small' | 'medium' | 'large';
  variant?: 'secondary' | 'tertiary' | 'primary' | 'destructive';
  icon?: IKeyOfIcons;
  disabled?: boolean;
  loading?: boolean;
  // ...
}

export const Button = styled(ThemeableStack, {
  name: 'Button',
  // Tamagui 样式配置（跨平台）
  backgroundColor: '$bg',
  // ...
});
```

Tamagui 自动处理平台差异，生成对应的 CSS（Web）或原生样式（React Native）。

## 五、Tamagui 的作用

### 5.1 什么是 Tamagui

Tamagui 是一个跨平台的 UI 库，可以：
- 在 Web 上生成优化的 CSS
- 在 React Native 上使用原生组件
- 提供统一的 API

### 5.2 Tamagui 配置

**文件：`packages/components/src/shared/tamagui/index.ts`**

```typescript
import { createTamagui } from '@tamagui/core';

export const tamaguiConfig = createTamagui({
  themes: {
    light: {
      bg: '#ffffff',
      color: '#000000',
      // ...
    },
    dark: {
      bg: '#000000',
      color: '#ffffff',
      // ...
    },
  },
  shorthands: {
    // 样式快捷键
  },
});
```

### 5.3 跨平台样式

```typescript
// 同样的样式代码，在不同平台生成不同的输出
const Button = styled(ThemeableStack, {
  backgroundColor: '$bg',
  padding: 10,
  borderRadius: 8,
});

// Web：生成 CSS
// .Button { background-color: var(--bg); padding: 10px; border-radius: 8px; }

// React Native：使用 StyleSheet.create
// { backgroundColor: theme.bg, padding: 10, borderRadius: 8 }
```

## 六、平台环境检测

### 6.1 platformEnv.ts

**文件：`packages/shared/src/platformEnv.ts`**

```typescript
export type IAppPlatform =
  | 'extension'
  | 'ios'
  | 'android'
  | 'desktop'
  | 'web'
  | 'web-embed';

export type IPlatformEnv = {
  isWeb?: boolean;
  isDesktop?: boolean;
  isExtension?: boolean;
  isNative?: boolean;
  // ... 更多平台检测
};

export const platformEnv: IPlatformEnv = {
  // 运行时检测当前平台
  isWeb: typeof window !== 'undefined',
  isNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  // ...
};
```

### 6.2 使用示例

```typescript
import { platformEnv } from '@onekeyhq/shared';

if (platformEnv.isNative) {
  // React Native 特定代码
} else if (platformEnv.isWeb) {
  // Web 特定代码
}
```

## 七、依赖管理策略

### 7.1 依赖分层

```
components (UI 层)
  ├─ react-native-web (Web 平台)
  ├─ react-native (RN 平台)
  └─ tamagui (跨平台样式)

kit (业务逻辑层)
  ├─ components (UI 组件)
  ├─ core (区块链核心)
  └─ shared (工具函数)

core (核心层)
  └─ 纯 JavaScript/TypeScript (平台无关)
```

### 7.2 条件依赖

```json
// packages/components/package.json
{
  "dependencies": {
    "@onekeyfe/react-native-scroll-guard": "1.1.46", // RN 特定
    "@react-navigation/native": "7.1.28", // RN 特定
    "react-native-svg": "15.15.1", // RN 特定
    "moti": "^0.25.3", // 动画库（跨平台）
    "react-hook-form": "^7.22.1", // 表单（跨平台）
    // ...
  }
}
```

Web 构建时，RN 特定依赖通过 alias 和 fallback 处理。

## 八、复用策略总结

### 8.1 设计原则

1. **接口统一**：相同功能提供统一接口
2. **实现隔离**：平台差异通过文件后缀隔离
3. **优先级明确**：平台特定文件优先于通用文件
4. **自动选择**：构建工具自动选择正确的实现

### 8.2 实施步骤

1. **创建通用接口**：定义平台无关的 API
2. **实现平台版本**：为每个平台创建特定实现
3. **配置构建工具**：设置文件后缀优先级
4. **处理依赖差异**：通过 alias 和 fallback 处理
5. **测试验证**：在各平台测试功能一致性

### 8.3 最佳实践

1. **优先使用跨平台库**：如 Tamagui、react-native-web
2. **最小化平台特定代码**：只在必要时创建平台特定文件
3. **统一状态管理**：使用 Jotai 等跨平台状态管理库
4. **共享业务逻辑**：将业务逻辑放在平台无关的包中
5. **类型安全**：使用 TypeScript 确保接口一致性

## 九、脚手架应用建议

基于 OneKey 的学习，设计 Web3 monorepo 脚手架时：

### 9.1 文件组织

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.tsx          # 通用实现
│   │   │   ├── index.web.ts       # Web 特定
│   │   │   └── index.native.ts    # RN 特定
│   │   └── ...
│   └── hooks/
│       ├── useBackHandler.ts      # 通用
│       ├── useBackHandler.web.ts  # Web
│       └── useBackHandler.native.ts # RN
```

### 9.2 构建配置

**Web (Webpack)**：

```javascript
{
  resolve: {
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
    },
  }
}
```

**React Native (Metro)**：

```javascript
{
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'jsx'],
  }
}
```

### 9.3 UI 库选择

推荐使用以下跨平台 UI 库：

- **Tamagui**：跨平台样式系统
- **React Native Web**：RN 组件的 Web 实现
- **React Navigation**：跨平台导航
- **Jotai**：跨平台状态管理

## 十、注意事项

1. **性能考虑**：Web 端避免过度使用 RN 组件
2. **样式差异**：注意 Web 和 RN 的样式差异
3. **API 差异**：某些 API 在不同平台行为不同
4. **包体积**：Web 端需要优化包体积
5. **测试覆盖**：确保各平台功能一致性

---

> **学习来源**：OneKey/app-monorepo 跨平台组件复用实现
> 
> **核心机制**：文件后缀 + 构建工具配置 + React Native Web + Tamagui
