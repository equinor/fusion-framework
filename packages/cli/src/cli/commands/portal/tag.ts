import { createCommand } from 'commander';

import chalk from 'chalk';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  initializeFramework,
  loadPortalManifest,
  tagPortal,
  ConsoleLogger,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * Parse portal package information from package option or manifest
 */
async function parsePortalInfo(
  options: { package?: string; manifest?: string },
  env?: RuntimeEnv,
): Promise<{ name: string; version: string }> {
  // Parse from package option if provided
  if (options.package) {
    const [name, version] = options.package.split('@');
    if (!name || !version) {
      throw new Error(
        'Package must be in format name@version (e.g., my-portal@1.0.0). Please verify the package name and version with --package',
      );
    }
    return { name, version };
  }

  // Fallback to loading from manifest
  const { manifest: portalManifest } = await loadPortalManifest({
    manifest: options.manifest,
    env,
  });

  const version = portalManifest.build?.version;
  if (!version) {
    throw new Error(
      `Could not determine version from manifest. Please verify manifest ${options.manifest} or provide a package name and version with --package`,
    );
  }

  return { name: portalManifest.name, version };
}

/**
 * CLI command: `tag`
 *
 * Tags a Fusion portal package with a specific version or label.
 *
 * Features:
 * - Supports tagging a portal by package name/version or by reading from a manifest file.
 * - Allows specifying the target environment.
 * - Provides debug and silent modes for flexible output.
 *
 * Usage:
 *   $ ffc portal tag <tag> [options]
 *
 * Arguments:
 *   <tag>                  Tag to apply (e.g., latest, preview, next, or any string value)
 *
 * Options:
 *   -m, --manifest <file>  Manifest file to use (optional, defaults to portal.manifest.ts)
 *   -p, --package [pkg@ver] Package to tag in format name@version (e.g., my-portal@1.0.0)
 *   -d, --debug            Enable debug mode for verbose logging
 *   --silent               Silent mode, suppresses output except errors
 *   --env <env>            Specify the environment (see available environments)
 *
 * Example:
 *   $ ffc portal tag latest --package my-portal@1.2.3 --env prod
 *   $ ffc portal tag preview --manifest ./portal.manifest.ts
 *
 * @see tagPortal for implementation details
 */
export const command = withAuthOptions(
  createCommand('tag')
    .description('Tag your uploaded Fusion Portal build version with a specific tag.')
    .addHelpText(
      'after',
      [
        '',
        'Note: using --package is preferred over --manifest, since no infered compilation is required.',
        '',
        'Examples:',
        '  $ ffc portal tag latest',
        '  $ ffc portal tag latest --package my-portal@1.2.3 --env prod',
        '  $ ffc portal tag preview --manifest ./portal.manifest.ts',
        '  $ ffc portal tag next --package my-portal@2.0.0-alpha',
        '  $ ffc portal tag stable --package my-portal@1.5.0',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option(
      '-m, --manifest <string>',
      'Manifest file to use. Note: ignoring if --package is provided',
    )
    .option(
      '-p, --package [package@version]',
      'Package to tag in format name@version (e.g., my-portal@1.0.0). If not provided, loaded from manifest',
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .argument('<tag>', 'Tag to apply (e.g., latest, preview, next, or any string value)')
    .action(async (tag, options) => {
      const log = options.silent ? null : new ConsoleLogger('app:tag', { debug: options.debug });

      const env: RuntimeEnv = {
        command: 'build',
        environment: options.env,
        mode: process.env.NODE_ENV ?? 'production',
        root: process.cwd(),
      };

      // Parse package information from options
      const pkg = await parsePortalInfo(options, env).catch((error) => {
        log?.error(`😢 ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        log?.debug(error);
        process.exit(1);
      });

      log?.info('Tagging portal:', chalk.greenBright(`${pkg.name}@${pkg.version} - ${tag}`));

      log?.start('Initializing Fusion Framework...');
      const framework = await initializeFramework({
        env: options.env,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log?.succeed('Initialized Fusion Framework');

      tagPortal({
        tag,
        name: pkg.name,
        version: pkg.version,
        framework,
        log,
      }).catch((error) => {
        log?.error('😢 Failed to tag application:', error);
        process.exit(1);
      });
    }),
);

export default command;
