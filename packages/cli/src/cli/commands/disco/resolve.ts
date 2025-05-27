/**
 * The `resolve` command resolves and displays information about a service registered in Fusion service discovery.
 *
 * This command looks up a service by name and prints its discovery details using the current authentication and environment.
 *
 * Supports environment selection and authentication options.
 *
 * ## Examples
 *
 * ```sh
 * $ fusion resolve my-service
 * $ fusion resolve my-service --env prod
 * ```
 *
 * @command resolve
 * @description Resolve and display information about a service registered in Fusion service discovery.
 * @argument {string} service - Name of the service to resolve in Fusion service discovery.
 * @option {string} --env - Environment to use (e.g., prod, test).
 * @option {string} --token - Authentication token.
 * @option {string} --tenantId - Tenant ID for authentication.
 * @option {string} --clientId - Client ID for authentication.
 * @returns {Promise<void>} Prints the resolved service details to the console.
 */

import { createCommand } from 'commander';

import { ConsoleLogger } from '../../../bin/utils';

import { initializeFramework } from '../../../lib/framework.node.js';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env';

const command = withAuthOptions(
  createCommand('resolve')
    .description(
      [
        'Resolve and display information about a service registered in Fusion service discovery.',
        '',
        'This command looks up a service by name and prints its discovery details using the current authentication and environment.',
        'Supports environment selection and authentication options.',
        '',
        'Examples:',
        '  $ fusion resolve my-service',
        '  $ fusion resolve my-service --env prod',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .argument('<service>', 'Name of the service to resolve in Fusion service discovery')
    .action(async (service: string, options) => {
      const log = new ConsoleLogger('disco:resolve');

      log.start('Initializing Fusion Framework...');
      console.log('Options:', options);
      const framework = await initializeFramework({
        env: options.environment,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log.succeed('Initialized Fusion Framework');

      log.start(`Resolving service ${service}...`);
      const appClient = await framework.serviceDiscovery.resolveService(service);
      log.succeed(`Resolved service ${service}`);

      console.debug(appClient);
    }),
);

export default command;
