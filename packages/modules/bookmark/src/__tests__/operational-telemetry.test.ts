import { afterEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom, lastValueFrom, NEVER } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import eventModule, { type EventModule } from '@equinor/fusion-framework-module-event';
import {
  enableTelemetry,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { BookmarkProvider } from '../BookmarkProvider.js';
import { BookmarkMockClient } from '../mock/index.js';
import bookmarkModule from '../bookmark-module.js';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

/** Real event bus and host telemetry; records are observed at the exported boundary. */
const setup = async () => {
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  config.addConfig({ module: eventModule });
  enableTelemetry(config, {
    configure: (builder) => {
      builder.setSource({ source: 'app', hostId: 'host' });
      builder.setAdapter('test', { initialize: vi.fn(), processItem });
    },
  });
  const modules = await config.initialize<[EventModule, TelemetryModule]>();
  const client = new BookmarkMockClient();
  const provider = new BookmarkProvider({
    client,
    eventProvider: modules.event,
    resolve: {
      context: async () => undefined,
      application: async () => ({ appKey: 'my-app' }) as never,
    },
  });
  // Creation waits for payload generators, as applications register them.
  provider.addPayloadGenerator((draft) => {
    if (draft) {
      Object.assign(draft, { secret: SENTINEL });
    }
  });
  provider.connectTelemetry(modules.telemetry);
  const records = () =>
    processItem.mock.calls
      .map(([item]) => item)
      .filter((item) => item.diagnostic?.module === 'bookmark');
  const summary = () =>
    records().map((item) => [item.name, item.diagnostic?.outcome, item.properties?.reason]);
  return { modules, client, provider, processItem, records, summary };
};

const durations = (rows: unknown[][]) =>
  rows
    .filter(([name]) => String(name).endsWith('.duration'))
    .map(([name, outcome]) => [
      String(name).replace('fusion.bookmark.', '').replace('.duration', ''),
      outcome,
    ]);

describe('bookmark operational telemetry', () => {
  it('records CRUD, apply, favourite and payload outcomes without bookmark data', async () => {
    const { modules, provider, processItem, summary } = await setup();
    const created = await lastValueFrom(
      provider.createBookmark({ name: SENTINEL, payload: { secret: SENTINEL } }),
    );
    await lastValueFrom(provider.getBookmark(created.id));
    await lastValueFrom(provider.setCurrentBookmark(created));
    await lastValueFrom(provider.removeBookmarkAsFavorite(created.id), {
      defaultValue: undefined,
    });
    await lastValueFrom(
      provider.updateBookmark(created.id, { name: SENTINEL }, { excludePayloadGeneration: true }),
    );
    await lastValueFrom(provider.deleteBookmark(created.id), { defaultValue: undefined });

    expect(durations(summary())).toEqual([
      ['create', 'success'],
      // Metadata and payload fetches are separate store requests, measured from dispatch.
      ['get', 'success'],
      ['payload-resolve', 'success'],
      ['apply', 'success'],
      ['favourite-remove', 'success'],
      ['update', 'success'],
      ['delete', 'success'],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(created.id);
    provider.dispose();
    await modules.dispose();
  });

  it('records a listener veto as a cancellation and a backend error as a failure', async () => {
    const { modules, client, provider, summary, processItem } = await setup();
    const created = await lastValueFrom(provider.createBookmark({ name: 'a', payload: {} }));

    const remove = modules.event.addEventListener('onBookmarkFavouriteAdd', (event) =>
      (event as unknown as { preventDefault: VoidFunction }).preventDefault(),
    );
    await expect(lastValueFrom(provider.addBookmarkToFavorites(created.id))).rejects.toThrow(
      'was canceled by listener',
    );
    remove();

    // A vetoed create never reaches the store; it is recorded without waiting for the caller.
    const removeCreate = modules.event.addEventListener('onBookmarkCreate', (event) =>
      (event as unknown as { preventDefault: VoidFunction }).preventDefault(),
    );
    provider.createBookmark({ name: 'b', payload: {} });
    await vi.waitFor(() => expect(durations(summary())).toContainEqual(['create', 'cancelled']));
    removeCreate();

    vi.spyOn(client, 'deleteBookmark').mockImplementation(async () => {
      throw new Error(SENTINEL);
    });
    await expect(lastValueFrom(provider.deleteBookmark(created.id))).rejects.toThrow(
      'Failed to delete bookmark',
    );

    expect(summary()).toEqual(
      expect.arrayContaining([
        ['fusion.bookmark.favourite-add.duration', 'cancelled', 'listener'],
        ['fusion.bookmark.create.duration', 'cancelled', 'listener'],
        ['fusion.bookmark.delete.duration', 'failure', undefined],
        ['fusion.bookmark.delete.failure', 'failure', undefined],
      ]),
    );
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    // Cancellations never produce exception records.
    expect(summary().filter(([name]) => String(name).endsWith('.failure'))).toHaveLength(1);
    provider.dispose();
    await modules.dispose();
  });

  it('cancels in-flight operations on disposal and emits nothing afterwards', async () => {
    const { modules, client, provider, records, summary } = await setup();
    vi.spyOn(client, 'getBookmarkById').mockReturnValue(NEVER);
    vi.spyOn(client, 'getBookmarkData').mockReturnValue(NEVER);
    const pending = provider.getBookmark('id').subscribe({ error: () => undefined });
    provider.dispose();
    expect(durations(summary())).toEqual(
      expect.arrayContaining([
        ['payload-resolve', 'cancelled'],
        ['get', 'cancelled'],
      ]),
    );
    expect(records()).toHaveLength(2);
    expect(records().every((item) => item.properties?.reason === 'disposed')).toBe(true);
    const count = records().length;
    pending.unsubscribe();
    provider.connectTelemetry(modules.telemetry);
    expect(records()).toHaveLength(count);
    await modules.dispose();
  });

  it('keeps bookmark behavior unchanged without telemetry or when telemetry throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plain = new BookmarkProvider({
      client: new BookmarkMockClient(),
      resolve: { context: async () => undefined, application: async () => undefined },
    });
    plain.addPayloadGenerator(() => undefined);
    const bookmark = await lastValueFrom(plain.createBookmark({ name: 'a', appKey: 'app' }));
    await expect(firstValueFrom(plain.getBookmark(bookmark.id))).resolves.toMatchObject({
      name: 'a',
    });
    plain.dispose();
    expect(warn).not.toHaveBeenCalled();

    const { modules, provider } = await setup();
    provider.connectTelemetry({
      source: { source: 'app', hostId: 'host' },
      track: () => {
        throw new Error('collector down');
      },
    } as never);
    const created = await lastValueFrom(provider.createBookmark({ name: 'b', payload: {} }));
    await expect(firstValueFrom(provider.getBookmark(created.id))).resolves.toMatchObject({
      name: 'b',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    provider.dispose();
    await modules.dispose();
  });

  it('measures eager fetches from the call, even when nobody subscribes', async () => {
    const { modules, provider, summary } = await setup();
    const created = await lastValueFrom(provider.createBookmark({ name: 'a', payload: {} }));
    // The fetches are dispatched by the call itself; the result is never subscribed.
    provider.getBookmark(created.id);
    await vi.waitFor(() =>
      expect(durations(summary())).toEqual([
        ['create', 'success'],
        ['get', 'success'],
        ['payload-resolve', 'success'],
      ]),
    );
    provider.dispose();
    await modules.dispose();
  });

  it('cancels a mutation abandoned before dispatch and releases its observer', async () => {
    const { modules, provider, summary } = await setup();
    // A slow payload generator keeps creation in preparation.
    let release!: VoidFunction;
    provider.addPayloadGenerator(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const subscription = provider.createBookmark({ name: 'a', payload: {} }).subscribe({
      error: () => undefined,
    });
    await vi.waitFor(() => expect(release).toBeDefined());
    subscription.unsubscribe();
    expect(summary()).toEqual([['fusion.bookmark.create.duration', 'cancelled', 'abandoned']]);
    // Preparation finishing later neither dispatches nor records anything more.
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(summary()).toHaveLength(1);
    provider.dispose();
    await modules.dispose();
  });

  it('connects telemetry through the optional provider hook', async () => {
    const connectTelemetry = vi.fn();
    const telemetry = {};
    await bookmarkModule.postInitialize?.({
      instance: { connectTelemetry } as never,
      modules: { telemetry } as never,
    });
    expect(connectTelemetry).toHaveBeenCalledWith(telemetry);
  });
});
