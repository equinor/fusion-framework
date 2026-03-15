import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { SignalRModuleConfigBuilderCallback } from '../../SignalRModuleConfigurator';
import { module } from '../../SignalRModule';
import { configureFromFramework } from './configure-from-framework';

/**
 * Call-signature overloads for {@link enableSignalR}.
 */
export interface enableSignalR {
  /**
   * Enable SignalR with a custom configuration builder callback.
   *
   * @param configurator - The module configurator instance
   * @param name - Hub name identifier
   * @param cb - Builder callback for manual hub configuration
   */
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    name: string,
    cb: SignalRModuleConfigBuilderCallback,
  ): void;

  /**
   * Enable SignalR using service-discovery to resolve the hub URL automatically.
   *
   * @param configurator - The module configurator instance
   * @param name - Hub name identifier
   * @param options - Service name and path used to resolve the hub endpoint
   */
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    name: string,
    options: { service: string; path: string },
  ): void;
}

/**
 * Register the SignalR module on a Fusion Framework configurator and add hub
 * configuration in a single call.
 *
 * Accepts either a manual builder callback or a service-discovery shorthand.
 * When the shorthand form is used, the hub URL and authentication token are
 * resolved automatically via the service-discovery and MSAL modules.
 *
 * @param configurator - The module configurator to register the SignalR module on
 * @param name - Hub name identifier (used as key in the hub registry)
 * @param optionsOrCallback - A builder callback for custom configuration, or
 *   `{ service, path }` to resolve the hub endpoint through service-discovery
 *
 * @example
 * ```ts
 * import { enableSignalR } from '@equinor/fusion-framework-module-signalr';
 *
 * // Using service-discovery shorthand
 * enableSignalR(configurator, 'portal', {
 *   service: 'portal',
 *   path: '/signalr/hubs/service-message',
 * });
 *
 * // Using a custom builder callback
 * enableSignalR(configurator, 'custom', (builder) => {
 *   builder.addHub('custom', {
 *     url: 'https://my-service.example.com/hub',
 *     options: { accessTokenFactory: () => getToken() },
 *   });
 * });
 * ```
 */
export function enableSignalR(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  name: string,
  optionsOrCallback: SignalRModuleConfigBuilderCallback | { service: string; path: string },
) {
  if (typeof optionsOrCallback === 'function') {
    configurator.addConfig({
      module,
      configure: (signalRConfigurator) => {
        signalRConfigurator.onCreateConfig(optionsOrCallback);
      },
    });
  } else {
    configurator.addConfig({
      module,
      configure: (signalRConfigurator) => {
        signalRConfigurator.onCreateConfig((builder) =>
          configureFromFramework({ name, ...optionsOrCallback }, builder),
        );
      },
    });
  }
}
