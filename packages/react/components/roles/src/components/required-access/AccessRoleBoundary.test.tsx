import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

import { RequiredAccessRolesError } from '@equinor/fusion-framework-module-roles';

import { AccessRoleBoundary } from './AccessRoleBoundary';

const mocks = vi.hoisted(() => ({
  hasAccessRole: vi.fn(),
  getRequiredAccessRoleStatuses: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  roles: {
    hasAccessRole: vi.fn(),
  },
}));

vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModule: () => mocks.roles,
}));

/**
 * Exposes child state and mount effects to detect transient access-gate remounts.
 * @param props - Observer for protected mount effects.
 * @returns A stateful protected control.
 */
const ProtectedCounter = ({ onMount }: { onMount: VoidFunction }): ReactNode => {
  const [count, setCount] = useState(0);
  useEffect(onMount, [onMount]);
  return (
    <button type="button" onClick={() => setCount((previous) => previous + 1)}>
      Count {count}
    </button>
  );
};

describe('AccessRoleBoundary', () => {
  beforeEach(() => {
    mocks.hasAccessRole.mockReset();
    mocks.roles.hasAccessRole = mocks.hasAccessRole;
    mocks.getRequiredAccessRoleStatuses.mockReset();
    mocks.activateClaimableRoleAssignment.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children after every required role is active', async () => {
    mocks.hasAccessRole.mockResolvedValue(true);
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read', 'Reports.Export']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );

    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.hasAccessRole).toHaveBeenCalledWith(['Reports.Read', 'Reports.Export'], {
      required: true,
      assert: true,
    });
  });

  it('preserves child state and mounts across equivalent inline requirement arrays', async () => {
    mocks.hasAccessRole.mockResolvedValue(true);
    const onMount = vi.fn();
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read', 'Reports.Export']}>
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await screen.getByRole('button', { name: 'Count 0' }).click();
    await screen.rerender(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read', 'Reports.Export']}>
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    await screen.rerender(
      <AccessRoleBoundary
        requiredAccessRoles={[' Reports.Export ', 'Reports.Read', 'Reports.Read', '']}
      >
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.hasAccessRole).toHaveBeenCalledOnce();
  });

  it('treats empty and blank-only requirement arrays as the same ungated subtree', async () => {
    const onMount = vi.fn();
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={[]}>
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await screen.getByRole('button', { name: 'Count 0' }).click();
    await screen.rerender(
      <AccessRoleBoundary requiredAccessRoles={[' ', '']}>
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.hasAccessRole).not.toHaveBeenCalled();
  });

  it('routes a synchronous provider failure into recovery without mounting children', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      { name: 'Reports.Read', exists: false, claimableAssignments: [] },
    ]);
    mocks.hasAccessRole.mockImplementation(() => {
      throw new RequiredAccessRolesError('Denied', ['Reports.Read'], {
        getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
        activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
      });
    });
    const onMount = vi.fn();
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <ProtectedCounter onMount={onMount} />
      </AccessRoleBoundary>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Access role does not exist' }))
      .toBeVisible();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('rechecks a denied boundary when the module provider is replaced', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      { name: 'Reports.Read', exists: false, claimableAssignments: [] },
    ]);
    mocks.hasAccessRole.mockRejectedValue(
      new RequiredAccessRolesError('Denied', ['Reports.Read'], {
        getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
        activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
      }),
    );
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Access role does not exist' }))
      .toBeVisible();
    const replacementCheck = Promise.withResolvers<boolean>();
    mocks.roles = { hasAccessRole: vi.fn().mockReturnValue(replacementCheck.promise) };
    await screen.rerender(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
    replacementCheck.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.roles.hasAccessRole).toHaveBeenCalledOnce();
    expect(mocks.activateClaimableRoleAssignment).not.toHaveBeenCalled();
  });

  it('keeps an in-flight check when an equivalent inline array replaces its input', async () => {
    const checked = Promise.withResolvers<boolean>();
    mocks.hasAccessRole.mockReturnValue(checked.promise);
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );
    await screen.rerender(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );
    checked.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.hasAccessRole).toHaveBeenCalledOnce();
  });

  it.each(['requirements', 'provider'] as const)(
    'never commits protected effects when the changed %s is denied',
    async (change) => {
      mocks.hasAccessRole.mockResolvedValue(true);
      const screen = await render(
        <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
          <p>Protected reports</p>
        </AccessRoleBoundary>,
      );
      await expect.element(screen.getByText('Protected reports')).toBeVisible();
      const checked = Promise.withResolvers<boolean>();
      // The access result belongs to the provider object, not merely its method or role names.
      if (change === 'provider') {
        mocks.roles = { hasAccessRole: vi.fn().mockReturnValue(checked.promise) };
      } else {
        mocks.hasAccessRole.mockReturnValue(checked.promise);
      }
      const onMount = vi.fn();
      const onLayout = vi.fn();
      /** Detects even a single unauthorized commit before passive effect cleanup. */
      const DeniedChild = (): ReactNode => {
        useLayoutEffect(onLayout, []);
        useEffect(onMount, []);
        return <p>Unchecked content</p>;
      };
      await screen.rerender(
        <AccessRoleBoundary
          requiredAccessRoles={[change === 'provider' ? 'Reports.Read' : 'Reports.Export']}
        >
          <DeniedChild />
        </AccessRoleBoundary>,
      );
      mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
        { name: 'Reports.Export', exists: true, claimableAssignments: [] },
      ]);
      checked.reject(
        new RequiredAccessRolesError('Denied', ['Reports.Export'], {
          getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
          activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
        }),
      );
      await expect
        .element(screen.getByRole('heading', { name: 'Access role is not claimable' }))
        .toBeVisible();
      expect(onLayout).not.toHaveBeenCalled();
      expect(onMount).not.toHaveBeenCalled();
      await expect.element(screen.getByText('Unchecked content')).not.toBeInTheDocument();
    },
  );

  it.each(['requirements', 'provider'] as const)(
    'does not mount unchecked children when the %s changes after success',
    async (change) => {
      const required = ['Reports.Read'];
      mocks.hasAccessRole.mockResolvedValue(true);
      const screen = await render(
        <AccessRoleBoundary requiredAccessRoles={required}>
          <p>Protected reports</p>
        </AccessRoleBoundary>,
      );
      await expect.element(screen.getByText('Protected reports')).toBeVisible();

      const checked = Promise.withResolvers<boolean>();
      const hasAccessRole = vi.fn().mockReturnValue(checked.promise);
      // A different provider object must invalidate access even with unchanged role names.
      if (change === 'provider') {
        mocks.roles = { hasAccessRole };
      } else {
        mocks.hasAccessRole.mockReturnValue(checked.promise);
      }
      const onMount = vi.fn();
      /** Records protected side effects, including any unauthorized transient mount. */
      const ProtectedChild = (): ReactNode => {
        useEffect(onMount, []);
        return <p>New protected content</p>;
      };
      await screen.rerender(
        <AccessRoleBoundary
          requiredAccessRoles={change === 'requirements' ? ['Reports.Export'] : required}
        >
          <ProtectedChild />
        </AccessRoleBoundary>,
      );

      expect(onMount).not.toHaveBeenCalled();
      await expect.element(screen.getByText('New protected content')).not.toBeInTheDocument();
      checked.resolve(true);
      await expect.element(screen.getByText('New protected content')).toBeVisible();
      expect(onMount).toHaveBeenCalledOnce();
    },
  );

  it('ignores an obsolete check that settles after the requirements change', async () => {
    const previous = Promise.withResolvers<boolean>();
    const current = Promise.withResolvers<boolean>();
    mocks.hasAccessRole.mockReturnValueOnce(previous.promise).mockReturnValueOnce(current.promise);
    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );
    await screen.rerender(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Export']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );

    previous.resolve(true);
    await previous.promise;
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
    current.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
  });

  it('renders role recovery when required access is missing', async () => {
    const provider = {
      getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
      activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
    };
    mocks.hasAccessRole.mockRejectedValue(
      new RequiredAccessRolesError('Missing required role.', ['Reports.Read'], provider),
    );
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Read',
        description: 'Read reports.',
        exists: true,
        claimableAssignments: [],
      },
    ]);

    const screen = await render(
      <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
        <p>Protected reports</p>
      </AccessRoleBoundary>,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Access role is not claimable' }))
      .toBeVisible();
    await expect.element(screen.getByText('Read reports.')).toBeVisible();
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
  });

  it('catches a required-role error from children when no proactive requirement is configured', async () => {
    const provider = {
      getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
      activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
    };
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Read',
        description: 'Read reports.',
        exists: true,
        claimableAssignments: [],
      },
    ]);
    const ThrowRequiredRoleError = (): ReactNode => {
      throw new RequiredAccessRolesError('Missing required role.', ['Reports.Read'], provider);
    };

    const screen = await render(
      <AccessRoleBoundary>
        <ThrowRequiredRoleError />
      </AccessRoleBoundary>,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Access role is not claimable' }))
      .toBeVisible();
    expect(mocks.hasAccessRole).not.toHaveBeenCalled();
  });
});
