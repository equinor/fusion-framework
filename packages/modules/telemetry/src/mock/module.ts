import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as telemetryModule, type TelemetryModule } from '../module.js';

import { TelemetryMockConfigurator } from './TelemetryMockConfigurator.js';

/**
 * The telemetry module with a {@link TelemetryMockConfigurator} instead of a
 * configurator that answers to whichever adapters an application registers.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the
 * production one, untouched, so metadata merging, scoping and parent-provider
 * relaying all behave exactly as they do in production — a test observes the
 * real telemetry pipeline rather than a rehearsal of it.
 */
export const telemetryMockModule: TelemetryModule = {
  ...telemetryModule,
  configure: () => new TelemetryMockConfigurator(),
};

/**
 * Configuration callback for {@link enableTelemetryMock}.
 */
export type TelemetryConfigMockFn<TRef = unknown> = (
  configurator: TelemetryMockConfigurator,
  ref?: TRef,
) => void;

/**
 * Enables telemetry against a recording mock adapter, so a test can assert on
 * tracked telemetry without any of it reaching a real backend.
 *
 * @remarks
 * Registered last, this replaces whichever telemetry module the configurator
 * already carries, so it works on a `FrameworkConfigurator` that pre-registers
 * the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to further configure the mock, such as
 *   registering an additional adapter alongside the recording one.
 *
 * @example
 * ```typescript
 * enableTelemetryMock(configurator, (builder) => {
 *   builder.setDefaultScope(['app']);
 * });
 * ```
 */
export const enableTelemetryMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: TelemetryConfigMockFn,
): void => {
  configurator.addConfig({ module: telemetryMockModule, configure } as {
    module: TelemetryModule;
  });
};
