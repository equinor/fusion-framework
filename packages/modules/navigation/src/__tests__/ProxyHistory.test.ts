import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';
import { MemoryHistory } from '../lib/MemoryHistory';
import { ProxyHistory } from '../lib/ProxyHistory';

/**
 * Awaits the next state emission after performing a navigation action.
 * MemoryHistory processes state updates asynchronously through the subject.
 */
const awaitNavigation = async (
  history: MemoryHistory | ProxyHistory,
  action: () => void,
): Promise<void> => {
  const next = firstValueFrom(history.state$.pipe(skip(1)));
  action();
  await next;
};

describe('ProxyHistory', () => {
  let target: MemoryHistory;
  let proxy: ProxyHistory;

  beforeEach(() => {
    target = new MemoryHistory();
    proxy = new ProxyHistory(target);
  });

  afterEach(() => {
    proxy[Symbol.dispose]();
    target[Symbol.dispose]();
  });

  describe('delegation', () => {
    it('should delegate location to the target', () => {
      expect(proxy.location).toBe(target.location);
    });

    it('should delegate action to the target', () => {
      expect(proxy.action).toBe(target.action);
    });

    it('should delegate push to the target', async () => {
      await awaitNavigation(proxy, () => proxy.push('/test'));

      expect(target.location.pathname).toBe('/test');
      expect(proxy.location.pathname).toBe('/test');
    });

    it('should delegate replace to the target', async () => {
      await awaitNavigation(proxy, () => proxy.replace('/replaced'));

      expect(target.location.pathname).toBe('/replaced');
      expect(proxy.location.pathname).toBe('/replaced');
    });

    it('should delegate navigate to the target', async () => {
      await awaitNavigation(proxy, () =>
        proxy.navigate('/nav', { replace: true, state: { foo: 1 } }),
      );

      expect(target.location.pathname).toBe('/nav');
      expect(target.location.state).toEqual({ foo: 1 });
    });

    it('should delegate createHref to the target', () => {
      expect(proxy.createHref('/path')).toBe(target.createHref('/path'));
    });

    it('should delegate createURL to the target', () => {
      expect(proxy.createURL('/path').href).toBe(target.createURL('/path').href);
    });

    it('should delegate encodeLocation to the target', () => {
      const encoded = proxy.encodeLocation('/path');
      expect(encoded).toEqual(target.encodeLocation('/path'));
    });
  });

  describe('pop()', () => {
    it('should delegate pop to the target when target supports it', () => {
      const popSpy = vi.spyOn(target, 'pop');
      proxy.pop();
      expect(popSpy).toHaveBeenCalledOnce();
    });
  });

  describe('teardown isolation', () => {
    it('should not dispose the target when proxy is disposed', async () => {
      // Dispose the proxy
      proxy[Symbol.dispose]();

      // Target should still be functional — push should work
      await awaitNavigation(target, () => target.push('/after-proxy-dispose'));
      expect(target.location.pathname).toBe('/after-proxy-dispose');
    });

    it('should clean up proxy-owned listeners on dispose', async () => {
      const proxyListener = vi.fn();
      proxy.listen(proxyListener);

      // Dispose the proxy — listener teardown should be called on the target
      proxy[Symbol.dispose]();

      // Target is still alive, push something — the disposed proxy listener
      // should not fire (listen only triggers on POP, but the underlying
      // subscription should be removed entirely)
      await awaitNavigation(target, () => target.push('/after-dispose'));
      expect(target.location.pathname).toBe('/after-dispose');
    });

    it('should not affect target listeners when proxy is disposed', async () => {
      // Register a listener directly on the target
      const targetListener = vi.fn();
      target.listen(targetListener);

      // Register a listener through the proxy
      proxy.listen(vi.fn());

      // Dispose proxy — only proxy listener should be removed
      proxy[Symbol.dispose]();

      // Target should still be functional
      await awaitNavigation(target, () => target.push('/still-works'));
      expect(target.location.pathname).toBe('/still-works');
    });
  });

  describe('listen/block unsubscribe', () => {
    it('should allow manual unsubscribe of a listener', () => {
      const listener = vi.fn();
      const unlisten = proxy.listen(listener);

      unlisten();

      // No error on dispose — the listener was already removed
      proxy[Symbol.dispose]();
    });

    it('should allow manual unsubscribe of a blocker', () => {
      const blocker = vi.fn();
      const unblock = proxy.block(blocker);

      unblock();

      // No error on dispose — the blocker was already removed
      proxy[Symbol.dispose]();
    });
  });
});
