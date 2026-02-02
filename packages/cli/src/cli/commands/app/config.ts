import { createCommand } from 'commander';

import chalk from 'chalk';

import {
  ConsoleLogger,
  generateApplicationConfig,
  loadAppManifest,
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
      const { env, publish, manifest } = options;
      const log = options.silent
        ? null
        : new ConsoleLogger('app:config', { debug: !!options.debug });

      // Determine output option based on publish flag and user input
      const output =
        publish || options.output === 'stdout'
          ? undefined // do not output to file when publishing or stdout requested
          : options.output;

      // Generate the application config using provided options and environment
      const { config: appConfig } = await generateApplicationConfig({
        log,
        env: { environment: env },
        output,
        config,
      });

      // Load the application manifest for the specified environment
      const {
        manifest: { appKey, build },
      } = await loadAppManifest({
        log,
        env: { environment: env },
        manifest,
      });

      // Validate build version in manifest
      if (!build?.version) {
        log?.fail(
          '🤪',
          'No build version found in the manifest. Please make sure the manifest is valid.',
        );
        process.exit(1);
      }

      // Validate env for publish (no dev allowed)
      if (publish) {
        if (env === 'dev') {
          log?.fail(
            '🤪',
            chalk.blue('--env'),
            'cannot be "dev" when',
            chalk.blue('--publish'),
            ' is used',
          );
          process.exit(1);
        }
        // Initialize the Fusion Framework
        log?.start(`💾 Initializing Fusion Framework - Environment: ${env}`);
        const framework = await import('@equinor/fusion-framework-cli/bin').then((mod) =>
          mod.initializeFramework({
            env,
            auth: 'token' in options ? { token: options.token } : options,
          }),
        );
        log?.succeed('Fusion Framework initialized');

        // Publish the application config to the Fusion app registry
        return publishAppConfig({
          config: appConfig,
          appKey,
          log,
          buildVersion: build.version,
          framework,
        });
      }

      if (options.output === 'stdout') {
        console.log(JSON.stringify(appConfig, null, 2));
      }
    }),
);

export default command;
