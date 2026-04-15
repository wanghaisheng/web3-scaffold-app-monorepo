# Applications Architecture Overview

This document describes the technical architecture of each application in the `apps/` directory. It serves as a reference for teams building new applications using the OneKey monorepo structure.

## 1. `apps/web-astro`

- **Framework**: Astro (v4) with React Island architecture
- **Rendering**: Hybrid static site generation + server-side rendering
- **Styling**: Tailwind CSS + CSS Modules
- **Key Dependencies**:
  - `@astrojs/react` (React component integration)
  - `@astrojs/tailwind` (utility-first styling)
  - `@onekeyhq/components` (shared UI primitives)
  - `@onekeyhq/kit` (business logic hooks)
- **Build Pipeline**:
  ```bash
  yarn workspace @onekeyhq/web-astro dev   # Development server
  yarn workspace @onekeyhq/web-astro build # Production build
  ```
- **Deployment**: Static assets served via Cloudflare Pages / Vercel

## 2. `apps/web-embed`

- **Framework**: Astro (v4) with Vue island architecture
- **Rendering**: Component-level hydration with minimal JS
- **Styling**: Same as web-astro (Tailwind CSS)
- **Key Dependencies**:
  - `@astrojs/vue` (Vue component integration)
  - `@onekeyhq/components`
  - `@onekeyhq/shared` (i18n & utility functions)
- **Special Features**:
  - Embeds third-party widgets via sandboxed iframes
  - Stubbed API routes for offline mode

## 3. `apps/mobile`

- **Framework**: React Native (0.81.5)
- **UI**: Native components + OneKey UI library
- **State Management**: Redux Toolkit + Jotai
- **Key Dependencies**:
  - `react-native` core
  - `react-native-web` (code sharing with web)
  - `@onekeyhq/react-native-*` (platform-specific modules)
  - `@react-native-community/cli` (toolchain)
- **Build Commands**:
  ```bash
  yarn workspace @onekeyhq/mobile ios      # iOS setup
  yarn workspace @onekeyhq/mobile android  # Android setup
  ```

## 4. `apps/web`

- **Framework**: Traditional React SPA (Webpack/RSPack)
- **Bundler**: RSPack with Webpack-compatible config
- **Routing**: React Router v7
- **Key Dependencies**:
  - `react`, `react-dom`
  - `@onekeyhq/components`
  - `@onekeyhq/kit`
  - `rspack` (fast bundling)
- **Dev Server**:
  ```bash
  yarn workspace @onekeyhq/web dev:renderer # Start dev server
  ```

## 5. `apps/desktop`

- **Framework**: Electron (v39.5.1)
- **Main Process**: TypeScript + Node.js
- **Renderer Process**: React (v19.1.0) + CSP-compliant UI
- **Key Dependencies**:
  - `electron`
  - `electron-builder` (packaging)
  - `@onekeyhq/components`
  - `@onekeyhq/kit-bg` (background services)
- **Build Commands**:
  ```bash
  yarn workspace @onekeyhq/desktop dev:main   # Start main process
  yarn workspace @onekeyhq/desktop dev:renderer # Start renderer
  ```

## 6. `apps/ext`

- **Framework**: Web extension (Manifest V3)
- **Core**: Webpack bundle + content scripts
- **APIs**:
  - Chrome/Edge browser APIs
  - `react-native-web` (shared UI components)
- **Key Dependencies**:
  - `webextension-polyfill`
  - `@onekeyhq/components`
  - `@onekeyhq/kit`
- **Packaging**:
  ```bash
  yarn workspace @onekeyhq/ext build:all:v3
  ```

## 7. Common Patterns

- **Namespace Isolation**: Each app lives in its own folder with independent dependencies
- **Shared Packages**:
  - UI primitives: `@onekeyhq/components`
  - Core logic: `@onekeyhq/kit`, `@onekeyhq/shared`
  - Auth & wallet: `@onekeyhq/core`
- **Environment Configuration**: `.env.*` files per-app (e.g., `.env.mobile`)
- **Cross-App Communication**: EventBus via `@onekeyhq/shared` (avoid direct imports)

## 8. `apps/react-native-godot-demo`

- **Framework**: React Native (0.81.5) + Expo (~54.0.22)
- **Engine**: Godot Engine integration via `@borndotcom/react-native-godot`
- **Navigation**: Expo Router with React Navigation
- **Key Dependencies**:
  - `@borndotcom/react-native-godot` (Godot Engine integration)
  - `expo-router` (file-based routing)
  - `@react-navigation/bottom-tabs` (tab navigation)
  - `react-native-reanimated` (animations)
  - `react-native-gesture-handler` (touch controls)
- **Special Features**:
  - Cross-platform Godot game embedding
  - Custom touch controls overlay
  - Direct Godot Input API access
  - Custom Expo plugin for iOS/Android builds
  - LibGodot prebuilt libraries management
- **Build Commands**:
  ```bash
  pnpm install                    # Install + download prebuilt libraries
  pnpm start                      # Start Expo development server
  pnpm run android                # Run on Android
  pnpm run ios                    # Run on iOS
  pnpm run web                    # Run on web
  ```

## 9. Development Workflow

1. Create new app scaffold:
   ```bash
   npx degit template-app apps/new-app
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
4. Start development server (app-specific command)
5. Run tests:
   ```bash
   yarn workspace @onekeyhq/<app> test
   ```

## 10. Naming Conventions

- Prefix all workspace names with `@onekeyhq/`
- Use kebab-case for UI components
- Keep API contracts in `/src/api` folders
- All public hooks must be documented in `/src/docs`

> **Note**: When adding new apps, register them in the root `package.json` workspaces array and update the monorepo alias map in `tsconfig.base.json`.
