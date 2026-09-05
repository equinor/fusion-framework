import { enableRoles, type RolesModule } from '@equinor/fusion-framework-module-roles';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Configures Roles V2 with an access role granted by multiple claimable roles.
 *
 * @param configurator - App configurator receiving the Roles module.
 */
export const configure: AppModuleInitiator<[RolesModule]> = (configurator): void => {
  enableRoles(configurator, (builder) => {
    builder.requireRoles(['ProView.Admin.DevOps']);
  });
};

export default configure;
