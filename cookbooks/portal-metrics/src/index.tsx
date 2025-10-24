import { createElement, type FC, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { createFrameworkProvider, type Fusion } from '@equinor/fusion-framework-react';

import { type ComponentRenderArgs, frameworkConfig, type PortalModuleInitiator } from './framworkConfig';
import { Portal } from './Portal';

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
}

export const render = (el: HTMLElement, args: ComponentRenderArgs) => {
  const portal = createPortal(frameworkConfig, args, Portal);

  const portalComponent = createElement(Wrapper, { Component: portal });
  const root = createRoot(el);

  root.render(portalComponent);

  return () => root.unmount();
};
export default render;
