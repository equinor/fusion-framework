import { describe, it, expect } from 'vitest';
import { EventModuleProvider } from '../EventModuleProvider';
import type { IFrameworkEvent } from '../FrameworkEvent';
import { watchEvents } from '../utils';

const createProvider = () => new EventModuleProvider({} as never);

describe('watchEvents', () => {
  it('collects matching events in dispatch order', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, 'myFeature.saved');

    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 2 } });

    expect(handle.events).toHaveLength(2);
    expect((handle.events[0].detail as { id: number }).id).toBe(1);
    expect((handle.events[1].detail as { id: number }).id).toBe(2);

    handle.dispose();
    provider.dispose();
  });

  it('only stores events that pass the matcher', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, ['myFeature.saved'] as string[]);

    await provider.dispatchEvent('myFeature.saved', { detail: {} });
    await provider.dispatchEvent('myFeature.deleted', { detail: {} });
    await provider.dispatchEvent('unrelated', { detail: {} });

    expect(handle.events).toHaveLength(1);
    expect(handle.events[0].type).toBe('myFeature.saved');

    handle.dispose();
    provider.dispose();
  });

  it('lastEvent() returns the most recent collected event', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, ['myFeature.saved', 'myFeature.deleted'] as string[]);

    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    await provider.dispatchEvent('myFeature.deleted', { detail: { id: 1 } });

    expect(handle.lastEvent()?.type).toBe('myFeature.deleted');

    handle.dispose();
    provider.dispose();
  });

  it('lastEvent(type) returns the last event of that specific type', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, ['myFeature.saved', 'myFeature.deleted'] as string[]);

    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 2 } });
    await provider.dispatchEvent('myFeature.deleted', { detail: { id: 1 } });

    const last = handle.lastEvent('myFeature.saved');
    expect((last?.detail as { id: number } | undefined)?.id).toBe(2);

    handle.dispose();
    provider.dispose();
  });

  it('lastEvent(type) returns undefined when no event of that type was collected', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, 'myFeature.saved');

    expect(handle.lastEvent('myFeature.deleted')).toBeUndefined();

    handle.dispose();
    provider.dispose();
  });

  it('stops collecting after dispose()', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, 'myFeature.saved');

    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    handle.dispose();
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 2 } });

    expect(handle.events).toHaveLength(1);

    provider.dispose();
  });

  it('works with a predicate matcher', async () => {
    const provider = createProvider();
    const handle = watchEvents(
      provider,
      (e: IFrameworkEvent) => e.type === 'myFeature.saved' && (e.detail as { id: number }).id > 10,
    );

    await provider.dispatchEvent('myFeature.saved', { detail: { id: 5 } });
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 15 } });

    expect(handle.events).toHaveLength(1);
    expect((handle.events[0].detail as { id: number }).id).toBe(15);

    handle.dispose();
    provider.dispose();
  });

  it('does not grow memory when many non-matching events fire', async () => {
    const provider = createProvider();
    const handle = watchEvents(provider, 'myFeature.saved');

    const dispatches = Array.from({ length: 1000 }, (_, i) =>
      provider.dispatchEvent('unrelated', { detail: { i } }),
    );
    await Promise.all(dispatches);

    expect(handle.events).toHaveLength(0);

    handle.dispose();
    provider.dispose();
  });
});
