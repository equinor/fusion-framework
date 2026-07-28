import type { AccountInfo } from '@equinor/fusion-framework-module-msal';
import { useFramework } from '../useFramework';

/**
 * React hook that returns the currently authenticated user's account info.
 *
 * @returns The {@link AccountInfo} of the signed-in user, or `undefined` if
 *   no user is authenticated.
 *
 * @example
 * ```tsx
 * const UserGreeting = () => {
 *   const user = useCurrentUser();
 *   return <span>Hello, {user?.name ?? 'Guest'}</span>;
 * };
 * ```
 */
export const useCurrentUser = (): AccountInfo | undefined => {
  const framework = useFramework();
  return framework.modules.auth.account || undefined;
};
