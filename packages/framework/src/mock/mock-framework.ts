import type { AnyModule } from '@equinor/fusion-framework-module';

import { init } from '../init.js';
import type { Fusion } from '../types.js';

import { FrameworkMockConfigurator } from './FrameworkMockConfigurator.js';

/**
 * Configures a mocked framework before it is initialized.
 *
 * @typeParam TModules - Module descriptors beyond the built-in set.
 * @param configurator - The configurator to configure.
 */
export type FrameworkMockConfigureFn<TModules extends Array<AnyModule> = []> = (
  configurator: FrameworkMockConfigurator<TModules>,
) => void | Promise<void>;

/**
 * Starts a Fusion framework instance that needs no credentials and no network.
 *
 * @remarks
 * The real framework is started: the real module set, the real configuration
 * pipeline and the real lifecycle. Only the boundaries that would need
 * credentials or network access are substituted, so a test exercises the wiring
 * an application actually depends on rather than a reimplementation of it.
 *
 * The configurator passed to `configure` is a {@link FrameworkMockConfigurator},
 * which *is* a `FrameworkConfigurator`. Every `enableX` helper therefore accepts
 * it unchanged — including the ones an application team writes for their own
 * modules.
 *
 * Spying on individual calls is left to the test runner. The framework makes the
 * runtime substitutable; `vi.spyOn`, `bun:test` `spyOn` and `t.mock.method` all
 * work against the resulting instance with no framework support.
 *
 * @typeParam TModules - Module descriptors beyond the built-in set. Supply this
 *   when a test registers application modules, so they are typed on the result.
 * @template TModules - Module descriptors beyond the built-in set.
 * @param configure - Callback that configures the framework before it starts.
 * @returns The initialized framework instance.
 *
 * @example Zero configuration
 * ```typescript
 * const fusion = await mockFramework();
 * ```
 *
 * @example Configure the built-in mocks
 * ```typescript
 * const fusion = await mockFramework((configurator) => {
 *   configurator.msal.setAccount({ name: 'Ada Lovelace' });
 *   configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
 * });
 * ```
 *
 * @example Register an application module
 * ```typescript
 * const fusion = await mockFramework<[InvoiceModule]>((configurator) => {
 *   enableInvoicesMock(configurator, { total: 42 });
 * });
 *
 * await fusion.modules.invoices.getInvoice('1');
 * ```
 */
export async function mockFramework<TModules extends Array<AnyModule> = []>(
  configure?: FrameworkMockConfigureFn<TModules>,
): Promise<Fusion<TModules>> {
  const configurator = new FrameworkMockConfigurator<TModules>();
  await configure?.(configurator);
  return await init(configurator);
}

export default mockFramework;
