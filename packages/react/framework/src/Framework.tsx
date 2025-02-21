import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { createFrameworkProvider } from './create-framework-provider';
import { type PropsWithChildren, type ReactNode, Suspense, useMemo } from 'react';
import { useModules } from '@equinor/fusion-framework-react-module';

type ConfigureCallback = (configurator: FrameworkConfigurator) => void;

export const Framework = (
  props: PropsWithChildren<{
    readonly configure: ConfigureCallback;
    readonly fallback: NonNullable<ReactNode> | null;
  }>,
) => {
  const { configure, fallback, children } = props;
  //import modules from parent context
  const ref = useModules<[]>();
  const Component = useMemo(() => createFrameworkProvider(configure, ref), [configure, ref]);
  return (
    <Suspense fallback={fallback}>
      <Component>{children}</Component>
    </Suspense>
  );
};

export default Framework;
