import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react({
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
    }),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  vite: {
    define: {
      // 环境变量
      'import.meta.env.ONEKEY_PROXY': JSON.stringify(process.env.ONEKEY_PROXY),
    },
    optimizeDeps: {
      include: ['@onekeyhq/components', '@onekeyhq/kit', '@onekeyhq/shared'],
    },
  },
  devToolbar: {
    enabled: true,
  },
  site: 'https://onekey.so',
});
