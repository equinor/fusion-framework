import { describe, it, expect, vi, afterEach } from 'vitest';
import { EventModuleProvider } from '../EventModuleProvider';
import type { IFrameworkEvent } from '../FrameworkEvent';
import { waitForEvent } from '../utils';

/** Creates a bare provider — no bubbling, no dispatch hooks. */
const createProvider = () => new EventModuleProvider({} as never);

describe('waitForEvent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves when a matching single-type event fires', async () => {
    const provider = createProvider();

    const promise = waitForEvent(provider, 'onModulesLoaded');
    await provider.dispatchEvent('onModulesLoaded', { detail: {} as never, source: provider });
    const event = await promise;

    expect(event.type).toBe('onModulesLoaded');
    provider.dispose();
  });

  it('resolves when one of the types in an array fires', async () => {
    const provider = createProvider();

    const promise = waitForEvent(provider, ['myFeature.saved', 'myFeature.updated'] as string[]);
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    const event = await promise;

    expect(event.type).toBe('myFeature.saved');
    provider.dispose();
  });

  it('resolves via predicate matcher', async () => {
    const provider = createProvider();

    const promise = waitForEvent(
      provider,
      (e: IFrameworkEvent) =>
        e.type === 'myFeature.saved' && (e.detail as { id: number }).id === 42,
    );
    // Non-matching dispatch — should not resolve yet.
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 1 } });
    // Matching dispatch.
    await provider.dispatchEvent('myFeature.saved', { detail: { id: 42 } });
    const event = await promise;

    expect((event.detail as { id: number }).id).toBe(42);
    provider.dispose();
  });

  it('rejects when the timeout elapses before an event fires', async () => {
    vi.useFakeTimers();
    const provider = createProvider();

    const promise = waitForEvent(provider, 'myFeature.saved', { timeout: 500 });
    vi.advanceTimersByTime(501);

    await expect(promise).rejects.toThrow('waitForEvent timed out after 500ms');
    provider.dispose();
  });

  it('rejects when the AbortSignal fires before an event', async () => {
    const provider = createProvider();
    const controller = new AbortController();

    const promise = waitForEvent(provider, 'myFeature.saved', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow();
    provider.dispose();
  });

  it('rejects immediately when passed an already-aborted signal', async () => {
    const provider = createProvider();
    const controller = new AbortController();
    controller.abort();

    await expect(
      waitForEvent(provider, 'myFeature.saved', { signal: controller.signal }),
    ).rejects.toThrow();
    provider.dispose();
  });

  it('rejects when the event stream completes before an event resolves', async () => {
    const provider = createProvider();

    const promise = waitForEvent(provider, 'myFeature.saved');
    provider.dispose(); // completes event$

    await expect(promise).rejects.toThrow('Event stream completed');
  });
});
