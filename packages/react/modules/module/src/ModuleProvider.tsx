/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  lazy,
  useEffect,
  type LazyExoticComponent,
  type FunctionComponent,
  type ReactNode,
} from 'react';

import {
  initializeModules,
  type ModulesConfigurator,
  type ModulesInstanceType,
  type AnyModule,
} from '@equinor/fusion-framework-module';

import moduleContext from './context';

type ModuleProviderCreator = <
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef extends ModulesInstanceType<[AnyModule]> = any,
>(
  configurator: ModulesConfigurator<TModules>,
  modules: TModules,
  ref?: TRef,
) => Promise<LazyExoticComponent<FunctionComponent>>;

/**
 * Function for creating a `ModuleProvider` component.
 *
 * __NOTE:__ this function requires component to be wrapped in `Suspense`
 *
 * @example
 * ```ts
 * import http, { HttpModule } from '@equinor/fusion-framework-module-http';
 * import msal, { MsalModule } from '@equinor/fusion-framework-module-msal';
 * import { createModuleProvider } from '@equinor/fusion-framework-react-module';
 *
 * export default createModuleProvider(
 *   (config) => {
 *     config.auth.configureDefault({
 *       tenantId: 'MY_TENANT_ID',
 *       clientId: 'MY_CLIENT_ID',
 *       redirectUri: '/authentication/login-callback',
 *     });
 *     config.http.configureClient('foo', {
 *       baseUri: 'https://foo.bar',
 *       defaultScopes: ['FOO_CLIENT_ID/.default'],
 *     });
 *   },
 *  [http, msal]
 *);
 * ```
 * @param configurator callback for configuring provided modules
 * @param modules modules which should be initiated
 * @param ref optional parent module instance
 * @returns Suspensive `ModuleProvider`
 */
export const createModuleProvider: ModuleProviderCreator = async <
  TModules extends Array<AnyModule>,
  TRef extends ModulesInstanceType<[AnyModule]> = any,
>(
  configurator: ModulesConfigurator<TModules>,
  ref?: TRef,
): Promise<LazyExoticComponent<FunctionComponent>> => {
  const Component = lazy(async () => {
    const { dispose, ...instance } = await initializeModules<TModules, TRef>(configurator, ref);
    return {
      default: ({ children }: { children?: ReactNode }) => {
        // biome-ignore lint/correctness/useExhaustiveDependencies: should dispose when new instance is provided
        useEffect(() => dispose, [instance]);
        return <ModuleProvider value={instance}>{children}</ModuleProvider>;
      },
    };
  });
  return Component;
};

export const ModuleProvider = moduleContext.Provider;

export default ModuleProvider;
