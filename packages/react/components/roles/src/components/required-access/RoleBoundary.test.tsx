import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

import { RequiredRolesError } from '@equinor/fusion-framework-module-roles';

import { RoleBoundary } from './RoleBoundary';

const mocks = vi.hoisted(() => ({
  hasRole: vi.fn(),
  getRequiredRoleStatuses: vi.fn(),
  claimRole: vi.fn(),
  roles: {
    hasRole: vi.fn(),
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

describe('RoleBoundary', () => {
  beforeEach(() => {
    mocks.hasRole.mockReset();
    mocks.roles.hasRole = mocks.hasRole;
    mocks.getRequiredRoleStatuses.mockReset();
    mocks.claimRole.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children after every required role is active', async () => {
    mocks.hasRole.mockResolvedValue(true);
    const screen = await render(
      <RoleBoundary required={['Reports.Read', 'Reports.Export']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );

    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.hasRole).toHaveBeenCalledWith(['Reports.Read', 'Reports.Export'], {
      required: true,
      assert: true,
    });
  });

  it('preserves child state and mounts across equivalent inline requirement arrays', async () => {
    mocks.hasRole.mockResolvedValue(true);
    const onMount = vi.fn();
    const screen = await render(
      <RoleBoundary required={['Reports.Read', 'Reports.Export']}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await screen.getByRole('button', { name: 'Count 0' }).click();
    await screen.rerender(
      <RoleBoundary required={['Reports.Read', 'Reports.Export']}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    await screen.rerender(
      <RoleBoundary required={[' Reports.Export ', 'Reports.Read', 'Reports.Read', '']}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.hasRole).toHaveBeenCalledOnce();
  });

  it('treats empty and blank-only requirement arrays as the same ungated subtree', async () => {
    const onMount = vi.fn();
    const screen = await render(
      <RoleBoundary required={[]}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await screen.getByRole('button', { name: 'Count 0' }).click();
    await screen.rerender(
      <RoleBoundary required={[' ', '']}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await expect.element(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.hasRole).not.toHaveBeenCalled();
  });

  it('routes a synchronous provider failure into recovery without mounting children', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      { name: 'Reports.Read', exists: false, claims: [] },
    ]);
    mocks.hasRole.mockImplementation(() => {
      throw new RequiredRolesError('Denied', ['Reports.Read'], {
        getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
        claimRole: mocks.claimRole,
      });
    });
    const onMount = vi.fn();
    const screen = await render(
      <RoleBoundary required={['Reports.Read']}>
        <ProtectedCounter onMount={onMount} />
      </RoleBoundary>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Role does not exist' }))
      .toBeVisible();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('rechecks a denied boundary when the module provider is replaced', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      { name: 'Reports.Read', exists: false, claims: [] },
    ]);
    mocks.hasRole.mockRejectedValue(
      new RequiredRolesError('Denied', ['Reports.Read'], {
        getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
        claimRole: mocks.claimRole,
      }),
    );
    const screen = await render(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Role does not exist' }))
      .toBeVisible();
    const replacementCheck = Promise.withResolvers<boolean>();
    mocks.roles = { hasRole: vi.fn().mockReturnValue(replacementCheck.promise) };
    await screen.rerender(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
    replacementCheck.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.roles.hasRole).toHaveBeenCalledOnce();
    expect(mocks.claimRole).not.toHaveBeenCalled();
  });

  it('keeps an in-flight check when an equivalent inline array replaces its input', async () => {
    const checked = Promise.withResolvers<boolean>();
    mocks.hasRole.mockReturnValue(checked.promise);
    const screen = await render(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );
    await screen.rerender(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );
    checked.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
    expect(mocks.hasRole).toHaveBeenCalledOnce();
  });

  it.each(['requirements', 'provider'] as const)(
    'never commits protected effects when the changed %s is denied',
    async (change) => {
      mocks.hasRole.mockResolvedValue(true);
      const screen = await render(
        <RoleBoundary required={['Reports.Read']}>
          <p>Protected reports</p>
        </RoleBoundary>,
      );
      await expect.element(screen.getByText('Protected reports')).toBeVisible();
      const checked = Promise.withResolvers<boolean>();
      // The access result belongs to the provider object, not merely its method or role names.
      if (change === 'provider') {
        mocks.roles = { hasRole: vi.fn().mockReturnValue(checked.promise) };
      } else {
        mocks.hasRole.mockReturnValue(checked.promise);
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
        <RoleBoundary required={[change === 'provider' ? 'Reports.Read' : 'Reports.Export']}>
          <DeniedChild />
        </RoleBoundary>,
      );
      mocks.getRequiredRoleStatuses.mockResolvedValue([
        { name: 'Reports.Export', exists: true, claims: [] },
      ]);
      checked.reject(
        new RequiredRolesError('Denied', ['Reports.Export'], {
          getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
          claimRole: mocks.claimRole,
        }),
      );
      await expect
        .element(screen.getByRole('heading', { name: 'Role is not claimable' }))
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
      mocks.hasRole.mockResolvedValue(true);
      const screen = await render(
        <RoleBoundary required={required}>
          <p>Protected reports</p>
        </RoleBoundary>,
      );
      await expect.element(screen.getByText('Protected reports')).toBeVisible();

      const checked = Promise.withResolvers<boolean>();
      const hasRole = vi.fn().mockReturnValue(checked.promise);
      // A different provider object must invalidate access even with unchanged role names.
      if (change === 'provider') {
        mocks.roles = { hasRole };
      } else {
        mocks.hasRole.mockReturnValue(checked.promise);
      }
      const onMount = vi.fn();
      /** Records protected side effects, including any unauthorized transient mount. */
      const ProtectedChild = (): ReactNode => {
        useEffect(onMount, []);
        return <p>New protected content</p>;
      };
      await screen.rerender(
        <RoleBoundary required={change === 'requirements' ? ['Reports.Export'] : required}>
          <ProtectedChild />
        </RoleBoundary>,
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
    mocks.hasRole.mockReturnValueOnce(previous.promise).mockReturnValueOnce(current.promise);
    const screen = await render(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );
    await screen.rerender(
      <RoleBoundary required={['Reports.Export']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );

    previous.resolve(true);
    await previous.promise;
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
    current.resolve(true);
    await expect.element(screen.getByText('Protected reports')).toBeVisible();
  });

  it('renders role recovery when required access is missing', async () => {
    const provider = {
      getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
      claimRole: mocks.claimRole,
    };
    mocks.hasRole.mockRejectedValue(
      new RequiredRolesError('Missing required role.', ['Reports.Read'], provider),
    );
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Read',
        description: 'Read reports.',
        exists: true,
        claims: [],
      },
    ]);

    const screen = await render(
      <RoleBoundary required={['Reports.Read']}>
        <p>Protected reports</p>
      </RoleBoundary>,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Role is not claimable' }))
      .toBeVisible();
    await expect.element(screen.getByText('Read reports.')).toBeVisible();
    await expect.element(screen.getByText('Protected reports')).not.toBeInTheDocument();
  });

  it('catches a required-role error from children when no proactive requirement is configured', async () => {
    const provider = {
      getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
      claimRole: mocks.claimRole,
    };
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Read',
        description: 'Read reports.',
        exists: true,
        claims: [],
      },
    ]);
    const ThrowRequiredRoleError = (): ReactNode => {
      throw new RequiredRolesError('Missing required role.', ['Reports.Read'], provider);
    };

    const screen = await render(
      <RoleBoundary>
        <ThrowRequiredRoleError />
      </RoleBoundary>,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Role is not claimable' }))
      .toBeVisible();
    expect(mocks.hasRole).not.toHaveBeenCalled();
  });
});
