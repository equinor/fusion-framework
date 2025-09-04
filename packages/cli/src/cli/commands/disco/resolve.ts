import { createCommand } from 'commander';

import { ConsoleLogger, initializeFramework } from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

/**
 * The `resolve` command resolves and displays information about a service registered in Fusion service discovery.
 *
 * This command looks up a service by name and prints its discovery details using the current authentication and environment.
 *
 * Supports environment selection and authentication options.
 *
 * @command resolve
 * @description Resolve and display information about a service registered in Fusion service discovery.
 * @param {string} service - Name of the service to resolve in Fusion service discovery.
 * @option {string} --env - Environment to use (e.g., prod, test).
 * @option {string} --token - Authentication token.
 * @option {string} --tenantId - Tenant ID for authentication.
 * @option {string} --clientId - Client ID for authentication.
 * @returns {Promise<void>} Prints the resolved service details to the console.
 */
const command = withAuthOptions(
  createCommand('resolve')
    .description(
      'Resolve and display information about a service registered in Fusion service discovery.',
    )
    .addHelpText(
      'after',
      [
        '',
        'This command looks up a service by name and prints its discovery details using the current authentication and environment.',
        '',
        'USEFUL FOR:',
        '  - Finding service endpoints for API calls',
        '  - Debugging service connectivity issues',
        '  - Getting service metadata and configuration',
        '',
        'OUTPUT FORMATS:',
        '  - Normal: Pretty-printed JSON with service details',
        '  - Silent: Raw JSON only (useful for scripts: --silent | jq ".uri")',
        '',
        'Examples:',
        '  $ ffc disco resolve my-service',
        '  $ ffc disco resolve my-service --silent | jq ".uri"',
        '  $ ffc disco resolve my-service --env prod',
        '  $ ffc disco resolve my-service --env test --tenantId my-tenant --clientId my-client-id',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option('--silent', 'Silent mode, suppresses output except errors')
    .argument('<service>', 'Name of the service to resolve in Fusion service discovery')
    .action(async (service: string, options) => {
      const log = options.silent ? null : new ConsoleLogger('disco:resolve');

      log?.start('Initializing Fusion Framework...');
      const framework = await initializeFramework({
        env: options.environment,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log?.succeed('Initialized Fusion Framework');

      log?.start(`Resolving service ${service}...`);
      const appClient = await framework.serviceDiscovery.resolveService(service);
      log?.succeed(`Resolved service ${service}`);

      log?.debug(appClient);
      if (options.silent) {
        console.log(JSON.stringify(appClient, null, 2));
      }
    }),
);

export default command;
