/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { lazy } from 'react';

import type { Fusion, AppManifest } from '@equinor/fusion-framework';
import FrameworkProvider from '@equinor/fusion-framework-react';

import { AnyModule, initializeModules, ModulesConfigType } from '@equinor/fusion-framework-module';

import { ModuleProvider, appModules, AppModules } from './modules';

/**
 * Interface for type hinting configuration callbacks
 * @example
 * ```ts
 * const configCallback: AppConfigurator = (configurator) => {
 *  configurator.http.configureClient(
 *     'bar', {
 *       baseUri: 'https://somewhere-test.com',
 *       defaultScopes: ['foo/.default']
 *     }
 *   );
 * };
 * ```
 */
export interface AppConfigurator<TModules extends Array<AnyModule> = []> {
    (
        config: ModulesConfigType<AppModules> & ModulesConfigType<TModules>,
        fusion: Fusion,
        env: AppManifest
    ): void | Promise<void>;
}

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
            // const client = fusion.modules.http.createClient('portal');
            // client.fetchAsync('/api/apps/${key}/config');
            // const env = await fusion.modules.serviceDiscovery.environment).services;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const configurator = async (config: any) => {
                if (configure) {
                    await Promise.resolve(configure(config, fusion, env));
                }
            };
            const value = await initializeModules(
                configurator,
                appModules.concat(modules),
                fusion.modules
            );
            return {
                default: () => (
                    <FrameworkProvider value={fusion}>
                        <ModuleProvider value={value}>
                            <Component />
                        </ModuleProvider>
                    </FrameworkProvider>
                ),
            };
        });

export default createApp;
