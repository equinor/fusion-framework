import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defer, type Observable, of, throwError } from 'rxjs';

import {
  type IRolesClient,
  RolesProvider,
  type RequiredAccessRoleStatus,
} from '@equinor/fusion-framework-module-roles';
import { MemoryHistory } from '@equinor/fusion-framework-module-navigation/lib';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';
import {
  type ErrorElementProps,
  Link,
  Outlet,
  type RouteObject,
  Router,
  requireRoles,
  useLoaderData,
  useRequireRolesRecovery,
} from '@equinor/fusion-framework-react-router';

import { RoleErrorView } from './RoleErrorView';

type ActiveAssignments = ReturnType<IRolesClient['getActiveAccessRoleAssignments']>;

/**
 * Typed Roles V2 client double behind the real `RolesProvider`. Like the production client, reads
 * are cached until `refresh: true` or a successful activation.
 *
 * @param granted - Access-role names the account currently holds; activation appends to it.
 * @returns Client double.
 */
const createClient = (granted: string[]): IRolesClient => {
  let cache: string[] | undefined;
  const unused = (): Observable<never> => throwError(() => new Error('not used by this flow'));
  // The double answers with only the assignment id; the provider reads nothing else from it.
  const activate = (() =>
    defer(() => {
      granted.push('Reports.Read');
      // Activation invalidates read caches in the production client.
      cache = undefined;
      return of({ id: 'reports-reader' });
    })) as unknown as IRolesClient['activateClaimableRoleAssignment'];
  return {
    initialize: vi.fn(),
    getActiveAccessRoleAssignments: vi.fn((options?: { refresh?: boolean }) =>
      defer(() => {
        // Only a refresh or an invalidated cache observes the service's current grants.
        if (options?.refresh === true || !cache) {
          cache = [...granted];
        }
        // Every held role is a global assignment, the only kind role gates accept.
        const assignments = cache.map((accessRoleName) => ({
          systemName: 'Reports',
          accessRoleName,
          assignmentType: 'Global',
        }));
        // The double emits only the fields `hasAccessRole` reads, not full API assignments.
        return of(assignments) as ActiveAssignments;
      }),
    ) as IRolesClient['getActiveAccessRoleAssignments'],
    getRequiredAccessRoleStatuses: vi.fn((names: readonly string[]) => {
      // Every required role exists and has one claimable assignment for the activation UI.
      const statuses = names.map(
        (name): RequiredAccessRoleStatus => ({
          name,
          exists: true,
          claimableAssignments: [
            { assignmentId: 'reports-reader', name: 'reader', displayName: 'Reports reader' },
          ],
        }),
      );
      return of(statuses);
    }),
    activateClaimableRoleAssignment: vi.fn(activate),
    getConsolidatedClaimableRoleAssignments: vi.fn(unused),
    getConsolidatedRoleAssignments: vi.fn(unused),
    deactivateClaimableRoleAssignment: vi.fn(unused),
    hasClaimableRoleAssignmentForAccessRole: vi.fn(unused),
    getAccessRoles: vi.fn(unused),
  } as IRolesClient;
};

/**
 * Route error element composed as documented: the shipped `RoleErrorView` drives activation and
 * hands the route recovery's `retry` to `onRetry`.
 *
 * @param props - Route error.
 * @returns Recovery UI for role-gate denials, a plain message otherwise.
 */
const ErrorElement = ({ error }: ErrorElementProps) => {
  const recovery = useRequireRolesRecovery(error);
  // Only recoverable role-gate denials get the activation UI.
  if (recovery && error instanceof Error) {
    return (
      <>
        <RoleErrorView error={error} onRetry={recovery.retry} />
        <output>recovery:{recovery.status}</output>
      </>
    );
  }
  return <p>unrecoverable</p>;
};

describe('RoleErrorView with a requireRoles route gate', () => {
  afterEach(() => {
    cleanup();
  });

  it('recovers a denied navigation through the shipped activation UI', async () => {
    const client = createClient([]);
    const roles = new RolesProvider({ client });
    const history = new MemoryHistory();
    const loader = vi.fn(() => 'quarterly report');
    const routes: RouteObject[] = [
      {
        path: '/',
        errorElement: ErrorElement,
        Component: () => (
          <>
            <Link to="/reports">Open reports</Link>
            <Outlet />
          </>
        ),
        children: [
          { index: true, Component: () => <p>home</p> },
          {
            path: 'reports',
            middleware: [requireRoles(['Reports.Read'])],
            loader,
            Component: () => <h1>{useLoaderData() as string}</h1>,
          },
        ],
      },
    ];

    const screen = await render(
      <ModuleProvider value={{ navigation: { history, basename: '' }, roles }}>
        <Router routes={routes} />
      </ModuleProvider>,
    );
    await screen.getByRole('link', { name: 'Open reports' }).click();

    // The gate denied before the loader ran; the shipped UI explains how to recover.
    await expect.element(screen.getByRole('heading', { name: 'Access denied' })).toBeVisible();
    await expect.element(screen.getByText('recovery:idle')).toBeVisible();
    expect(loader).not.toHaveBeenCalled();
    // The view loads recovery details for the exact denied roles before offering activation.
    const claim = screen.getByRole('button', { name: 'Claim', exact: true });
    await expect.element(claim).toBeVisible();
    expect(client.getRequiredAccessRoleStatuses).toHaveBeenCalledWith(['Reports.Read']);

    await claim.click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();

    // Activation, a fresh `refresh: true` check, then exactly one retried navigation.
    await expect.element(screen.getByRole('heading', { name: 'quarterly report' })).toBeVisible();
    expect(client.activateClaimableRoleAssignment).toHaveBeenCalledOnce();
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledWith({ refresh: true });
    expect(loader).toHaveBeenCalledOnce();
    await expect
      .element(screen.getByRole('heading', { name: 'Access denied' }))
      .not.toBeInTheDocument();
    expect(history.location.pathname).toBe('/reports');
    roles.dispose();
  });
});
