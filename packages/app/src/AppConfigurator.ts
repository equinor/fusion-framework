import type { FusionModulesInstance } from '@equinor/fusion-framework';

import {
  type AnyModule,
  type IModulesConfigurator,
  ModuleConsoleLogger,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';

import http, {
  configureHttpClient,
  configureHttp,
  type HttpClientOptions,
} from '@equinor/fusion-framework-module-http';

import type { HttpClientMsal } from '@equinor/fusion-framework-module-http/client';

import auth from '@equinor/fusion-framework-module-msal';

import type { AppEnv, AppModules, AppModulesInstance } from './types';
import { AppModulesConfiguredEvent, AppModulesInitializedEvent } from './events';
import { AppConfiguratorError } from './error';
import { deepClone, deepFreeze, type DeepImmutable } from './utils';

/**
 * Type definition for AppConfigurator constructor
 */
export type AppConfiguratorConstructor<
  TModules extends readonly AnyModule[] = [],
  TRef extends FusionModulesInstance = FusionModulesInstance,
  TEnv extends AppEnv = AppEnv,
> = {
  new (env: TEnv, ref?: TRef): IAppConfigurator<TModules, TRef>;
};

/**
 * Configurator for configuring application modules
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 */
export interface IAppConfigurator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends FusionModulesInstance = FusionModulesInstance,
> extends IModulesConfigurator<AppModules<TModules>, TRef> {
  readonly manifest: DeepImmutable<AppEnv['manifest']>;

  /**
   * [optional]
   * enable/configure the http module
   */
  configureHttp(...args: Parameters<typeof configureHttp>): void;

  /**
     * [optional]
     * Configure a named http client.
     * @example
     * ```ts
     configurator.configureHttpClient(
        'myClient',
        {
            baseUri: 'https://foo.bar',
            defaultScopes: ['client-id/.default']
        }
    );
     * ```
     */
  configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

  /**
   * [optional]
   *
   * configure a http client which is resolved by service discovery
   *
   * @param serviceName - name of the service to use
   */
  useFrameworkServiceClient(
    serviceName: string,
    options?: Omit<HttpClientOptions<HttpClientMsal>, 'baseUri' | 'defaultScopes'>,
  ): void;
}

/**
 * Configures and manages application modules within the Fusion framework.
 *
 * @template TModules - The array of modules to be configured.
 * @template TRef - The reference type for module instances.
 * @template TEnv - The environment type containing the application manifest.
 *
 * @extends ModulesConfigurator<AppModules<TModules>, TRef>
 * @implements IAppConfigurator<TModules, TRef>
 *
 * @remarks
 * The `AppConfigurator` is responsible for initializing, configuring, and notifying
 * about the state of application modules. It provides utility methods for configuring
 * HTTP and HTTP client modules, as well as integrating framework service clients.
 *
 * @example
 * ```typescript
 * const appConfigurator = new AppConfigurator(env, ref);
 * appConfigurator.configureHttp({ ... });
 * appConfigurator.useFrameworkServiceClient('my-service');
 * ```
 *
 * @param env - The application environment, including the manifest.
 * @param ref - Optional reference to the Fusion modules instance.
 *
 * @property manifest - The application manifest from the environment.
 *
 * @method configureHttp - Adds HTTP configuration to the app.
 * @method configureHttpClient - Adds HTTP client configuration to the app.
 * @method useFrameworkServiceClient - Configures a framework service client by service name.
 */
export class AppConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance,
    TEnv extends AppEnv = AppEnv,
  >
  extends ModulesConfigurator<AppModules<TModules>, TRef>
  implements IAppConfigurator<TModules, TRef>
{
  #manifest: DeepImmutable<AppEnv['manifest']>;

  constructor(
    public readonly env: TEnv,
    ref?: TRef,
  ) {
    super([event, http, auth]);
    this.logger = new ModuleConsoleLogger('AppConfigurator');
    this.#manifest = deepFreeze(deepClone(env.manifest));

    /**
     * TODO - Add app configuration load time tracking
     */
    this.onConfigured((configs) => {
      // Notify when app modules are configured
      const event = new AppModulesConfiguredEvent<TModules>({
        detail: {
          appKey: this.#manifest.appKey,
          configs,
        },
      });
      ref?.event.dispatchEvent(event);
    });

    this.onInitialized((modules) => {
      // Notify when app modules are initialized
      const event = new AppModulesInitializedEvent<TModules>({
        detail: {
          appKey: this.#manifest.appKey,
          modules: modules as AppModulesInstance<TModules>,
        },
        canBubble: true,
      });
      modules.event.dispatchEvent(event);
      modules.event.dispatchEvent('onAppModulesLoaded', event);
    });
  }

  /**
   * Gets the immutable application manifest.
   *
   * @returns The deeply frozen application manifest that cannot be modified.
   */
  get manifest(): DeepImmutable<AppEnv['manifest']> {
    return this.#manifest;
  }

  public configureHttp(...args: Parameters<typeof configureHttp>) {
    this.addConfig(configureHttp(...args));
  }

  public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
    this.addConfig(configureHttpClient(...args));
  }

  public useFrameworkServiceClient(
    serviceName: string,
    options?: Omit<HttpClientOptions<HttpClientMsal>, 'baseUri' | 'defaultScopes'>,
  ): void {
    this.addConfig({
      module: http,
      configure: async (config, ref) => {
        const serviceDiscovery = ref?.serviceDiscovery;
        if (!serviceDiscovery) {
          throw new AppConfiguratorError('Service discovery is not available', 'configuration');
        }
        const service = await serviceDiscovery?.resolveService(serviceName);
        if (!service) {
          throw new AppConfiguratorError(
            `Unable to resolve service [${serviceName}] during configuration.`,
            'configuration',
          );
        }
        config.configureClient(serviceName, {
          ...options,
          baseUri: service.uri,
          defaultScopes: service.defaultScopes,
        });
      },
    });
  }
}

export default AppConfigurator;
