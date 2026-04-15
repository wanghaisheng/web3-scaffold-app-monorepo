import React, { Suspense, lazy } from 'react';
import { KitProvider } from '@onekeyhq/kit';
import { debugLandingLog } from '@onekeyhq/shared/src/performance/init';

// 懒加载开发工具
const AgentationDev = process.env.NODE_ENV !== 'production'
  ? lazy(() => import('agentation').then((m) => ({ default: m.Agentation })))
  : () => null;

interface Props {
  children?: React.ReactNode;
}

export default function ReactAppWrapper({ children }: Props) {
  if (process.env.NODE_ENV !== 'production') {
    debugLandingLog('ReactAppWrapper render');
  }

  return (
    <KitProvider>
      {children}
      {process.env.NODE_ENV !== 'production' ? (
        <Suspense fallback={null}>
          <AgentationDev endpoint="http://localhost:4747" />
        </Suspense>
      ) : null}
    </KitProvider>
  );
}
