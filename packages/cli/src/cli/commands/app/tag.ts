import { createCommand } from 'commander';

import chalk from 'chalk';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  initializeFramework,
  ConsoleLogger,
  loadAppManifest,
  tagApplication,
  AllowedAppTags,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * Parse application key and version from package option or manifest
 */
async function parseAppInfo(
  options: { package?: string; manifest?: string },
  env?: RuntimeEnv,
): Promise<{ appKey: string; version: string }> {
  // Parse from package option if provided
  if (options.package) {
    const [name, version] = options.package.split('@');
    if (!name || !version) {
      throw new Error(
        'Package must be in format name@version (e.g., my-app@1.0.0). Please verify the package name and version with --package',
      );
    }
    return { appKey: name, version };
  }

  // Fallback to loading from manifest
  const { manifest: appManifest } = await loadAppManifest({
    manifest: options.manifest,
    env,
  });

  const version = appManifest.build?.version;
  if (!version) {
    throw new Error(
      `Could not determine version from manifest. Please verify manifest ${options.manifest} or provide a package name and version with --package`,
    );
  }

  return { appKey: appManifest.appKey, version };
}

/**
 * CLI command: `tag`
 *
 * Tags a Fusion application with a specific version or preview in the Fusion app registry.
 *
 * Features:
 * - Applies a tag to the specified application version for release management.
 * - Package name and version can be provided via --package or resolved from the manifest file.
 * - Supports environment selection, debug, and silent modes.
 *
 * Usage:
 *   $ fusion tag <tag> [options]
 *
 * Arguments:
 *   <tag>                           Tag to apply (latest | preview)
 *
 * Options:
 *   -p, --package [package@version] Package to tag in format name@version (e.g., my-app@1.0.0). If not provided, loaded from manifest
 *   -m, --manifest <string>         Manifest file to use (optional, defaults to app.manifest.ts)
 *   --debug                         Enable debug mode for verbose logging
 *   --silent                        Silent mode, suppresses output except errors
 *   -e, --env <env>                 Target environment
 *
 * Example:
 *   $ ffc app tag latest
 *   $ ffc app tag preview --env prod --manifest app.manifest.prod.ts
 *   $ ffc app tag latest --package my-app@1.2.3
 *
 * @see tagApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('tag')
    .description('Tag your uploaded Fusion Application build version with a specific tag.')
    .addHelpText(
      'after',
      [
        '',
        'Note: using --package is preferred over --manifest, since no infered compilation is required.',
        '',
        'Examples:',
        '  $ ffc app tag latest',
        '  $ ffc app tag preview --env prod --manifest app.manifest.prod.ts',
        '  $ ffc app tag stable --package my-app@1.2.3',
        '  $ ffc app tag latest --manifest app.manifest.custom.ts',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option(
      '-p, --package [package@version]',
      'Package to tag in format name@version (e.g., my-app@1.0.0)',
    )
    .option(
      '-m, --manifest <string>',
      'Manifest file to use. Note: ignoring if --package is provided',
    )
    .option('--debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .argument('<tag>', `Tag to apply (${Object.values(AllowedAppTags).join(' | ')})`)
    .action(async (tag, options) => {
      const log = options.silent ? null : new ConsoleLogger('app:tag', { debug: options.debug });

      const env: RuntimeEnv = {
        command: 'build',
        environment: options.env,
        mode: process.env.NODE_ENV ?? 'production',
        root: process.cwd(),
      };

      // Parse package information from options or manifest
      let appKey: string;
      let version: string;
      try {
        ({ appKey, version } = await parseAppInfo(options, env));
      } catch (error) {
        log?.error(`😢 ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        process.exit(1);
      }

      log?.info('Tagging application:', chalk.greenBright(`${appKey}@${version} - ${tag}`));

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
      log?.start('Tagging application...');
      await tagApplication({
        appKey,
        version,
        framework,
        log,
        tag,
      }).catch((error) => {
        log?.error('Failed to tag application:', error);
        process.exit(1);
      });
    }),
);

export default command;
