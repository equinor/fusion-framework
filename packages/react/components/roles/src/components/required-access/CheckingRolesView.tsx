import type { ReactNode } from 'react';
import { Typography } from '@equinor/eds-core-react';

/**
 * Displays progress while required-access-role availability is resolved.
 *
 * @returns The required-access-role loading state.
 */
export const CheckingRolesView = (): ReactNode => (
  <div>
    <Typography group="heading" variant="h2">
      Access denied
    </Typography>
    <Typography>Checking required access-role availability...</Typography>
  </div>
);
