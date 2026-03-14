import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { createFrameworkProvider } from './create-framework-provider';
import { type PropsWithChildren, type ReactNode, Suspense, useMemo } from 'react';
import { useModules } from '@equinor/fusion-framework-react-module';
import type { ModulesInstance } from '@equinor/fusion-framework-module';

/**
 * Callback invoked during framework initialisation to configure modules.
 *
 * @param configurator - The framework configurator instance to apply settings to.
 */
type ConfigureCallback = (configurator: FrameworkConfigurator) => void;

/**
 * Declarative React component that initialises a Fusion Framework instance
 * and provides it to descendant components via context.
 *
 * @remarks
 * Internally calls {@link createFrameworkProvider} and wraps the lazy-loaded
 * provider in a `<Suspense>` boundary. This is the recommended high-level
 * component for portal / host applications that need to bootstrap the
 * framework inside a React tree.
 *
 * @param props.configure - Callback that receives a {@link FrameworkConfigurator}
 *   for registering modules and configuration.
 * @param props.fallback - React node shown while the framework is initialising.
 * @param props.parent - Optional parent module instance to inherit configuration from.
 * @param props.children - Application content rendered after initialisation.
 *
 * @example
 * ```tsx
 * import { Framework } from '@equinor/fusion-framework-react';
 *
 * const App = () => (
 *   <Framework
 *     configure={(configurator) => {
 *       configurator.http.configureClient('my-api', { baseUri: 'https://api.example.com' });
 *     }}
 *     fallback={<span>Loading…</span>}
 *   >
 *     <MyApp />
 *   </Framework>
 * );
 * ```
 */
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
