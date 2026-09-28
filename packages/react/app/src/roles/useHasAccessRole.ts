import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  HasAccessRoleOptions,
  IRolesProvider,
  RolesModule,
} from '@equinor/fusion-framework-module-roles';

import { useAppModule } from '../useAppModule';

/** Options for selecting any-role or all-role active access checks. */
export type UseHasAccessRoleOptions = Pick<HasAccessRoleOptions, 'required'>;

/**
 * Active access-role state returned by {@link useHasAccessRole}.
 */
export interface UseHasAccessRoleResult {
  /** Whether the current any-role or all-role condition is satisfied. */
  hasAccessRole: boolean | undefined;
  /** Whether the initial check or an explicit refresh is running. */
  isLoading: boolean;
  /** Error from the latest active access-role check. */
  error: unknown;
  /** Re-runs the active access-role check for the current provider and inputs. */
  refresh: () => Promise<void>;
}

interface HasAccessRoleState {
  provider: IRolesProvider | undefined;
  inputKey: string | undefined;
  hasAccessRole: boolean | undefined;
  isLoading: boolean;
  error: unknown;
}

interface HasAccessRoleRequest {
  provider: IRolesProvider;
  accessRoleNames: readonly string[];
  required: boolean;
  inputKey: string;
}

/**
 * Checks whether any or all requested Roles V2 access roles are currently active.
 *
 * The hook calls only {@link IRolesProvider.hasAccessRole}; it does not load claimable-role
 * assignments or expose activation actions. Use `useAccessRole` when the UI also needs to discover
 * and activate a claimable role assignment.
 *
 * Role names follow the provider's exact, case-sensitive matching semantics. Set `required` to
 * `true` to require every role, or leave it `false` to accept any role. Empty lists preserve the
 * provider identities: all-role checks resolve to `true`, while any-role checks resolve to `false`.
 *
 * @param accessRoleNames - Exact Roles V2 access-role names to check.
 * @param options - Selects all-role (`required: true`) or any-role (`required: false`) matching.
 * @returns Active access state with initial loading, refresh, and error handling.
 * @throws The function returned as `refresh` rethrows Roles V2 failures after updating `error`.
 *
 * @example
 * ```tsx
 * const access = useHasAccessRole(['Reports.Read', 'Reports.Export'], { required: false });
 *
 * if (access.isLoading) return <Spinner />;
 * if (access.error) return <ErrorMessage error={access.error} />;
 * return access.hasAccessRole ? <Reports /> : <NoAccess />;
 * ```
 */
export const useHasAccessRole = (
  accessRoleNames: readonly string[],
  options: UseHasAccessRoleOptions = {},
): UseHasAccessRoleResult => {
  const roles = useAppModule<RolesModule>('roles');
  const required = options.required === true;
  // Array identity is unstable for inline hook arguments; content controls the request lifecycle.
  const inputKey = JSON.stringify([accessRoleNames, required]);
  const currentRequestRef = useRef<HasAccessRoleRequest>({
    provider: roles,
    accessRoleNames,
    required,
    inputKey,
  });
  currentRequestRef.current = {
    provider: roles,
    accessRoleNames,
    required,
    inputKey,
  };
  const mountedRef = useRef(false);
  const requestRef = useRef(0);
  const [state, setState] = useState<HasAccessRoleState>({
    provider: undefined,
    inputKey: undefined,
    hasAccessRole: undefined,
    isLoading: true,
    error: undefined,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  /**
   * Refreshes the active-only access result for the current provider and hook inputs.
   *
   * @returns A promise that resolves when the current check completes.
   * @throws {RolesError} When the Roles V2 active-assignment request fails.
   */
  const refresh = useCallback(async (): Promise<void> => {
    const request = currentRequestRef.current;
    const requestId = ++requestRef.current;
    // Preserve a resolved value only when refreshing the same provider and inputs.
    if (mountedRef.current) {
      setState((current) => ({
        provider: request.provider,
        inputKey: request.inputKey,
        hasAccessRole:
          current.provider === request.provider && current.inputKey === request.inputKey
            ? current.hasAccessRole
            : undefined,
        isLoading: true,
        error: undefined,
      }));
    }
    try {
      const hasAccessRole = await request.provider.hasAccessRole([...request.accessRoleNames], {
        required: request.required,
      });
      // Superseded checks must not publish access for an earlier account, provider, or role input.
      if (mountedRef.current && requestRef.current === requestId) {
        setState({
          provider: request.provider,
          inputKey: request.inputKey,
          hasAccessRole,
          isLoading: false,
          error: undefined,
        });
      }
    } catch (error) {
      // Expose the latest failure without allowing an obsolete request to replace current state.
      if (mountedRef.current && requestRef.current === requestId) {
        setState((current) => ({
          provider: request.provider,
          inputKey: request.inputKey,
          hasAccessRole:
            current.provider === request.provider && current.inputKey === request.inputKey
              ? current.hasAccessRole
              : undefined,
          isLoading: false,
          error,
        }));
      }
      throw error;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: provider and input key trigger the stable refresh with its current descriptor.
  useEffect(() => {
    // Effects cannot return promises; the hook exposes automatic failures through `error`.
    void refresh().catch(() => undefined);
  }, [inputKey, refresh, roles]);

  const stateMatchesCurrentInput = state.provider === roles && state.inputKey === inputKey;

  return {
    hasAccessRole: stateMatchesCurrentInput ? state.hasAccessRole : undefined,
    isLoading: stateMatchesCurrentInput ? state.isLoading : true,
    error: stateMatchesCurrentInput ? state.error : undefined,
    refresh,
  };
};
