import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';

import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import {
  enableRoles,
  type IRolesClient,
  RolesError,
  type RolesModule,
} from '@equinor/fusion-framework-module-roles';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { useHasAccessRole } from '../roles/useHasAccessRole';

/**
 * Creates an app-scoped Roles client test double.
 *
 * @returns Client with mockable role operations.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
  getActiveAccessRoleAssignments: vi.fn(() => of([])),
  getConsolidatedClaimableRoleAssignments: vi.fn(() => of([])),
  getConsolidatedRoleAssignments: vi.fn(() => of([])),
  activateClaimableRoleAssignment: vi.fn(() => of({ id: 'activation-id' })),
  deactivateClaimableRoleAssignment: vi.fn(() => of({ id: 'activation-id' })),
  hasClaimableRoleAssignmentForAccessRole: vi.fn(() => of(false)),
  getRequiredAccessRoleStatuses: vi.fn(() => of([])),
  getAccessRoles: vi.fn(),
});

/**
 * Creates app module configuration backed by a supplied Roles client.
 *
 * @param client - Roles client exposed to the hook through app module initialization.
 * @returns App configuration callback that enables the Roles module.
 */
const configureRolesClient = (client: IRolesClient): AppMockConfigureFn<[RolesModule]> => {
  return (configurator) => {
    enableRoles(configurator, (builder) => {
      builder.setClient(client);
    });
  };
};

describe('useHasAccessRole', () => {
  it('exposes initial loading and checks active assignments without querying claimable roles', async () => {
    const client = createClient();
    const activeAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(activeAssignments);

    const { result, unmount } = await renderAppHook(
      () => useHasAccessRole(['Reports.Read', 'Reports.Export'], { required: false }),
      { configure: configureRolesClient(client) },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasAccessRole).toBeUndefined();

    await act(async () => {
      activeAssignments.next([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Global',
        },
      ]);
      activeAssignments.complete();
    });

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce();
    expect(client.hasClaimableRoleAssignmentForAccessRole).not.toHaveBeenCalled();

    await unmount();
  });

  it('supports explicit any-role and all-role semantics', async () => {
    const client = createClient();
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(
      of([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Global',
        },
      ]),
    );

    const { result, rerender, unmount } = await renderAppHook(
      ({ required }) =>
        useHasAccessRole(['Reports.Read', 'Reports.Export'], {
          required,
        }),
      {
        initialProps: { required: false },
        configure: configureRolesClient(client),
      },
    );

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBe(true);

    await rerender({ required: true });
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBe(false);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);

    await unmount();
  });

  it('surfaces active-assignment failures without producing an access result', async () => {
    const client = createClient();
    const error = new Error('active assignments failed');
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(throwError(() => error));

    const { result, unmount } = await renderAppHook(
      () => useHasAccessRole(['Reports.Read'], { required: false }),
      { configure: configureRolesClient(client) },
    );

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(RolesError);
    expect(result.current.error).toMatchObject({ cause: error });

    await unmount();
  });

  it('refreshes active access while preserving the current result', async () => {
    const client = createClient();
    const refreshedAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    vi.mocked(client.getActiveAccessRoleAssignments)
      .mockReturnValueOnce(of([]))
      .mockReturnValueOnce(refreshedAssignments);

    const { result, unmount } = await renderAppHook(
      () => useHasAccessRole(['Reports.Read'], { required: false }),
      { configure: configureRolesClient(client) },
    );
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBe(false);

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasAccessRole).toBe(false);

    await act(async () => {
      refreshedAssignments.next([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Global',
        },
      ]);
      refreshedAssignments.complete();
      await refreshPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasAccessRole).toBe(true);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);
    expect(client.hasClaimableRoleAssignmentForAccessRole).not.toHaveBeenCalled();

    await unmount();
  });

  it('does not publish a stale result after role inputs change', async () => {
    const client = createClient();
    const staleAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    const currentAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    vi.mocked(client.getActiveAccessRoleAssignments)
      .mockReturnValueOnce(staleAssignments)
      .mockReturnValueOnce(currentAssignments);

    const { result, rerender, unmount } = await renderAppHook(
      (accessRoleNames) => useHasAccessRole(accessRoleNames, { required: false }),
      {
        initialProps: ['Reports.Read'],
        configure: configureRolesClient(client),
      },
    );
    await vi.waitFor(() => expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce());

    await rerender(['Reports.Export']);
    expect(result.current.hasAccessRole).toBeUndefined();
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      currentAssignments.next([]);
      currentAssignments.complete();
    });

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasAccessRole).toBe(false);

    await act(async () => {
      staleAssignments.next([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Global',
        },
      ]);
      staleAssignments.complete();
    });

    expect(result.current.hasAccessRole).toBe(false);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);

    await unmount();
  });

  it('does not let a retained refresh for old inputs affect the current check', async () => {
    const client = createClient();
    const initialAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    const changedInputAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    const retainedRefreshAssignments = new Subject<
      Array<{ systemName: string; accessRoleName: string; assignmentType: 'Global' }>
    >();
    vi.mocked(client.getActiveAccessRoleAssignments)
      .mockReturnValueOnce(initialAssignments)
      .mockReturnValueOnce(changedInputAssignments)
      .mockReturnValueOnce(retainedRefreshAssignments);

    const { result, rerender, unmount } = await renderAppHook(
      ({ accessRoleNames, required }) => useHasAccessRole(accessRoleNames, { required }),
      {
        initialProps: {
          accessRoleNames: ['Reports.Read'],
          required: false,
        },
        configure: configureRolesClient(client),
      },
    );
    await vi.waitFor(() => expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce());
    const retainedRefresh = result.current.refresh;

    await rerender({
      accessRoleNames: ['Reports.Export', 'Reports.Admin'],
      required: true,
    });
    await vi.waitFor(() => expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2));

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = retainedRefresh();
    });
    await vi.waitFor(() => expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(3));

    await act(async () => {
      retainedRefreshAssignments.next([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Export',
          assignmentType: 'Global',
        },
      ]);
      retainedRefreshAssignments.complete();
      await refreshPromise;
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasAccessRole).toBeUndefined();

    await act(async () => {
      changedInputAssignments.next([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Export',
          assignmentType: 'Global',
        },
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Admin',
          assignmentType: 'Global',
        },
      ]);
      changedInputAssignments.complete();
      initialAssignments.complete();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasAccessRole).toBe(true);

    await unmount();
  });

  it('does not recheck when a new array has the same role names', async () => {
    const client = createClient();

    const { result, rerender, unmount } = await renderAppHook(
      (accessRoleNames) => useHasAccessRole(accessRoleNames, { required: false }),
      {
        initialProps: ['Reports.Read'],
        configure: configureRolesClient(client),
      },
    );
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    await rerender(['Reports.Read']);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce();

    await unmount();
  });
});
