import { from, firstValueFrom, type ObservableInput } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import {
  ModulesConfigurator,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { configureHttp } from '@equinor/fusion-framework-module-http';
import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';
import type { IApiProvider } from '@equinor/fusion-framework-module-services';
import { enableServices } from '@equinor/fusion-framework-module-services';
import type { QueryCtorOptions } from '@equinor/fusion-query';

import {
  ContextModuleConfigurator,
  type IContextModuleConfigurator,
} from '../ContextModuleConfigurator';
import type { ContextProvider } from '../ContextProvider';
import { module as contextModule } from '../module';
import type { ContextItem } from '../types';

type RawContextEntity = {
  id: string;
  externalId: string | null;
  source: string | null;
  type: { id: string; isChildType?: boolean; parentTypeIds?: string[] };
  value: Record<string, unknown> | null;
  title: string | null;
  isActive: boolean;
  isDeleted: boolean;
  created: string;
  updated: string | null;
};

const createRawContextEntity = (overrides: Partial<RawContextEntity> = {}): RawContextEntity => ({
  id: 'ctx-1',
  externalId: null,
  source: null,
  type: { id: 'ProjectMaster', isChildType: false, parentTypeIds: [] },
  value: { key: 'value' },
  title: 'My project',
  isActive: true,
  isDeleted: false,
  created: '2024-01-01T00:00:00.000Z',
  updated: null,
  ...overrides,
});

/** Fakes the resolved `ContextApiClient`, invoking the selector against a canned raw payload. */
const createApiProvider = (): IApiProvider =>
  ({
    createContextClient: vi.fn().mockResolvedValue({
      get: (_version: string, _args: unknown, opts: { selector: (r: Response) => unknown }) =>
        opts.selector(new Response(JSON.stringify(createRawContextEntity()))),
      query: (_version: string, _args: unknown, opts: { selector: (r: Response) => unknown }) =>
        opts.selector(new Response(JSON.stringify([createRawContextEntity({ id: 'ctx-2' })]))),
      related: (_version: string, _args: unknown, opts: { selector: (r: Response) => unknown }) =>
        opts.selector(new Response(JSON.stringify([createRawContextEntity({ id: 'ctx-3' })]))),
    }),
  }) as unknown as IApiProvider;

const createInitArgs = (
  overrides: Partial<ConfigBuilderCallbackArgs> = {},
): ConfigBuilderCallbackArgs => ({
  config: {},
  hasModule: vi.fn().mockReturnValue(false),
  requireInstance: vi.fn(),
  ...overrides,
});

const createMockClient = () => ({
  get: () => Promise.resolve({ id: 'custom', type: { id: 'Mock' }, value: {} } as ContextItem),
  query: () => Promise.resolve([] as ContextItem[]),
});

const invoke = <TResult, TArgs>(
  options: QueryCtorOptions<TResult, TArgs>,
  args: TArgs,
): Promise<TResult> => {
  const client = options.client as { fn: (args: TArgs) => ObservableInput<TResult> };
  return firstValueFrom(from(client.fn(args)));
};

/**
 * Boots the real `http`, `services`, and `context` modules through the real module
 * system, faking only the network call itself (the actual external boundary) —
 * everything above it, including HTTP request/response handling, the services API
 * client, the context selectors, and `ContextProvider`, runs unmocked.
 */
const initializeContextWith = async (
  configure?: (builder: IContextModuleConfigurator) => void,
): Promise<ContextProvider> => {
  const configurator = new ModulesConfigurator([]);
  configurator.addConfig(
    configureHttp((http) => {
      http.configureClient('context', { baseUri: 'https://context.example.com' });
      http.addMiddleware(
        createRouterMiddleware('https://context.example.com', (router) => {
          router.get('/contexts/:id/relations', () =>
            Response.json([createRawContextEntity({ id: 'ctx-3' })]),
          );
          router.get('/contexts', () => Response.json([createRawContextEntity({ id: 'ctx-2' })]));
          router.get('/contexts/:id', () => Response.json(createRawContextEntity()));
        }),
      );
    }),
  );
  enableServices(configurator);
  configurator.addConfig({ module: contextModule, configure });
  const instances = await configurator.initialize();
  // the configurator's generic instance map doesn't know about the context module by name
  return (instances as unknown as { context: ContextProvider }).context;
};

describe('ContextModuleConfigurator', () => {
  describe('client defaulting', () => {
    it('builds a client from the local services module api provider when none was configured', async () => {
      const apiProvider = createApiProvider();
      const configurator = new ContextModuleConfigurator();

      const config = await configurator.createConfigAsync(
        createInitArgs({
          hasModule: vi.fn().mockReturnValue(true),
          requireInstance: vi.fn().mockResolvedValue(apiProvider),
        }),
      );

      const item = await invoke(config.client.get, { id: 'ctx-1' });
      expect(item).toMatchObject({
        id: 'ctx-1',
        title: 'My project',
        type: { id: 'ProjectMaster' },
      });

      const items = await invoke(config.client.query, { search: 'foo' });
      expect(items).toEqual([expect.objectContaining({ id: 'ctx-2' })]);

      const related = await invoke(
        config.client.related as QueryCtorOptions<ContextItem[], unknown>,
        {
          item,
          filter: undefined,
        },
      );
      expect(related).toEqual([expect.objectContaining({ id: 'ctx-3' })]);
    });

    it('falls back to the parent services module when not registered locally', async () => {
      const apiProvider = createApiProvider();
      const configurator = new ContextModuleConfigurator();

      const config = await configurator.createConfigAsync(
        createInitArgs({ ref: { services: apiProvider } }),
      );

      const item = await invoke(config.client.get, { id: 'ctx-1' });
      expect(item.id).toBe('ctx-1');
    });

    it('throws when no services module is available locally or on the parent', async () => {
      const configurator = new ContextModuleConfigurator();

      await expect(configurator.createConfigAsync(createInitArgs())).rejects.toThrow(
        /no service services provider/,
      );
    });

    it('setContextClient bypasses the services module entirely', async () => {
      const requireInstance = vi.fn();
      const configurator = new ContextModuleConfigurator();
      configurator.addConfigBuilder((builder) => {
        builder.setContextClient(createMockClient());
      });

      const config = await configurator.createConfigAsync(createInitArgs({ requireInstance }));

      expect(requireInstance).not.toHaveBeenCalled();
      const item = await invoke(config.client.get, { id: 'custom' });
      expect(item.id).toBe('custom');
    });
  });

  describe('config builders', () => {
    it('applies setter values registered through addConfigBuilder', async () => {
      const configurator = new ContextModuleConfigurator();
      configurator.addConfigBuilder((builder) => {
        builder.setContextType(['ProjectMaster']);
        builder.setContextFilter((items) => items.filter((i) => i.isActive));
        builder.setContextClient(createMockClient());
      });

      const config = await configurator.createConfigAsync(createInitArgs());

      expect(config.contextType).toEqual(['ProjectMaster']);
      expect(
        config.contextFilter?.([
          { isActive: true } as ContextItem,
          { isActive: false } as ContextItem,
        ]),
      ).toHaveLength(1);
    });

    it('runs multiple config builders in order, letting later ones win', async () => {
      const configurator = new ContextModuleConfigurator();
      configurator.addConfigBuilder((builder) => {
        builder.setContextType(['ProjectMaster']);
        builder.setContextClient(createMockClient());
      });
      configurator.addConfigBuilder((builder) => {
        builder.setContextType(['Facility']);
      });

      const config = await configurator.createConfigAsync(createInitArgs());

      expect(config.contextType).toEqual(['Facility']);
    });

    it('exposes requireInstance to config builders once initialization has started', async () => {
      const configurator = new ContextModuleConfigurator();
      const requireInstance = vi.fn().mockResolvedValue('resolved-instance');
      let resolved: unknown;
      configurator.addConfigBuilder(async (builder) => {
        resolved = await builder.requireInstance('event');
        builder.setContextClient(createMockClient());
      });

      await configurator.createConfigAsync(createInitArgs({ requireInstance }));

      expect(resolved).toBe('resolved-instance');
      expect(requireInstance).toHaveBeenCalledWith('event');
    });

    it('requireInstance throws synchronously when called before initialization begins', () => {
      const configurator = new ContextModuleConfigurator();

      expect(() => configurator.requireInstance('event')).toThrow(
        /requireInstance can only be called during module configuration/,
      );
    });
  });

  describe('resolveInitialContext defaulting', () => {
    it('defaults to a resolver function when a builder did not set one', async () => {
      const configurator = new ContextModuleConfigurator();
      configurator.addConfigBuilder((builder) => {
        builder.setContextClient(createMockClient());
      });

      const config = await configurator.createConfigAsync(createInitArgs());

      expect(config.resolveInitialContext).toBeTypeOf('function');
    });

    it('keeps a builder-provided resolver instead of the default', async () => {
      const configurator = new ContextModuleConfigurator();
      const customResolver = vi.fn();
      configurator.addConfigBuilder((builder) => {
        builder.setResolveInitialContext(customResolver);
        builder.setContextClient(createMockClient());
      });

      const config = await configurator.createConfigAsync(createInitArgs());

      expect(config.resolveInitialContext).toBe(customResolver);
    });
  });
});

describe('ContextProvider through the real module system (http mocked at the network boundary)', () => {
  it('switches the current context by id via the real client and selectors', async () => {
    const provider = await initializeContextWith();

    const item = await provider.setCurrentContextByIdAsync('ctx-1');

    expect(item).toMatchObject({ id: 'ctx-1', title: 'My project', type: { id: 'ProjectMaster' } });
    expect(provider.currentContext?.id).toBe('ctx-1');
  });

  it('queries context items via the real client and selectors', async () => {
    const provider = await initializeContextWith();

    const items = await provider.queryContextAsync('foo');

    expect(items).toEqual([expect.objectContaining({ id: 'ctx-2' })]);
  });

  it('resolves related context items via the real client and selectors', async () => {
    const provider = await initializeContextWith();

    const related = await provider.relatedContextsAsync({
      item: { id: 'ctx-1', type: { id: 'ProjectMaster' }, value: {} },
      filter: { type: ['ProjectMaster'] },
    });

    expect(related).toEqual([expect.objectContaining({ id: 'ctx-3' })]);
  });

  it('resolves an invalid context item to a related item of the configured context type', async () => {
    const provider = await initializeContextWith((builder) => {
      builder.setContextType(['ProjectMaster']);
    });

    // 'Contract' is not one of the configured context types, so it must be resolved
    const resolved = await provider.resolveContextAsync({
      id: 'ctx-contract',
      type: { id: 'Contract' },
      value: {},
    });

    expect(resolved.id).toBe('ctx-3');
  });
});
