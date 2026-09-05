import { firstValueFrom, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { RolesStore } from './RolesStore';
import type { ActiveRoles, ClaimableRoles, RoleClaimResult } from './roles-state';

const stores: RolesStore[] = [];

/**
 * Creates a real store with typed provider operations for behavioral flow tests.
 * @returns The store and its independently controllable provider operations.
 */
const setup = () => {
  const provider = {
    getActiveRoles: vi.fn<IRolesProvider['getActiveRoles']>().mockResolvedValue([]),
    getClaimableRoles: vi.fn<IRolesProvider['getClaimableRoles']>().mockResolvedValue([]),
    claimRole: vi.fn<IRolesProvider['claimRole']>().mockResolvedValue({ id: 'claimed' }),
    deactivateRole: vi.fn<IRolesProvider['deactivateRole']>().mockResolvedValue({ id: 'ended' }),
    hasRole: vi.fn<IRolesProvider['hasRole']>(),
    canClaimAccessRole: vi.fn<IRolesProvider['canClaimAccessRole']>(),
    getRequiredRoleStatuses: vi.fn<IRolesProvider['getRequiredRoleStatuses']>(),
    getAccessRoles: vi.fn<IRolesProvider['getAccessRoles']>(),
    dispose: vi.fn<IRolesProvider['dispose']>(),
  } satisfies IRolesProvider;
  const store = new RolesStore(provider);
  stores.push(store);
  return { store, provider };
};

afterEach(() => {
  // Every test owns its store, but never the injected provider's lifetime.
  for (const store of stores.splice(0)) {
    store.dispose();
  }
});

describe('RolesStore collection requests', () => {
  it.each(['active', 'claimable'] as const)(
    'settles synchronous %s failures without terminating subsequent requests',
    async (domain) => {
      const { store, provider } = setup();
      const failure = new Error(`${domain} unavailable`);
      const read = domain === 'active' ? provider.getActiveRoles : provider.getClaimableRoles;
      read.mockImplementationOnce(() => {
        throw failure;
      });
      const load =
        domain === 'active'
          ? store.loadActiveRoles.bind(store)
          : store.loadClaimableRoles.bind(store);

      await expect(load()).resolves.toBeUndefined();
      expect(store.value[domain]).toMatchObject({ status: 'error', error: failure });
      await expect(load(true)).resolves.toBeUndefined();
      expect(read).toHaveBeenLastCalledWith({ refresh: true });
      expect(store.value[domain]).toMatchObject({ status: 'success', error: undefined });
    },
  );

  it('settles overlapping reload callers without accepting stale results or errors', async () => {
    const { store, provider } = setup();
    const olderActive = new Subject<ActiveRoles>();
    const olderClaimable = new Subject<ClaimableRoles>();
    provider.getActiveRoles
      .mockReturnValueOnce(firstValueFrom(olderActive))
      .mockResolvedValueOnce([{ accessRoleName: 'newer' }]);
    provider.getClaimableRoles
      .mockReturnValueOnce(firstValueFrom(olderClaimable))
      .mockResolvedValueOnce([{ id: 'newer' }]);

    const active = store.loadActiveRoles();
    const claimable = store.loadClaimableRoles();
    await Promise.all([store.loadActiveRoles(true), store.loadClaimableRoles(true)]);
    olderActive.next([{ accessRoleName: 'older' }]);
    olderClaimable.error(new Error('stale request failed'));
    await Promise.all([active, claimable]);

    expect(store.value.active.roles).toEqual([{ accessRoleName: 'newer' }]);
    expect(store.value.claimable.roles).toEqual([{ id: 'newer' }]);
    expect(store.value.claimable.status).toBe('success');
    expect(store.value.claimable.error).toBeUndefined();
  });
});

describe('RolesStore mutations', () => {
  it.each(['claimRole', 'deactivateRole'] as const)(
    'rejects synchronous %s failures and keeps the flow usable',
    async (operation) => {
      const { store, provider } = setup();
      const failure = new Error('mutation failed');
      provider[operation].mockImplementationOnce(() => {
        throw failure;
      });

      await expect(store[operation]({ roleId: 'assignment' })).rejects.toBe(failure);
      const domain = operation === 'claimRole' ? 'claim' : 'deactivate';
      expect(store.value[domain]).toMatchObject({ pending: 0, error: failure });
      expect(provider.getActiveRoles).not.toHaveBeenCalled();
      expect(provider.getClaimableRoles).not.toHaveBeenCalled();
      await expect(store[operation]({ roleId: 'assignment' })).resolves.toHaveProperty('id');
      expect(store.value[domain]).toMatchObject({ pending: 0, error: undefined });
    },
  );

  it.each(['claimRole', 'deactivateRole'] as const)(
    'resolves successful %s when both refreshes fail, including synchronous throws',
    async (operation) => {
      const { store, provider } = setup();
      const activeError = new Error('active refresh failed');
      const claimableError = new Error('claimable refresh failed');
      provider.getActiveRoles.mockImplementationOnce(() => {
        throw activeError;
      });
      provider.getClaimableRoles.mockRejectedValueOnce(claimableError);

      await expect(store[operation]({ roleId: 'assignment' })).resolves.toHaveProperty('id');
      expect(store.value.active).toMatchObject({ status: 'error', error: activeError });
      expect(store.value.claimable).toMatchObject({ status: 'error', error: claimableError });
      expect(store.value[operation === 'claimRole' ? 'claim' : 'deactivate']).toEqual({
        pending: 0,
        error: undefined,
      });
      await Promise.all([store.loadActiveRoles(), store.loadClaimableRoles()]);
      expect(store.value.active.status).toBe('success');
      expect(store.value.claimable.status).toBe('success');
    },
  );

  it.each(['claimRole', 'deactivateRole'] as const)(
    'publishes each %s refresh independently and ignores a slow refresh superseded by reload',
    async (operation) => {
      const { store, provider } = setup();
      const slowActive = new Subject<ActiveRoles>();
      const failure = new Error('claimable refresh failed');
      provider.getActiveRoles.mockReturnValueOnce(firstValueFrom(slowActive));
      provider.getClaimableRoles.mockRejectedValueOnce(failure);
      const completed = vi.fn();
      const mutation = store[operation]({ roleId: 'assignment' }).then(completed);

      await vi.waitFor(() => expect(store.value.claimable.error).toBe(failure));
      expect(store.value.active.status).toBe('loading');
      expect(completed).not.toHaveBeenCalled();
      provider.getActiveRoles.mockResolvedValueOnce([{ accessRoleName: 'latest' }]);
      await store.loadActiveRoles(true);
      slowActive.next([{ accessRoleName: 'stale refresh' }]);
      await mutation;

      expect(completed).toHaveBeenCalledOnce();
      expect(store.value.active.roles).toEqual([{ accessRoleName: 'latest' }]);
      expect(store.value.claimable.error).toBe(failure);
    },
  );

  it('correlates overlapping mutations and their refresh outcomes independently', async () => {
    const { store, provider } = setup();
    const slowClaim = new Subject<RoleClaimResult>();
    const slowRefresh = new Subject<ActiveRoles>();
    provider.claimRole.mockReturnValueOnce(firstValueFrom(slowClaim));
    provider.getActiveRoles
      .mockReturnValueOnce(firstValueFrom(slowRefresh))
      .mockResolvedValueOnce([{ accessRoleName: 'after claim' }]);
    const claimDone = vi.fn();
    const deactivateDone = vi.fn();
    const claim = store.claimRole({ roleId: 'claim' }).then(claimDone);
    const deactivate = store.deactivateRole({ roleId: 'deactivate' }).then(deactivateDone);

    await vi.waitFor(() => expect(provider.getActiveRoles).toHaveBeenCalledOnce());
    expect(store.value.claim.pending).toBe(1);
    expect(store.value.deactivate.pending).toBe(1);
    slowClaim.next({ id: 'late claim result' });
    await claim;
    expect(claimDone).toHaveBeenCalledWith({ id: 'late claim result' });
    expect(deactivateDone).not.toHaveBeenCalled();
    expect(store.value.claim.pending).toBe(0);
    expect(store.value.deactivate.pending).toBe(1);
    slowRefresh.next([{ accessRoleName: 'stale deactivate refresh' }]);
    await deactivate;

    expect(deactivateDone).toHaveBeenCalledWith({ id: 'ended' });
    expect(store.value.active.roles).toEqual([{ accessRoleName: 'after claim' }]);
    expect(store.value.deactivate.pending).toBe(0);
  });
});

describe('RolesStore disposal', () => {
  it.each(['dispose', 'complete', 'unsubscribe'] as const)(
    '%s settles pending callers, completes observers, and rejects reuse',
    async (lifecycle) => {
      const { store, provider } = setup();
      const active = new Subject<ActiveRoles>();
      const claimable = new Subject<ClaimableRoles>();
      const claim = new Subject<RoleClaimResult>();
      const deactivate = new Subject<RoleClaimResult>();
      provider.getActiveRoles.mockReturnValue(firstValueFrom(active));
      provider.getClaimableRoles.mockReturnValue(firstValueFrom(claimable));
      provider.claimRole.mockReturnValue(firstValueFrom(claim));
      provider.deactivateRole.mockReturnValue(firstValueFrom(deactivate));
      const stateCompleted = vi.fn();
      const actionsCompleted = vi.fn();
      store.subscribe({ complete: stateCompleted });
      store.action$.subscribe({ complete: actionsCompleted });
      const settled = Promise.allSettled([
        store.loadActiveRoles(),
        store.loadClaimableRoles(),
        store.claimRole({ roleId: 'claim' }),
        store.deactivateRole({ roleId: 'deactivate' }),
      ]);

      store[lifecycle]();
      store[lifecycle]();

      expect(await settled).toEqual([
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
      ]);
      expect(stateCompleted).toHaveBeenCalledOnce();
      expect(actionsCompleted).toHaveBeenCalledOnce();
      await expect(store.loadActiveRoles()).rejects.toThrow('disposed');
      await expect(store.loadClaimableRoles()).rejects.toThrow('disposed');
      await expect(store.claimRole({ roleId: 'claim' })).rejects.toThrow('disposed');
      await expect(store.deactivateRole({ roleId: 'deactivate' })).rejects.toThrow('disposed');

      active.next([]);
      claimable.next([]);
      claim.next({ id: 'late claim' });
      deactivate.next({ id: 'late deactivate' });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(provider.getActiveRoles).toHaveBeenCalledOnce();
      expect(provider.getClaimableRoles).toHaveBeenCalledOnce();
      expect(provider.dispose).not.toHaveBeenCalled();
    },
  );

  it('cancels a queued synchronous failure before base subjects are disconnected', async () => {
    const { store, provider } = setup();
    provider.getActiveRoles.mockImplementation(() => {
      throw new Error('queued failure');
    });
    const pending = store.loadActiveRoles();
    const rejected = expect(pending).rejects.toThrow('disposed');
    store.unsubscribe();
    await rejected;
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('settles a successful mutation disposed during its still-pending refresh', async () => {
    const { store, provider } = setup();
    const refresh = new Subject<ActiveRoles>();
    provider.getActiveRoles.mockReturnValueOnce(firstValueFrom(refresh));
    const pending = store.claimRole({ roleId: 'assignment' });
    const rejected = expect(pending).rejects.toThrow('disposed');
    await vi.waitFor(() => expect(provider.getActiveRoles).toHaveBeenCalledOnce());
    const snapshot = store.value;

    store.dispose();
    await rejected;
    refresh.next([{ accessRoleName: 'late result' }]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.value).toBe(snapshot);
  });
});
