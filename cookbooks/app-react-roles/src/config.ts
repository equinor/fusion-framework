import { enableRoles, type RolesModule } from '@equinor/fusion-framework-module-roles';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Configures Roles V2 and denies app initialization unless the required access role is active.
 *
 * Replace `Reports.Read` with an access-role name assigned by the application registration.
 *
 * @param configurator - App configurator receiving the Roles module.
 */
export const configure: AppModuleInitiator<[RolesModule]> = (configurator): void => {
  enableRoles(configurator, (builder) => {
    builder.requireRoles(['Reports.Read']);
  });
};

export default configure;
