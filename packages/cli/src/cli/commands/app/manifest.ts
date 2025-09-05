import { createCommand } from 'commander';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

import { ConsoleLogger, loadAppManifest } from '@equinor/fusion-framework-cli/bin';

import { fileExistsSync } from '../../../lib/utils/file-exists.js';

/**
 * CLI command: `manifest`
 *
 * Builds and outputs the application manifest for Fusion apps.
 *
 * Features:
 * - Prints the manifest to stdout by default, or writes to a file with --output.
 * - Supports custom manifest build files or defaults to app.manifest[.env]?.[ts,js,json].
 * - Debug and silent modes for flexible output.
 *
 * Usage:
 *   $ ffc app manifest [manifest] [options]
 *
 * Arguments:
 *   [manifest]           Manifest build file to use (e.g., app.manifest[.env]?.[ts,js,json])
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging
 *   -o, --output         Write manifest to the specified file (default: stdout)
 *   -s, --silent         Silent mode, suppresses output except errors
 *
 * Example:
 *   $ ffc app manifest
 *   $ ffc app manifest app.manifest.prod.ts --output ./dist/app.manifest.json
 *   $ ffc app manifest --debug
 *
 * @see loadAppManifest for implementation details
 */
export const command = createCommand('manifest')
  .description('Build and output the application manifest for Fusion apps.')
  .addHelpText(
    'after',
    [
      '',
      'By default, outputs the generated manifest object to stdout or a file. Use --output to write to a file.',
      '',
      'Note:',
      '- If not `app.manifest(.$ENV)?.[ts|js|json]` is found it will fallback to generate a default manifest',
      '',
      'Examples:',
      '  $ ffc app manifest',
      '  $ ffc app manifest app.manifest.prod.ts --output ./dist/app.manifest.json',
      '  $ ffc app manifest --silent | jq ".build.entryPoint"',
      '  $ ffc app manifest --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('-o, --output <string>', 'Output the result to stdout or a file', 'stdout')
  .option('-s, --silent', 'Silent mode, suppresses output except errors')
  .argument('[manifest]', 'Manifest build file to use (e.g., app.manifest[.env]?.[ts,js,json])')
  .action(async (manifest, opt) => {
    const log = opt.silent ? null : new ConsoleLogger('app:manifest', { debug: opt.debug });
    const result = await loadAppManifest({ log, manifest });
    if (opt.output !== 'stdout') {
      const output = resolve(process.cwd(), opt.output);
      log?.start('Writing manifest to file', opt.output);
      // create the output directory if it doesn't exist
      if (!fileExistsSync(dirname(output))) {
        await mkdir(dirname(output), { recursive: true });
      }

      // write the manifest to the output file
      await writeFile(output, JSON.stringify(result.manifest, null, 2));
      log?.succeed('Manifest written to file', output);
    } else {
      console.log(JSON.stringify(result.manifest, null, 2));
    }
  });
export default command;
