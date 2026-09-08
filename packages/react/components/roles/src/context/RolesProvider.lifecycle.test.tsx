import { StrictMode, useEffect, type ReactNode } from 'react';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@equinor/fusion-react-errorboundary';
import { RolesProvider } from './RolesProvider';
import {
  useClaimableRoleAssignments,
  type UseClaimableRoleAssignmentsResult,
} from '../hooks/useClaimableRoleAssignments';
import {
  useActiveAccessRoleAssignments,
  type UseActiveAccessRoleAssignmentsResult,
} from '../hooks/useActiveAccessRoleAssignments';
import type { ConsolidatedClaimableRoleAssignments } from '../state/roles-state';

const moduleHook = vi.hoisted(() => vi.fn());
vi.mock('@equinor/fusion-framework-react-module', () => ({ useModule: moduleHook }));

/** Creates independently controllable module identities for lifecycle tests. */
const createProvider = () => ({
  getActiveAccessRoleAssignments: vi.fn().mockResolvedValue([]),
  getConsolidatedClaimableRoleAssignments: vi.fn().mockResolvedValue([]),
  getConsolidatedRoleAssignments: vi.fn().mockResolvedValue([]),
  activateClaimableRoleAssignment: vi.fn().mockResolvedValue({ id: 'activation' }),
  deactivateClaimableRoleAssignment: vi.fn().mockResolvedValue({ id: 'deactivation' }),
  hasAccessRole: vi.fn().mockResolvedValue(true),
});

/** Public action references whose identity must survive collection and mutation updates. */
interface ActionSnapshot {
  readonly activeAccessRoleAssignments: UseActiveAccessRoleAssignmentsResult;
  readonly consolidatedClaimableRoleAssignments: UseClaimableRoleAssignmentsResult;
}

/**
 * Observes real context values without mocking either public hook.
 * @param props - Observer for the public state and action identities.
 * @returns A loading/settlement marker for deterministic interaction.
 */
const ActionConsumer = ({
  onSnapshot,
}: {
  readonly onSnapshot: (snapshot: ActionSnapshot) => void;
}): ReactNode => {
  const activeAccessRoleAssignments = useActiveAccessRoleAssignments();
  const consolidatedClaimableRoleAssignments = useClaimableRoleAssignments();
  useEffect(() => {
    onSnapshot({ activeAccessRoleAssignments, consolidatedClaimableRoleAssignments });
  }, [activeAccessRoleAssignments, consolidatedClaimableRoleAssignments, onSnapshot]);
  return (
    <p>
      {activeAccessRoleAssignments.isLoading || consolidatedClaimableRoleAssignments.isLoading
        ? 'Pending'
        : 'Settled'}
    </p>
  );
};

/**
 * Creates an activation snapshot at a deterministic relative expiry.
 * @param isActive - Whether the service considers the assignment active.
 * @param id - Addressable assignment identifier.
 * @returns A complete collection fixture for expiry recovery.
 */
const activation = (
  isActive: boolean,
  id = 'assignment',
): ConsolidatedClaimableRoleAssignments[number] => ({
  id,
  claimableRole: { name: id, displayName: id },
  isActive,
  activeTo: new Date(Date.now() + (isActive ? 120_000 : -1_000)).toISOString(),
});

