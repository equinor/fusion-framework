import { describe, expect, it, vi } from 'vitest';

import type { IRolesProvider } from '../RolesProvider.js';
import { createAccessRoleCheck } from '../access-role-check/create-access-role-check.js';

/**
 * Creates a manually controlled promise.
 *
 * @template TValue - Promise result type.
 * @returns Promise plus external resolve and reject functions.
 */
const createDeferred = <TValue>(): {
  promise: Promise<TValue>;
  resolve: (value: TValue) => void;
  reject: (error: unknown) => void;
} => {
  let resolve!: (value: TValue) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

describe('createAccessRoleCheck', () => {
  it('loads and refreshes one immutable access predicate', async () => {
    const hasAccessRole = vi
      .fn<IRolesProvider['hasAccessRole']>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const check = createAccessRoleCheck({ hasAccessRole }, ['Reports.Read', 'Reports.Export'], {
      required: true,
    });

    await check.load();
    expect(check.state).toEqual({
      hasAccessRole: false,
      isLoading: false,
      error: undefined,
    });
    expect(hasAccessRole).toHaveBeenNthCalledWith(1, ['Reports.Read', 'Reports.Export'], {
      required: true,
      refresh: false,
    });

    await check.refresh();
    expect(check.state).toEqual({
      hasAccessRole: true,
      isLoading: false,
      error: undefined,
    });
    expect(hasAccessRole).toHaveBeenNthCalledWith(2, ['Reports.Read', 'Reports.Export'], {
      required: true,
      refresh: true,
    });
  });

  it('retains the resolved value when a refresh fails', async () => {
    const error = new Error('refresh failed');
    const hasAccessRole = vi
      .fn<IRolesProvider['hasAccessRole']>()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(error);
    const check = createAccessRoleCheck({ hasAccessRole }, ['Reports.Read']);

    await check.load();
    await expect(check.refresh()).rejects.toBe(error);

    expect(check.state).toEqual({
      hasAccessRole: true,
      isLoading: false,
      error,
    });
  });

  it('ignores completion from a superseded operation', async () => {
    const first = createDeferred<boolean>();
    const second = createDeferred<boolean>();
    const hasAccessRole = vi
      .fn<IRolesProvider['hasAccessRole']>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const check = createAccessRoleCheck({ hasAccessRole }, ['Reports.Read']);

    const firstLoad = check.load();
    const secondLoad = check.refresh();
    second.resolve(false);
    await secondLoad;
    first.resolve(true);
    await firstLoad;

    expect(check.state).toEqual({
      hasAccessRole: false,
      isLoading: false,
      error: undefined,
    });
  });

  it('completes state and rejects new operations after disposal', async () => {
    const hasAccessRole = vi.fn<IRolesProvider['hasAccessRole']>().mockResolvedValue(true);
    const check = createAccessRoleCheck({ hasAccessRole }, ['Reports.Read']);
    const complete = vi.fn();
    check.state$.subscribe({ complete });

    check.dispose();

    expect(complete).toHaveBeenCalledOnce();
    await expect(check.load()).rejects.toThrow('Access role check has been disposed.');
    expect(hasAccessRole).not.toHaveBeenCalled();
  });
});
