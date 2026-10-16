import type React from 'react';
import { lazy } from 'react';

import { FrameworkProvider } from '@equinor/fusion-framework-react';
import type { Fusion } from '@equinor/fusion-framework-react';

import { type AppEnv, configureModules } from '@equinor/fusion-framework-app';
import type { AppModuleInitiator, AppModulesInstance } from '@equinor/fusion-framework-app';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { ModuleProvider as AppModuleProvider } from '@equinor/fusion-framework-react-module';
import { componentTeardowns } from './component-teardowns.js';

export type ComponentRenderArgs<TFusion extends Fusion = Fusion, TEnv = AppEnv> = {
  fusion: TFusion;
  env: TEnv;
  /** Receives uncaught errors raised while the application renders or initializes its modules. */
  onError?: (error: unknown) => void;
};

export type ComponentRenderer<TFusion extends Fusion = Fusion, TEnv = AppEnv> = (
  fusion: TFusion,
  env: TEnv,
) => React.LazyExoticComponent<React.ComponentType>;

/**
 * @deprecated
 * Creates an lazy loading Component which configures modules
 * and provides context to framework and configured modules
 *
 *
 * ```mermaid
 * sequenceDiagram
 * App ->>+Framework: createApp
 * Framework->>-Framework: initializeModules
 * Framework->>App: configure(modules, framework, args)
 * App-->Framework: await configuration
 * Framework->>App: React.LazyExoticComponent
 * ```
 *
 * @example
 * ```tsx
 * const configCallback: AppConfigurator = (configurator) => {
 *  configurator.configureHttpClient(
 *     'bar', {
 *       baseUri: 'https://somewhere-test.com',
 *       defaultScopes: ['foo/.default']
 *     }
 *   );
 * };
 *
 * export const App = () => {
 *   const client = useHttpClient('bar');
 *   const [foo, setFoo] = useState('no value');
 *   const onClick = useCallback(() => {
 *     client.fetchAsync('api').then(x => x.json).then(setFoo);
 *   }, [client]);
 *   return <Button onClick={onClick}>{foo}</Button>
 * }
 *
 * export const render = createApp(App, configCallback);
 *
 * export default render;
 * ```
 *
 *
 * __Exposed providers__
 * @see {@link @equinor/fusion-framework-react.FrameworkProvider | FrameworkProvider}
 * @see {@link ModuleProvider | ModuleProvider}
 *
 * @template TModules module types included in configuration.
 * @param Component - React component to render
 * @param configure - Callback for configuring application
 * @param modules - required modules for application
 */
export const createComponent =
  <TModules extends Array<AnyModule>, TRef extends Fusion = Fusion, TEnv extends AppEnv = AppEnv>(
    Component: React.ElementType,
    configure?: AppModuleInitiator<TModules, TRef, TEnv>,
  ): ComponentRenderer<TRef, TEnv> =>
  (fusion, env) => {
    // Set when the host unmounts before (or after) initialization finishes.
    let disposed = false;
    let modules: AppModulesInstance | undefined;

    const releaseModules = (): void => {
      // Guard so a repeated teardown does not dispose twice
      if (!modules) return;
      const instance = modules;
      modules = undefined;
      // Module disposal is asynchronous at runtime; surface failures instead of dropping them
      Promise.resolve(instance.dispose()).catch((error: unknown) => {
        console.error('Failed to dispose application modules', error);
      });
    };

    const LazyComponent = lazy(async (): Promise<{ default: React.ComponentType }> => {
      const init = configureModules<TModules, TRef, TEnv>(configure);
      // configureModules returns a generic modules instance; narrow it to the
      // app-specific shape expected by consumers of this component.
      modules = (await init({
        fusion,
        env,
      })) as unknown as AppModulesInstance;

      // Unmounted while initializing: release what was just created and render nothing.
      if (disposed) {
        releaseModules();
        return { default: () => null };
      }

      const appModules = modules;
      appModules.event.dispatchEvent('onReactAppLoaded', {
        detail: { modules: appModules, fusion, env: env },
        source: Component,
      });
      return {
        default: () => (
          <FrameworkProvider value={fusion}>
            <AppModuleProvider value={appModules}>
              {/* TODO(#5083): tighten generics so Component no longer needs @ts-ignore */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
              {/* @ts-ignore */}
              <Component />
            </AppModuleProvider>
          </FrameworkProvider>
        ),
      };
    });

    componentTeardowns.set(LazyComponent, () => {
      disposed = true;
      releaseModules();
    });
    return LazyComponent;
  };

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onReactAppLoaded: FrameworkEvent<
      FrameworkEventInit<
        { modules: AppModulesInstance; fusion: Fusion; env: AppEnv },
        React.ComponentType
      >
    >;
  }
}

export default createComponent;
