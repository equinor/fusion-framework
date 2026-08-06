import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PouchDbStorage } from '../storage/PouchDbStorage.js';
import { PouchDbSyncStorage } from '../storage/PouchDbSyncStorage.js';
import { StateSyncEvent, type StateEventType } from '../events/index.js';
import type { StateSyncPollEvent } from '../events/StateSyncPollEvent.js';

describe('PouchDbSyncStorage', () => {
  let localDb: PouchDB.Database;
  let remoteDb: PouchDB.Database;

  beforeEach(() => {
    localDb = PouchDbStorage.CreateDb('test-sync-local');
    remoteDb = PouchDbStorage.CreateDb('test-sync-remote');
  });

  afterEach(async () => {
    await Promise.all([localDb.destroy(), remoteDb.destroy()]);
  });

  describe('pull.mode "interval"', () => {
    it('keeps push live (local writes reach the remote) while scheduling pulls on a timer', async () => {
      const storage = new PouchDbSyncStorage({
        localDb: { name_or_instance: localDb },
        remoteDb: { name_or_instance: remoteDb },
        syncOptions: {},
        pull: { mode: 'interval', intervalMs: 20, refreshOnFocus: false },
      });

      await storage.initialize();
      await storage.putItem({ key: 'push-test', value: 'from-local' });

      // Push stays live, so the local write should reach the remote without waiting for the pull timer.
      await vi.waitFor(
        async () => {
          const remoteDoc = await remoteDb.get('push-test').catch(() => undefined);
          expect(remoteDoc?.value).toBe('from-local');
        },
        { timeout: 2000 },
      );

      storage[Symbol.dispose]();
    });

    it('surfaces a remote-only write via a scheduled pull, without needing a continuous pull connection', async () => {
      const storage = new PouchDbSyncStorage({
        localDb: { name_or_instance: localDb },
        remoteDb: { name_or_instance: remoteDb },
        syncOptions: {},
        pull: { mode: 'interval', intervalMs: 20, refreshOnFocus: false },
      });

      await storage.initialize();
      await remoteDb.put({ _id: 'pull-test', value: 'from-remote' });

      // The interval-scheduled one-shot pull (not a live connection) should bring this down.
      await vi.waitFor(
        async () => {
          const localItem = await storage.item('pull-test');
          expect(localItem?.value).toBe('from-remote');
        },
        { timeout: 2000 },
      );

      storage[Symbol.dispose]();
    });

    it('dispatches a "onStateSync.poll" event for the initial pull, distinct from status/complete', async () => {
      const storage = new PouchDbSyncStorage({
        localDb: { name_or_instance: localDb },
        remoteDb: { name_or_instance: remoteDb },
        syncOptions: {},
        pull: { mode: 'interval', intervalMs: 500, refreshOnFocus: false },
      });

      const events: StateEventType[] = [];
      const subscription = storage.events$.subscribe((event) => events.push(event));

      await storage.initialize();

      // `_initialize()` runs an immediate first pull before the interval ever fires.
      await vi.waitFor(
        () => {
          const initialPoll = events
            // Fires even if the poll finds nothing new, unlike PouchDB's own active/paused events.
            .find((event): event is StateSyncPollEvent => StateSyncEvent.Poll.is(event));
          expect(initialPoll?.detail).toEqual({ trigger: 'initial', skipped: false });
        },
        { timeout: 2000 },
      );

      subscription.unsubscribe();
      storage[Symbol.dispose]();
    });
  });

  describe('pull.mode "visible-interval"', () => {
    const setVisibility = (state: DocumentVisibilityState) => {
      Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    };

    afterEach(() => {
      // Other describe blocks in this file assume a visible tab by default.
      setVisibility('visible');
    });

    it('skips interval ticks while hidden, then pulls exactly once on returning to visible', async () => {
      // Captures each replication's registered handlers so the test can drive 'complete'
      // itself - deterministic, instead of racing real PouchDB I/O against the interval timer.
      const fakeReplications: Array<{ complete: () => void }> = [];
      const replicateFrom = vi.spyOn(localDb.replicate, 'from').mockImplementation(() => {
        const handlers: Record<string, Array<() => void>> = {};
        const replication = {
          on: vi.fn((event: string, handler: () => void) => {
            if (!handlers[event]) handlers[event] = [];
            handlers[event].push(handler);
          }),
          removeListener: vi.fn(),
          // biome-ignore lint/suspicious/noThenProperty: mocking PouchDB's Replication, which is genuinely thenable.
          then: vi.fn(),
          cancel: vi.fn(),
        };
        fakeReplications.push({
          complete: () => {
            handlers.complete?.forEach((handler) => {
              handler();
            });
          },
        });
        return replication as unknown as ReturnType<typeof localDb.replicate.from>;
      });

      setVisibility('hidden');
      const storage = new PouchDbSyncStorage({
        localDb: { name_or_instance: localDb },
        remoteDb: { name_or_instance: remoteDb },
        syncOptions: {},
        pull: { mode: 'visible-interval', intervalMs: 20, refreshOnFocus: true },
      });

      await storage.initialize();
      expect(replicateFrom).toHaveBeenCalledTimes(1); // the always-runs initial pull

      // Several interval ticks pass while hidden - the schedule should skip every one of them.
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(replicateFrom).toHaveBeenCalledTimes(1);

      // Release the initial pull, so the upcoming focus trigger isn't skipped as already in flight.
      fakeReplications[0].complete();

      setVisibility('visible');
      // Returning to visible triggers exactly one catch-up pull, not one per missed tick.
      expect(replicateFrom).toHaveBeenCalledTimes(2);

      replicateFrom.mockRestore();
      storage[Symbol.dispose]();
    });
  });

  describe('pull watchdog', () => {
    it('cancels a hung pull replication and releases it for the next scheduled pull', async () => {
      vi.useFakeTimers();
      // A stub that never fires 'complete'/'error' and never settles its thenable -
      // the exact failure mode the watchdog exists to recover from.
      const cancel = vi.fn();
      // biome-ignore lint/suspicious/noThenProperty: mocking PouchDB's Replication, which is genuinely thenable.
      const hungReplication = { on: vi.fn(), removeListener: vi.fn(), then: vi.fn(), cancel };
      const replicateFrom = vi
        .spyOn(localDb.replicate, 'from')
        .mockReturnValue(hungReplication as unknown as ReturnType<typeof localDb.replicate.from>);

      const storage = new PouchDbSyncStorage({
        localDb: { name_or_instance: localDb },
        remoteDb: { name_or_instance: remoteDb },
        syncOptions: { timeout: 1000 },
        pull: { mode: 'interval', intervalMs: 10000, refreshOnFocus: false },
      });

      const events: StateEventType[] = [];
      const subscription = storage.events$.subscribe((event) => events.push(event));

      await storage.initialize();
      expect(cancel).not.toHaveBeenCalled();

      // watchdogMs is syncOptions.timeout (1000) + 5000.
      await vi.advanceTimersByTimeAsync(6000);
      expect(cancel).toHaveBeenCalledTimes(1);

      // If the watchdog hadn't released `#pullInFlight`, this next interval tick would
      // report `skipped: true` instead of starting a second real pull attempt.
      await vi.advanceTimersByTimeAsync(4000);
      const pollDetails = events
        .filter((event): event is StateSyncPollEvent => StateSyncEvent.Poll.is(event))
        .map((event) => event.detail);
      expect(pollDetails).toEqual([
        { trigger: 'initial', skipped: false },
        { trigger: 'interval', skipped: false },
      ]);

      subscription.unsubscribe();
      storage[Symbol.dispose]();
      replicateFrom.mockRestore();
      vi.useRealTimers();
    });
  });
});
