import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';
import {
  RequiredAccessRolesError,
  RolesError,
} from '@equinor/fusion-framework-module-roles/errors';
import { requireRoles } from '../roles/require-roles.js';

type RolesMiddlewareArgs = Parameters<ReturnType<typeof requireRoles>>[0];

/**
 * Supplies only the public structural contract, without importing a router.
 * @param provider - Application's configured Roles provider.
 * @param signal - Cancellation signal for the operation.
 * @returns Middleware execution arguments.
 */
const createArgs = (
  provider: unknown,
  signal = new AbortController().signal,
): RolesMiddlewareArgs => ({ fusion: { modules: { roles: provider } }, signal });

describe('requireRoles middleware', () => {
  const hasAccessRole = vi.fn<IRolesProvider['hasAccessRole']>();
  const next = vi.fn<() => Promise<string>>();

  beforeEach(() => {
    hasAccessRole.mockReset().mockResolvedValue(true);
    next.mockReset().mockResolvedValue('downstream result');
  });

  it('requires all roles by default and preserves the downstream result', async () => {
    const result = await requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }), next);
    expect(hasAccessRole).toHaveBeenCalledExactlyOnceWith(['Reports.Read'], {
      required: true,
      assert: true,
    });
    expect(next).toHaveBeenCalledOnce();
    expect(result).toBe('downstream result');
  });

  it.each(['all', 'any'] as const)('delegates %s matching to the provider', async (mode) => {
    await requireRoles(['Reports.Read', 'Reports.Admin'], { mode })(
      createArgs({ hasAccessRole }),
      next,
    );
    expect(hasAccessRole).toHaveBeenCalledExactlyOnceWith(['Reports.Read', 'Reports.Admin'], {
      required: mode === 'all',
      assert: true,
    });
  });

  it('normalizes a snapshot of the declared names without changing case', async () => {
    const roles = [' Reports.Read ', 'Reports.Read', 'reports.read'];
    const middleware = requireRoles(roles);
    roles.push('Later.Role');
    await middleware(createArgs({ hasAccessRole }), next);
    expect(hasAccessRole.mock.calls[0]?.[0]).toEqual(['Reports.Read', 'reports.read']);
  });

  it('waits for access before continuing', async () => {
    hasAccessRole.mockImplementation(async () => {
      await Promise.resolve();
      expect(next).not.toHaveBeenCalled();
      return true;
    });
    await requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('preserves the native denial error and recovery information', async () => {
    const provider = {
      hasAccessRole,
      getRequiredAccessRoleStatuses: vi.fn<IRolesProvider['getRequiredAccessRoleStatuses']>(),
      activateClaimableRoleAssignment: vi.fn<IRolesProvider['activateClaimableRoleAssignment']>(),
    };
    const error = new RequiredAccessRolesError('Missing access', ['Reports.Read'], provider);
    hasAccessRole.mockRejectedValue(error);
    await expect(requireRoles(['Reports.Read'])(createArgs(provider), next)).rejects.toBe(error);
    expect(error.provider).toBe(provider);
    expect(next).not.toHaveBeenCalled();
  });

  it('propagates provider failures without interpreting them as access or denial', async () => {
    const error = new RolesError('Roles service unavailable');
    hasAccessRole.mockRejectedValue(error);
    await expect(requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }), next)).rejects.toBe(
      error,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('fails closed if a provider returns false instead of asserting', async () => {
    hasAccessRole.mockResolvedValue(false);
    await expect(
      requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }), next),
    ).rejects.toBeInstanceOf(RequiredAccessRolesError);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    { provider: undefined },
    { provider: null },
    { provider: {} },
    { provider: { hasAccessRole: false } },
  ])('rejects missing or unusable provider $provider', async ({ provider }) => {
    await expect(requireRoles(['Reports.Read'])(createArgs(provider), next)).rejects.toThrow(
      'Enable the Roles module',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('does not start a check for an already-cancelled operation', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }, controller.signal), next),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(hasAccessRole).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('does not continue when access is granted after cancellation', async () => {
    const controller = new AbortController();
    hasAccessRole.mockImplementation(async () => {
      controller.abort();
      return true;
    });
    await expect(
      requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }, controller.signal), next),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(next).not.toHaveBeenCalled();
  });

  it('composes parent and child requirements through the ordinary chain', async () => {
    const args = createArgs({ hasAccessRole });
    await requireRoles(['App.Access'])(args, () =>
      requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })(args, next),
    );
    expect(hasAccessRole.mock.calls.map(([, options]) => options?.required)).toEqual([true, false]);
    expect(next).toHaveBeenCalledOnce();
  });

  it('preserves downstream errors', async () => {
    const error = new Error('Loader failed');
    next.mockRejectedValue(error);
    await expect(requireRoles(['Reports.Read'])(createArgs({ hasAccessRole }), next)).rejects.toBe(
      error,
    );
  });

  it.each([
    { value: undefined },
    { value: null },
    { value: 'Reports.Read' },
    { value: [] },
    { value: [''] },
    { value: [' '] },
    { value: [123] },
  ])('rejects invalid role declarations $value', ({ value }) => {
    expect(() => Reflect.apply(requireRoles, undefined, [value])).toThrow(TypeError);
  });

  it.each([
    { value: null },
    { value: [] },
    { value: 'any' },
    { value: { mode: null } },
    { value: { mode: 'invalid' } },
  ])('rejects invalid options $value', ({ value }) => {
    expect(() => Reflect.apply(requireRoles, undefined, [['Reports.Read'], value])).toThrow(
      TypeError,
    );
  });
});
