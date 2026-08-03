import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as httpModule, type HttpMsalModule } from '../module';

import { HttpMockConfigurator } from './HttpMockConfigurator';

/**
 * The HTTP module with every client answering requests from registered route
 * handlers instead of the network.
 *
 * @remarks
 * Only `configure` differs from the real module, so the provider, the schema
 * and the initialization flow stay exactly as they are in production.
 */
export const httpMockModule: HttpMsalModule = {
  ...httpModule,
  configure: () => new HttpMockConfigurator(),
};

/**
 * Configuration callback for {@link enableHttpMock}.
 */
export type HttpConfigMockFn<TRef = unknown> = (
  configurator: HttpMockConfigurator,
  ref?: TRef,
) => void;

/**
 * Enables the HTTP module against registered route handlers, so a test needs
 * no network and no locally running server.
 *
 * @remarks
 * Registered last, this replaces whichever HTTP module the configurator
 * already carries, so it works on a `FrameworkConfigurator` that pre-registers
 * the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to register route handlers.
 *
 * @example
 * ```typescript
 * enableHttpMock(configurator, (builder) => {
 *   builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
 *   builder.get('/items', () => Response.json([{ id: 1 }]));
 * });
 * ```
 */
export const enableHttpMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: HttpConfigMockFn,
): void => {
  configurator.addConfig({ module: httpMockModule, configure } as {
    module: HttpMsalModule;
  });
};
