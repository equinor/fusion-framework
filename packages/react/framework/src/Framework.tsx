import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { createFrameworkProvider } from './create-framework-provider';
import { type PropsWithChildren, type ReactNode, Suspense, useMemo } from 'react';
import { useModules } from '@equinor/fusion-framework-react-module';
import type { ModulesInstance } from '@equinor/fusion-framework-module';

type ConfigureCallback = (configurator: FrameworkConfigurator) => void;

export const Framework = (
  props: PropsWithChildren<{
    readonly configure: ConfigureCallback;
    readonly fallback: NonNullable<ReactNode> | null;
    // biome-ignore lint/suspicious/noExplicitAny: should allow any
    readonly parent?: ModulesInstance<any>;
  }>,
) => {
  const { configure, fallback, parent, children } = props;
  //import modules from parent context
  const ref = useModules<[]>();
  const Component = useMemo(
    () => createFrameworkProvider(configure, parent ?? ref),
    [configure, ref, parent],
  );
  return (
    <Suspense fallback={fallback}>
      <Component>{children}</Component>
    </Suspense>
  );
};

export default Framework;
