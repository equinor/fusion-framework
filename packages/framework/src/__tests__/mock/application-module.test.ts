import { describe, expect, it } from 'vitest';

import type { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';

import { mockFramework } from '../../mock/index.js';

/**
 * A module an application team owns, which the framework knows nothing about.
 *
 * @remarks
 * The point of these tests is that nothing below required support from
 * `@equinor/fusion-framework/mock`. If an application team can do this, the
 * extension pattern holds.
 */
interface InvoiceClient {
  getInvoice(id: string): Promise<{ id: string; total: number }>;
}

class InvoiceConfigurator {
  #client?: InvoiceClient;

  public setClient(client: InvoiceClient): void {
    this.#client = client;
  }

  public createClient(): InvoiceClient {
    if (!this.#client) {
      throw new Error('An invoice client is required');
    }
    return this.#client;
  }
}

type InvoiceModule = Module<'invoices', InvoiceClient, InvoiceConfigurator>;

const invoiceModule: InvoiceModule = {
  name: 'invoices',
  configure: () => new InvoiceConfigurator(),
  initialize: ({ config }) => config.createClient(),
};

/** The team's own mock, following the pattern the built-in modules use. */
const enableInvoicesMock = (
  // biome-ignore lint/suspicious/noExplicitAny: mirrors every enableX helper
  configurator: IModulesConfigurator<any, any>,
  options: { total?: number } = {},
): void => {
  configurator.addConfig({
    module: invoiceModule,
    configure: (builder: InvoiceConfigurator) =>
      builder.setClient({
        getInvoice: async (id) => ({ id, total: options.total ?? 0 }),
      }),
  } as { module: InvoiceModule });
};

describe('application modules', () => {
  it('fails to start without its mock, so the seam is real and not a no-op', async () => {
    await expect(
      mockFramework<[InvoiceModule]>((configurator) => {
        configurator.addConfig({ module: invoiceModule } as { module: InvoiceModule });
      }),
    ).rejects.toThrow(/invoice client is required/i);
  });

  it('composes with the built-in mocks and is typed without a cast', async () => {
    const fusion = await mockFramework<[InvoiceModule]>((configurator) => {
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
      enableInvoicesMock(configurator, { total: 42 });
    });

    // No cast: `TModules` must flow through to `fusion.modules`.
    const invoice = await fusion.modules.invoices.getInvoice('inv-1');

    expect(invoice).toEqual({ id: 'inv-1', total: 42 });
    expect(fusion.modules.auth.account?.name).toBe('Ada Lovelace');
  });

  it('is registered exactly as it is in production', async () => {
    // The same helper, against a real FrameworkConfigurator, would behave identically.
    const fusion = await mockFramework<[InvoiceModule]>((configurator) =>
      enableInvoicesMock(configurator, { total: 7 }),
    );

    await expect(fusion.modules.invoices.getInvoice('inv-2')).resolves.toMatchObject({ total: 7 });
  });
});
