import { createElement, type FC, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { createFrameworkProvider, type Fusion } from '@equinor/fusion-framework-react';

import {
  type ComponentRenderArgs,
  frameworkConfig,
  type PortalModuleInitiator,
} from './framworkConfig';
import { Router } from './Router';

const createPortal = <TRef extends Fusion = Fusion>(
  config: PortalModuleInitiator<TRef>,
  args: ComponentRenderArgs,
  Component: FC,
) =>
  lazy(async () => {
    const Framework = createFrameworkProvider(config, args.ref);

    return {
      default: () => (
        <Framework>
          <Component />
        </Framework>
      ),
    };
  });

const Wrapper = ({ Component }: { Component: React.ComponentType }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

export const render = (el: HTMLElement, args: ComponentRenderArgs) => {
  const router = createPortal(frameworkConfig, args, Router);

  const routerComponent = createElement(Wrapper, { Component: router });
  const root = createRoot(el);

  root.render(routerComponent);

  return () => root.unmount();
};
export default render;
