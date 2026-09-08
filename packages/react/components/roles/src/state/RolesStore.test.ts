import { firstValueFrom, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { RolesStore } from './RolesStore';
import type {
  ActiveAccessRoleAssignments,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
} from './roles-state';

const stores: RolesStore[] = [];

/**
 * Creates a real store with typed provider operations for behavioral flow tests.
 * @returns The store and its independently controllable provider operations.
 */
const setup = () => {
  const provider = {
    getActiveAccessRoleAssignments: vi
      .fn<IRolesProvider['getActiveAccessRoleAssignments']>()
      .mockResolvedValue([]),
    getConsolidatedClaimableRoleAssignments: vi
      .fn<IRolesProvider['getConsolidatedClaimableRoleAssignments']>()
      .mockResolvedValue([]),
    getConsolidatedRoleAssignments: vi
      .fn<IRolesProvider['getConsolidatedRoleAssignments']>()
      .mockResolvedValue([]),
    activateClaimableRoleAssignment: vi
      .fn<IRolesProvider['activateClaimableRoleAssignment']>()
      .mockResolvedValue({ id: 'claimed' }),
    deactivateClaimableRoleAssignment: vi
      .fn<IRolesProvider['deactivateClaimableRoleAssignment']>()
      .mockResolvedValue({ id: 'ended' }),
    hasAccessRole: vi.fn<IRolesProvider['hasAccessRole']>(),
    hasClaimableRoleAssignmentForAccessRole:
      vi.fn<IRolesProvider['hasClaimableRoleAssignmentForAccessRole']>(),
    getRequiredAccessRoleStatuses: vi.fn<IRolesProvider['getRequiredAccessRoleStatuses']>(),
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
  it.each([
    'activeAccessRoleAssignments',
    'consolidatedClaimableRoleAssignments',
    'consolidatedRoleAssignments',
  ] as const)(
    'settles synchronous %s failures without terminating subsequent requests',
    async (collection) => {
      const { store, provider } = setup();
      const failure = new Error(`${collection} unavailable`);
      const read =
        collection === 'activeAccessRoleAssignments'
          ? provider.getActiveAccessRoleAssignments
          : collection === 'consolidatedClaimableRoleAssignments'
            ? provider.getConsolidatedClaimableRoleAssignments
            : provider.getConsolidatedRoleAssignments;
      read.mockImplementationOnce(() => {
        throw failure;
      });
      const load =
        collection === 'activeAccessRoleAssignments'
          ? store.loadActiveAccessRoleAssignments.bind(store)
          : collection === 'consolidatedClaimableRoleAssignments'
            ? store.loadConsolidatedClaimableRoleAssignments.bind(store)
            : store.loadConsolidatedRoleAssignments.bind(store);

      await expect(load()).resolves.toBeUndefined();
      expect(store.value[collection]).toMatchObject({ status: 'error', error: failure });
      await expect(load(true)).resolves.toBeUndefined();
      expect(read).toHaveBeenLastCalledWith({ refresh: true });
      expect(store.value[collection]).toMatchObject({ status: 'success', error: undefined });
    },
  );

  it('settles overlapping reload callers without accepting stale results or errors', async () => {
    const { store, provider } = setup();
    const olderActive = new Subject<ActiveAccessRoleAssignments>();
    const olderClaimable = new Subject<ConsolidatedClaimableRoleAssignments>();
    provider.getActiveAccessRoleAssignments
      .mockReturnValueOnce(firstValueFrom(olderActive))
      .mockResolvedValueOnce([{ accessRoleName: 'newer' }]);
    provider.getConsolidatedClaimableRoleAssignments
      .mockReturnValueOnce(firstValueFrom(olderClaimable))
      .mockResolvedValueOnce([{ id: 'newer' }]);

    const active = store.loadActiveAccessRoleAssignments();
    const claimable = store.loadConsolidatedClaimableRoleAssignments();
    await Promise.all([
      store.loadActiveAccessRoleAssignments(true),
      store.loadConsolidatedClaimableRoleAssignments(true),
    ]);
    olderActive.next([{ accessRoleName: 'older' }]);
    olderClaimable.error(new Error('stale request failed'));
    await Promise.all([active, claimable]);

    expect(store.value.activeAccessRoleAssignments.assignments).toEqual([
      { accessRoleName: 'newer' },
    ]);
    expect(store.value.consolidatedClaimableRoleAssignments.assignments).toEqual([{ id: 'newer' }]);
    expect(store.value.consolidatedClaimableRoleAssignments.status).toBe('success');
    expect(store.value.consolidatedClaimableRoleAssignments.error).toBeUndefined();
  });
});

/** Maps each store mutation method to the provider operation it delegates to. */
const providerOperationFor = {
  activateClaimableRoleAssignment: 'activateClaimableRoleAssignment',
  deactivateClaimableRoleAssignment: 'deactivateClaimableRoleAssignment',
} as const;

describe('RolesStore mutations', () => {
  it.each(['activateClaimableRoleAssignment', 'deactivateClaimableRoleAssignment'] as const)(
    'rejects synchronous %s failures and keeps the flow usable',
    async (operation) => {
      const { store, provider } = setup();
      const failure = new Error('mutation failed');
      provider[providerOperationFor[operation]].mockImplementationOnce(() => {
        throw failure;
      });

      await expect(store[operation]({ assignmentId: 'assignment' })).rejects.toBe(failure);
      const mutation =
        operation === 'activateClaimableRoleAssignment' ? 'activation' : 'deactivation';
      expect(store.value[mutation]).toMatchObject({ pending: 0, error: failure });
      expect(provider.getActiveAccessRoleAssignments).not.toHaveBeenCalled();
      expect(provider.getConsolidatedClaimableRoleAssignments).not.toHaveBeenCalled();
      expect(provider.getConsolidatedRoleAssignments).not.toHaveBeenCalled();
      await expect(store[operation]({ assignmentId: 'assignment' })).resolves.toHaveProperty('id');
      expect(store.value[mutation]).toMatchObject({ pending: 0, error: undefined });
    },
  );

  it.each(['activateClaimableRoleAssignment', 'deactivateClaimableRoleAssignment'] as const)(
    'resolves successful %s when both refreshes fail, including synchronous throws',
    async (operation) => {
      const { store, provider } = setup();
      const activeError = new Error('active refresh failed');
      const claimableError = new Error('claimable refresh failed');
      provider.getActiveAccessRoleAssignments.mockImplementationOnce(() => {
        throw activeError;
      });
      provider.getConsolidatedClaimableRoleAssignments.mockRejectedValueOnce(claimableError);

      await expect(store[operation]({ assignmentId: 'assignment' })).resolves.toHaveProperty('id');
      expect(store.value.activeAccessRoleAssignments).toMatchObject({
        status: 'error',
        error: activeError,
      });
      expect(store.value.consolidatedClaimableRoleAssignments).toMatchObject({
        status: 'error',
        error: claimableError,
      });
      expect(
        store.value[
          operation === 'activateClaimableRoleAssignment' ? 'activation' : 'deactivation'
        ],
      ).toEqual({
        pending: 0,
        error: undefined,
      });
      await Promise.all([
        store.loadActiveAccessRoleAssignments(),
        store.loadConsolidatedClaimableRoleAssignments(),
      ]);
      expect(store.value.activeAccessRoleAssignments.status).toBe('success');
      expect(store.value.consolidatedClaimableRoleAssignments.status).toBe('success');
    },
  );

  it.each(['activateClaimableRoleAssignment', 'deactivateClaimableRoleAssignment'] as const)(
    'does not refresh assigned roles as a side effect of a successful %s',
    async (operation) => {
      const { store, provider } = setup();

      await store[operation]({ assignmentId: 'assignment' });

      expect(provider.getConsolidatedRoleAssignments).not.toHaveBeenCalled();
      expect(store.value.consolidatedRoleAssignments).toMatchObject({
        status: 'loading',
        operationId: 0,
      });
    },
  );

  it.each(['activateClaimableRoleAssignment', 'deactivateClaimableRoleAssignment'] as const)(
    'publishes each %s refresh independently and ignores a slow refresh superseded by reload',
    async (operation) => {
      const { store, provider } = setup();
      const slowActive = new Subject<ActiveAccessRoleAssignments>();
      const failure = new Error('claimable refresh failed');
      provider.getActiveAccessRoleAssignments.mockReturnValueOnce(firstValueFrom(slowActive));
      provider.getConsolidatedClaimableRoleAssignments.mockRejectedValueOnce(failure);
      const completed = vi.fn();
      const mutation = store[operation]({ assignmentId: 'assignment' }).then(completed);

      await vi.waitFor(() =>
        expect(store.value.consolidatedClaimableRoleAssignments.error).toBe(failure),
      );
      expect(store.value.activeAccessRoleAssignments.status).toBe('loading');
      expect(completed).not.toHaveBeenCalled();
      provider.getActiveAccessRoleAssignments.mockResolvedValueOnce([{ accessRoleName: 'latest' }]);
      await store.loadActiveAccessRoleAssignments(true);
      slowActive.next([{ accessRoleName: 'stale refresh' }]);
      await mutation;

      expect(completed).toHaveBeenCalledOnce();
      expect(store.value.activeAccessRoleAssignments.assignments).toEqual([
        { accessRoleName: 'latest' },
      ]);
      expect(store.value.consolidatedClaimableRoleAssignments.error).toBe(failure);
    },
  );

  it('correlates overlapping mutations and their refresh outcomes independently', async () => {
    const { store, provider } = setup();
    const slowClaim = new Subject<ClaimableRoleAssignmentActivationResult>();
    const slowRefresh = new Subject<ActiveAccessRoleAssignments>();
    provider.activateClaimableRoleAssignment.mockReturnValueOnce(firstValueFrom(slowClaim));
    provider.getActiveAccessRoleAssignments
      .mockReturnValueOnce(firstValueFrom(slowRefresh))
      .mockResolvedValueOnce([{ accessRoleName: 'after claim' }]);
    const claimDone = vi.fn();
    const deactivateDone = vi.fn();
    const claim = store.activateClaimableRoleAssignment({ assignmentId: 'claim' }).then(claimDone);
    const deactivate = store
      .deactivateClaimableRoleAssignment({ assignmentId: 'deactivate' })
      .then(deactivateDone);

    await vi.waitFor(() => expect(provider.getActiveAccessRoleAssignments).toHaveBeenCalledOnce());
    expect(store.value.activation.pending).toBe(1);
    expect(store.value.deactivation.pending).toBe(1);
    slowClaim.next({ id: 'late claim result' });
    await claim;
    expect(claimDone).toHaveBeenCalledWith({ id: 'late claim result' });
    expect(deactivateDone).not.toHaveBeenCalled();
    expect(store.value.activation.pending).toBe(0);
    expect(store.value.deactivation.pending).toBe(1);
    slowRefresh.next([{ accessRoleName: 'stale deactivate refresh' }]);
    await deactivate;

    expect(deactivateDone).toHaveBeenCalledWith({ id: 'ended' });
    expect(store.value.activeAccessRoleAssignments.assignments).toEqual([
      { accessRoleName: 'after claim' },
    ]);
    expect(store.value.deactivation.pending).toBe(0);
  });
});

describe('RolesStore disposal', () => {
  it.each(['dispose', 'complete', 'unsubscribe'] as const)(
    '%s settles pending callers, completes observers, and rejects reuse',
    async (lifecycle) => {
      const { store, provider } = setup();
      const active = new Subject<ActiveAccessRoleAssignments>();
      const claimable = new Subject<ConsolidatedClaimableRoleAssignments>();
      const assigned = new Subject<ConsolidatedRoleAssignments>();
      const claim = new Subject<ClaimableRoleAssignmentActivationResult>();
      const deactivate = new Subject<ClaimableRoleAssignmentActivationResult>();
      provider.getActiveAccessRoleAssignments.mockReturnValue(firstValueFrom(active));
      provider.getConsolidatedClaimableRoleAssignments.mockReturnValue(firstValueFrom(claimable));
      provider.getConsolidatedRoleAssignments.mockReturnValue(firstValueFrom(assigned));
      provider.activateClaimableRoleAssignment.mockReturnValue(firstValueFrom(claim));
      provider.deactivateClaimableRoleAssignment.mockReturnValue(firstValueFrom(deactivate));
      const stateCompleted = vi.fn();
      const actionsCompleted = vi.fn();
      store.subscribe({ complete: stateCompleted });
      store.action$.subscribe({ complete: actionsCompleted });
      const settled = Promise.allSettled([
        store.loadActiveAccessRoleAssignments(),
        store.loadConsolidatedClaimableRoleAssignments(),
        store.loadConsolidatedRoleAssignments(),
        store.activateClaimableRoleAssignment({ assignmentId: 'claim' }),
        store.deactivateClaimableRoleAssignment({ assignmentId: 'deactivate' }),
      ]);

      store[lifecycle]();
      store[lifecycle]();

      expect(await settled).toEqual([
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
        { status: 'rejected', reason: new Error('Roles store has been disposed.') },
      ]);
      expect(stateCompleted).toHaveBeenCalledOnce();
      expect(actionsCompleted).toHaveBeenCalledOnce();
      await expect(store.loadActiveAccessRoleAssignments()).rejects.toThrow('disposed');
      await expect(store.loadConsolidatedClaimableRoleAssignments()).rejects.toThrow('disposed');
      await expect(store.loadConsolidatedRoleAssignments()).rejects.toThrow('disposed');
      await expect(
        store.activateClaimableRoleAssignment({ assignmentId: 'claim' }),
      ).rejects.toThrow('disposed');
      await expect(
        store.deactivateClaimableRoleAssignment({ assignmentId: 'deactivate' }),
      ).rejects.toThrow('disposed');

      active.next([]);
      claimable.next([]);
      assigned.next([]);
      claim.next({ id: 'late claim' });
      deactivate.next({ id: 'late deactivate' });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(provider.getActiveAccessRoleAssignments).toHaveBeenCalledOnce();
      expect(provider.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledOnce();
      expect(provider.getConsolidatedRoleAssignments).toHaveBeenCalledOnce();
      expect(provider.dispose).not.toHaveBeenCalled();
    },
  );

  it('cancels a queued synchronous failure before base subjects are disconnected', async () => {
    const { store, provider } = setup();
    provider.getActiveAccessRoleAssignments.mockImplementation(() => {
      throw new Error('queued failure');
    });
    const pending = store.loadActiveAccessRoleAssignments();
    const rejected = expect(pending).rejects.toThrow('disposed');
    store.unsubscribe();
    await rejected;
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('settles a successful mutation disposed during its still-pending refresh', async () => {
    const { store, provider } = setup();
    const refresh = new Subject<ActiveAccessRoleAssignments>();
    provider.getActiveAccessRoleAssignments.mockReturnValueOnce(firstValueFrom(refresh));
    const pending = store.activateClaimableRoleAssignment({ assignmentId: 'assignment' });
    const rejected = expect(pending).rejects.toThrow('disposed');
    await vi.waitFor(() => expect(provider.getActiveAccessRoleAssignments).toHaveBeenCalledOnce());
    const snapshot = store.value;

    store.dispose();
    await rejected;
    refresh.next([{ accessRoleName: 'late result' }]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.value).toBe(snapshot);
  });
});
