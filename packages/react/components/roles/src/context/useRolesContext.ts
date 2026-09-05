import { useContext } from 'react';

import { RolesContext, type RolesContextValue } from './roles-context';

/**
 * Reads shared Roles V2 state from the nearest roles context provider.
 *
 * @returns Shared role collections and actions.
 * @throws When called outside a `RolesProvider`.
 */
export const useRolesContext = (): RolesContextValue => {
  const context = useContext(RolesContext);
  // Hooks must fail clearly when application setup omitted the provider.
  if (!context) {
    throw new Error('Roles hooks must be used within a RolesProvider.');
  }
  return context;
};
