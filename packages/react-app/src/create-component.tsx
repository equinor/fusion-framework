import React, { lazy } from 'react';

import { FrameworkProvider } from '@equinor/fusion-framework-react';
import type { Fusion } from '@equinor/fusion-framework-react';

import { configureModules } from '@equinor/fusion-framework-app';
import type {
    AppManifest,
    AppModuleInitiator,
    AppModulesInstance,
} from '@equinor/fusion-framework-app';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { ModuleProvider as AppModuleProvider } from '@equinor/fusion-framework-react-module';

export type ComponentRenderArgs<
    TFusion extends Fusion = Fusion,
    TManifest extends AppManifest = AppManifest
> = { fusion: TFusion; env: TManifest };

export type ComponentRenderer<
    TFusion extends Fusion = Fusion,
    TManifest extends AppManifest = AppManifest
> = (fusion: TFusion, env: TManifest) => React.LazyExoticComponent<React.ComponentType>;

/**
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
 *  configurator.http.configureClient(
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
    <
        TModules extends Array<AnyModule>,
        TRef extends Fusion = Fusion,
        TManifest extends AppManifest = AppManifest
    >(
        Component: React.ComponentType,
        configure?: AppModuleInitiator<TModules, TRef, TManifest>
    ): ComponentRenderer<TRef, TManifest> =>
    (fusion, env) =>
        lazy(async () => {
            const init = configureModules<TModules, TRef, TManifest>(configure);
            const modules = (await init({
                fusion,
                manifest: env,
            })) as unknown as AppModulesInstance;

            modules.event.dispatchEvent('onReactAppLoaded', {
                detail: { modules, fusion },
                source: Component,
            });
            return {
                default: () => (
                    <FrameworkProvider value={fusion}>
                        <AppModuleProvider value={modules}>
                            <Component />
                        </AppModuleProvider>
                    </FrameworkProvider>
                ),
            };
        });

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onReactAppLoaded: FrameworkEvent<
            FrameworkEventInit<{ modules: AppModulesInstance; fusion: Fusion }, React.ComponentType>
        >;
    }
}

export default createComponent;
