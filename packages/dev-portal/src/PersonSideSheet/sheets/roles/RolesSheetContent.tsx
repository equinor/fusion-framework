import type { ReactElement } from 'react';

import { Button, Divider, Icon } from '@equinor/eds-core-react';
import { arrow_back, verified_user } from '@equinor/eds-icons';
import { RolesProvider, RolesView } from '@equinor/fusion-framework-react-components-roles';

import type { SheetContentProps } from '../types';

Icon.add({ arrow_back, verified_user });

/**
 * Hosts the shared Roles V2 overview inside the person side sheet.
 *
 * @param props.navigate - Navigates back to the person side sheet landing page.
 * @returns Portal navigation chrome around the shared Roles component.
 */
export const RolesSheetContent = ({ navigate }: SheetContentProps): ReactElement => (
  <section>
    <Button variant="ghost" onClick={() => navigate()}>
      <Icon name="arrow_back" />
      <Icon name="verified_user" />
      My Roles
    </Button>
    <Divider />
    <RolesProvider>
      <RolesView compact />
    </RolesProvider>
  </section>
);
