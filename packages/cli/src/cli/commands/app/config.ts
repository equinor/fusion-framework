import { createCommand } from 'commander';

import chalk from 'chalk';

import {
  ConsoleLogger,
  generateApplicationConfig,
  publishAppConfig,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `config`
 *
 * Generates and/or publishes the application configuration for Fusion apps.
 *
 * Features:
 * - Outputs the generated config to stdout or a file.
 * - Use --publish to upload the config to the Fusion app registry.
 * - Options [token, tenant, client, manifest] are only relevant when --publish is used.
 * - Option [-e, --env] cannot be set to dev when --publish is used.
 *
 * Usage:
 *   $ ffc app config [config] [options]
 *
 * Arguments:
 *   [config]             Config build file to use (e.g., app.config[.env]?.[ts,js,json])
 *
 * Options:
 *   --debug              Enable debug mode for verbose logging
 *   --silent             Silent mode, suppresses output except errors
 *   --publish            Publish config to Fusion app registry
 *   --manifest <path>    Path to the app manifest file (required with --publish)
 *   -e, --env <env>      Target environment
 *   -o, --output <stdout|path> Output to stdout or a file (default: stdout)
 *
 * Example:
 *   $ ffc app config app.config.ts
 *   $ ffc app config app.config.prod.ts --output ./dist/app.config.json
 *   $ ffc app config --publish --manifest app.manifest.ts --env prod
 *
 * @see generateApplicationConfig, publishAppConfig for implementation details
 */
export const command = withAuthOptions(
  createCommand('config')
    .description('Generate or publish the Fusion application configuration object.')
    .addHelpText(
      'after',
      [
        '',
        'By default, outputs the generated config object to stdout or a file. Use --publish to upload the config to the Fusion app registry.',
        '- Options [--token, --tenantId, --clientId, --manifest] are only relevant when --publish is used.',
        '- Option [-e, --env] cannot be set to "dev" when --publish is used.',
        '',
        'Note:',
        '- If not `app.config(.$ENV)?.[ts|js|json]` is found it will fallback to generate a default config (empty object)',
        '- If not `app.manifest(.$ENV)?.[ts|js|json]` is found it will fallback to generate a default manifest',
        '',
        'Examples:',
        '  $ ffc app config app.config.ts',
        '  $ ffc app config app.config.prod.ts --output ./dist/app.config.json',
        '  $ ffc app config app.manifest.prod.ts --silent > ./dist/app.config.json',
        '  $ ffc app config --publish --manifest app.manifest.ts --env prod',
        '  $ ffc app config --env prod my-custom.config.ts',
      ].join('\n'),
    )
    .option('--debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .option('--publish', 'Publish config to Fusion app registry')
    .option('--manifest <path>', 'Path to the app manifest file (required with --publish)')
    .addOption(createEnvOption({ allowDev: true }))
    .option(
      '-o, --output <stdout|path>',
      'Output the result to stdout or a file (ignored with --publish, default: stdout)',
      'stdout',
    )
    .argument('[config]', 'Config build file to use (e.g., app.config[.env]?.[ts,js,json])')
    .action(async (config, options) => {
      const log = options.silent
        ? null
        : new ConsoleLogger('app:config', { debug: !!options.debug });

      // Validate env for publish (no dev allowed)
      if (options.publish) {
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
        return publishAppConfig({
          config: options.config,
          manifest: options.manifest,
          environment: options.env,
          auth: 'token' in options ? { token: options.token } : options,
          debug: options.debug,
        });
      }

      // Generate config
      const { config: appConfig } = await generateApplicationConfig({
        log,
        config,
        env: { environment: options.env },
        output: options.output === 'stdout' ? undefined : options.output,
      });

      if (options.output === 'stdout') {
        console.log(JSON.stringify(appConfig, null, 2));
      }
    }),
);

export default command;
