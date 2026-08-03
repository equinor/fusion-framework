import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { enableServiceDiscoveryMock, type ServiceDiscoveryConfigMockFn } from './module';
import type { ServiceDiscoveryMockClientOptions } from './ServiceDiscoveryMockClient';

/**
 * Replaces service discovery with an in-memory registry.
 *
 * @remarks
 * Applications resolve service URIs and scopes exactly as they do in production,
 * but no service registry is contacted. Resolution is stable across runs.
 *
 * This is the one-call shorthand over {@link enableServiceDiscoveryMock}; reach
 * for the enabler directly when the callback alone is enough.
 *
 * @param configurator - The configurator to apply the mock to.
 * @param optionsOrConfigure - Registry options, or a configuration callback.
 * @param configure - Configuration callback when options were supplied.
 *
 * @example Point one service at a local test server
 * ```typescript
 * mockServiceDiscovery(configurator, {
 *   services: [{ key: 'apps', uri: 'http://localhost:6669/apps' }],
 * });
 * ```
 *
 * @example Point all services at a local mock server
 * ```typescript
 * mockServiceDiscovery(configurator, { baseUri: 'http://localhost:6669' });
 * ```
 *
 * @example Configure the registry through the builder
 * ```typescript
 * mockServiceDiscovery(configurator, (builder) => {
 *   builder.setBaseUri('http://localhost:6669');
 *   builder.addService({ key: 'my-api' });
 * });
 * ```
 */
export function mockServiceDiscovery(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: ServiceDiscoveryConfigMockFn,
): void;

export function mockServiceDiscovery(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  options?: ServiceDiscoveryMockClientOptions,
  configure?: ServiceDiscoveryConfigMockFn,
): void;

/**
 * Applies the mock service discovery configuration to a module configurator.
 *
 * @param configurator - The configurator receiving the mock module.
 * @param optionsOrConfigure - Registry options or a configuration callback.
 * @param configure - Optional callback used when options are supplied.
 */
export function mockServiceDiscovery(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  optionsOrConfigure?: ServiceDiscoveryMockClientOptions | ServiceDiscoveryConfigMockFn,
  configure?: ServiceDiscoveryConfigMockFn,
): void {
  const options = typeof optionsOrConfigure === 'function' ? {} : (optionsOrConfigure ?? {});
  const callback = typeof optionsOrConfigure === 'function' ? optionsOrConfigure : configure;

  enableServiceDiscoveryMock(configurator, (builder, ref) => {
    builder.configure(options);
    callback?.(builder, ref);
  });
}
