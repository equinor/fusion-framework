import { createCommand } from 'commander';

import { stdout } from 'node:process';

import chalk from 'chalk';

import {
  ConsoleLogger,
  generatePortalConfig,
  publishPortalConfig,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `portal config`
 *
 * Generates and/or publishes the portal configuration for Fusion portals.
 *
 * Features:
 * - Outputs the generated config to stdout or a file.
 * - Use --publish to upload the config to the Fusion portal registry.
 * - Options [token, tenant, client, config, identifier, env, output] are only relevant when --publish is used.
 * - Option [--env] cannot be set to dev when --publish is used.
 *
 * Usage:
 *   $ fusion-framework-cli portal config --identifier <portal@version> [options]
 *
 * Options:
 *   --debug                      Enable debug mode for verbose logging
 *   --silent                     Silent mode, suppresses output except errors
 *   --publish                    Publish config to Fusion portal registry
 *   --identifier <name@version>  Identifier of the portal, example my-portal@1.2.3 (required with --publish)
 *   -o, --output <stdout|path>   Output to stdout or a file (default: stdout)
 *   <config>                     Path to the portal config file (e.g., portal.config[.env]?.[ts,js,json])
 *   --env <env>                  Target environment
 *
 * Examples:
 *   $ fusion-framework-cli portal config --identifier my-portal@1.2.3 -o stdout portal.config.ts
 *   $ fusion-framework-cli portal config --identifier my-portal@1.2.3 -o ./dist/portal.config.json portal.config.prod.ts
 *   $ fusion-framework-cli portal config --publish --env prod --identifier my-portal@1.2.3 portal.config.ts
 *
 * @see generatePortalConfig, publishPortalConfig for implementation details
 */
export const command = withAuthOptions(
  createCommand('config')
    .description('Generate or publish the Fusion portal configuration file.')
    .addHelpText(
      'after',
      [
        'Generates and/or publishes the Fusion portal configuration.',
        '',
        'By default, outputs the config to stdout or a file. Use --publish to upload to the portal registry.',
        '',
        'Options:',
        '  --publish         Publish config to Fusion portal registry',
        '  --identifier      Portal identifier (required with --publish)',
        '  -o, --output      Output to stdout or a file (default: stdout)',
        '  --env             Target environment',
        '  --debug           Enable debug mode for verbose logging',
        '',
        'Examples:',
        '  $ fusion-framework-cli portal config --identifier my-portal@1.2.3 -o stdout portal.config.ts',
        '  $ fusion-framework-cli portal config --publish --env prod --identifier my-portal@1.2.3 portal.config.ts',
      ].join('\n'),
    )
    .option('--debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .option(
      '--publish <name@version>',
      'Publish config to Fusion portal registry, Identifier of the portal, example my-portal@1.2.3',
    )
    .addOption(createEnvOption({ allowDev: true }))
    .option(
      '-o, --output <stdout|path>',
      'Output the result to stdout or a file (ignored with --publish, default: stdout)',
      'stdout',
    )
    .argument(
      '[config]',
      'Path to the portal config file (e.g., portal.config[.env]?.[ts,js,json])',
    )
    .action(async (config, options) => {
      const log = options.silent
        ? null
        : new ConsoleLogger('portal:config', { debug: !!options.debug });

      // Validate env for publish (no dev allowed)
      if (options.publish) {
        const [name, version] = options.publish.split('@') || [];
        if (!name || !version) {
          log?.fail('🤪', 'Portal identifier is required when using', chalk.blue('--publish'));
          log?.info('Example: fusion-framework-cli portal config --publish my-portal@1.2.3');
          process.exit(1);
        }
        if (options.env === 'dev') {
          log?.fail(
            '🤪',
            chalk.blue('--env'),
            'cannot be "dev" when',
            chalk.blue('--publish'),
            ' is used',
          );
          process.exit(1);
        }
        return publishPortalConfig({
          config: options.config,
          portal: {
            name,
            version,
          },
          environment: options.env,
          auth: 'token' in options ? { token: options.token } : options,
          debug: options.debug,
        });
      }

      // Generate config
      const { config: portalConfig } = await generatePortalConfig({
        log,
        config,
        env: { environment: options.env },
        output: options.output === 'stdout' ? undefined : options.output,
      });

      if (options.output === 'stdout') {
        stdout.write(JSON.stringify(portalConfig, null, 2));
      }
    }),
);

export default command;
