import { lazy } from 'react';

import { FrameworkProvider } from '@equinor/fusion-framework-react';
import type { Fusion } from '@equinor/fusion-framework-react';

import { initializeAppModules } from '@equinor/fusion-framework-app';
import type { AppManifest, AppConfigurator, AppModules } from '@equinor/fusion-framework-app';

import type { AnyModule, ModulesInstanceType } from '@equinor/fusion-framework-module';

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { ModuleProvider as AppModuleProvider } from '@equinor/fusion-framework-react-module';

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
export const createApp =
    <TModules extends Array<AnyModule>>(
        Component: React.ComponentType,
        configure?: AppConfigurator<TModules>,
        modules?: TModules
    ) =>
    (fusion: Fusion, env: AppManifest): React.LazyExoticComponent<React.ComponentType> =>
        lazy(async () => {
            modules ??= [] as unknown as TModules;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const configurator = async (config: any) => {
                if (configure) {
                    await Promise.resolve(configure(config, fusion, env));
                }
            };

            const appInitiator = initializeAppModules(configurator, modules ?? []);

            const appModules = await appInitiator(fusion, env);
            appModules.event.dispatchEvent('onReactAppLoaded', {
                detail: { modules, fusion },
                source: Component,
            });
            return {
                default: () => (
                    <FrameworkProvider value={fusion}>
                        <AppModuleProvider value={appModules}>
                            <Component />
                        </AppModuleProvider>
                    </FrameworkProvider>
                ),
            };
        });

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onReactAppLoaded: FrameworkEvent<
            FrameworkEventInit<
                { modules: ModulesInstanceType<AppModules>; fusion: Fusion },
                React.ComponentType
            >
        >;
    }
}

export default createApp;