describe('RolesProvider lifecycle', () => {
  let provider = createProvider();
  beforeEach(() => {
    provider = createProvider();
    moduleHook.mockReset().mockReturnValue(provider);
  });
  afterEach(() => {
    cleanup();
  });

  it('reports missing module setup before creating a loading store', async () => {
    moduleHook.mockReturnValue(undefined);
    const screen = await render(
      <ErrorBoundary fallbackRender={({ error }) => <p role="alert">{String(error)}</p>}>
        <RolesProvider>
          <p>Unchecked child</p>
        </RolesProvider>
      </ErrorBoundary>,
    );
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Call enableRoles');
    await expect.element(screen.getByText('Unchecked child')).not.toBeInTheDocument();
    expect(provider.getActiveAccessRoleAssignments).not.toHaveBeenCalled();
  });

  it('keeps all public actions stable through StrictMode replay, reads, and mutations', async () => {
    const snapshots: ActionSnapshot[] = [];
    /** Records every context update so transient loading identities are tested too. */
    const onSnapshot = (snapshot: ActionSnapshot): void => {
      snapshots.push(snapshot);
    };
    const screen = await render(
      <StrictMode>
        <RolesProvider>
          <ActionConsumer onSnapshot={onSnapshot} />
        </RolesProvider>
      </StrictMode>,
    );
    await expect.element(screen.getByText('Settled')).toBeVisible();
    const first = snapshots[0];
    // Fail explicitly rather than silently skipping identity assertions when subscription fails.
    if (!first) {
      throw new Error('Expected initial context snapshot');
    }
    await first.activeAccessRoleAssignments.reload();
    await first.consolidatedClaimableRoleAssignments.reload();
    await first.consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment({
      assignmentId: 'assignment',
    });
    await first.consolidatedClaimableRoleAssignments.deactivateClaimableRoleAssignment({
      assignmentId: 'assignment',
    });
    window.dispatchEvent(new Event('focus'));
    await expect.element(screen.getByText('Settled')).toBeVisible();
    expect(snapshots.length).toBeGreaterThan(2);
    // Check transient loading frames too, not just the final settled action identities.
    for (const snapshot of snapshots) {
      expect(snapshot.activeAccessRoleAssignments.reload).toBe(
        first.activeAccessRoleAssignments.reload,
      );
      expect(snapshot.consolidatedClaimableRoleAssignments.reload).toBe(
        first.consolidatedClaimableRoleAssignments.reload,
      );
      expect(snapshot.consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment).toBe(
        first.consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment,
      );
      expect(snapshot.consolidatedClaimableRoleAssignments.deactivateClaimableRoleAssignment).toBe(
        first.consolidatedClaimableRoleAssignments.deactivateClaimableRoleAssignment,
      );
    }
  });

  it('rejects pending callers on unmount and removes refresh listeners', async () => {
    const pending = Promise.withResolvers<{ id: string }>();
    provider.activateClaimableRoleAssignment.mockReturnValue(pending.promise);
    const observer = vi.fn<(snapshot: ActionSnapshot) => void>();
    const screen = await render(
      <RolesProvider>
        <ActionConsumer onSnapshot={observer} />
      </RolesProvider>,
    );
    await expect.element(screen.getByText('Settled')).toBeVisible();
    const latest = observer.mock.lastCall?.[0];
    // A missing snapshot would otherwise turn the pending-call test into a false positive.
    if (!latest) {
      throw new Error('Expected settled context snapshot');
    }
    const result = latest.consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment({
      assignmentId: 'assignment',
    });
    const rejected = expect(result).rejects.toThrow(/dispos/i);
    await screen.unmount();
    await rejected;
    const reads = provider.getActiveAccessRoleAssignments.mock.calls.length;
    window.dispatchEvent(new Event('focus'));
    pending.resolve({ id: 'late-activation' });
    await Promise.resolve();
    expect(provider.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(reads);
  });

  it.each(['dismiss', 'deactivate'])(
    'restores recovery after %s, ordinary claim, and another expiry',
    async (action) => {
      provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([activation(true)]);
      const observer = vi.fn<(snapshot: ActionSnapshot) => void>();
      const screen = await render(
        <RolesProvider>
          <ActionConsumer onSnapshot={observer} />
        </RolesProvider>,
      );
      await expect.element(screen.getByText('Settled')).toBeVisible();
      provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([activation(false)]);
      // Both recovery dismissal and intentional deactivation suppress only the current period.
      if (action === 'dismiss') {
        window.dispatchEvent(new Event('focus'));
        await screen.getByRole('button', { name: 'Cancel' }).click();
      } else {
        await observer.mock.lastCall?.[0].consolidatedClaimableRoleAssignments.deactivateClaimableRoleAssignment(
          { assignmentId: 'assignment' },
        );
      }
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
      window.dispatchEvent(new Event('focus'));
      await expect.element(screen.getByText('Settled')).toBeVisible();
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();

      provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([activation(true)]);
      await observer.mock.lastCall?.[0].consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment(
        { assignmentId: 'assignment' },
      );
      await expect.element(screen.getByText('Settled')).toBeVisible();
      provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([activation(false)]);
      window.dispatchEvent(new Event('focus'));
      await expect.element(screen.getByText('Claim assignment', { exact: true })).toBeVisible();
    },
  );

  it('settles old callers on provider replacement without letting late reads update the new scope', async () => {
    const observer = vi.fn<(snapshot: ActionSnapshot) => void>();
    const screen = await render(
      <RolesProvider>
        <ActionConsumer onSnapshot={observer} />
      </RolesProvider>,
    );
    await expect.element(screen.getByText('Settled')).toBeVisible();
    const oldActions = observer.mock.lastCall?.[0];
    // Capturing the old scope is essential to testing disposal rather than the new provider's API.
    if (!oldActions) {
      throw new Error('Expected old provider actions');
    }
    const pendingRead = Promise.withResolvers<ConsolidatedClaimableRoleAssignments>();
    provider.getConsolidatedClaimableRoleAssignments.mockReturnValueOnce(pendingRead.promise);
    const oldRead = oldActions.consolidatedClaimableRoleAssignments.reload();
    const rejected = expect(oldRead).rejects.toThrow(/dispos/i);
    const replacement = createProvider();
    moduleHook.mockReturnValue(replacement);
    await screen.rerender(
      <RolesProvider>
        <ActionConsumer onSnapshot={observer} />
      </RolesProvider>,
    );
    await rejected;
    await expect.element(screen.getByText('Settled')).toBeVisible();
    const current = observer.mock.lastCall?.[0];
    expect(current?.consolidatedClaimableRoleAssignments.reload).not.toBe(
      oldActions.consolidatedClaimableRoleAssignments.reload,
    );
    pendingRead.resolve([activation(false, 'old-provider-only')]);
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    await current?.consolidatedClaimableRoleAssignments.reload();
    expect(observer.mock.lastCall?.[0].consolidatedClaimableRoleAssignments.assignments).toEqual(
      [],
    );
    await expect(oldActions.activeAccessRoleAssignments.reload()).rejects.toThrow(/dispos/i);
  });

  it('queues simultaneous expiries and resets all recovery state on provider replacement', async () => {
    provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([
      activation(true, 'one'),
      activation(true, 'two'),
    ]);
    const observer = vi.fn<(snapshot: ActionSnapshot) => void>();
    const tree = (
      <RolesProvider>
        <ActionConsumer onSnapshot={observer} />
      </RolesProvider>
    );
    const screen = await render(tree);
    await expect.element(screen.getByText('Settled')).toBeVisible();
    provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([
      activation(false, 'one'),
      activation(false, 'two'),
    ]);
    window.dispatchEvent(new Event('focus'));
    await expect.element(screen.getByText('Claim one', { exact: true })).toBeVisible();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(screen.getByText('Claim two', { exact: true })).toBeVisible();
    await screen.getByLabelText('Reason').fill('Old provider reason');

    const replacement = createProvider();
    replacement.getConsolidatedClaimableRoleAssignments.mockResolvedValue([
      activation(true, 'one'),
    ]);
    moduleHook.mockReturnValue(replacement);
    // A fresh React element is required to exercise module lookup on rerender.
    await screen.rerender(
      <RolesProvider>
        <ActionConsumer onSnapshot={observer} />
      </RolesProvider>,
    );
    await expect.element(screen.getByText('Settled')).toBeVisible();
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    replacement.getConsolidatedClaimableRoleAssignments.mockResolvedValue([
      activation(false, 'one'),
    ]);
    window.dispatchEvent(new Event('focus'));
    await expect.element(screen.getByText('Claim one', { exact: true })).toBeVisible();
    await expect.element(screen.getByLabelText('Reason')).toHaveValue('Continue active work');
    expect(replacement.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(2);
  });
});
