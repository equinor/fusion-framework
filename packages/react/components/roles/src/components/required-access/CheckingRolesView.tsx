import type { ReactNode } from 'react';

/**
 * Displays progress while required-role availability is resolved.
 *
 * @returns The required-role loading state.
 */
export const CheckingRolesView = (): ReactNode => (
  <div>
    <h2>Access denied</h2>
    <p>Checking required role availability...</p>
  </div>
);
