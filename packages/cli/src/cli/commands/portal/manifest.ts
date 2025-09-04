import { createCommand } from 'commander';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

import { ConsoleLogger, loadPortalManifest } from '@equinor/fusion-framework-cli/bin';
import { fileExistsSync } from '@equinor/fusion-framework-cli/utils';

/**
 * CLI command: `portal manifest`
 *
 * Generates or validates a Fusion portal manifest file.
 *
 * Features:
 * - Outputs the generated manifest to stdout or a file (use --output).
 * - Falls back to a default manifest if no `portal.manifest(.$ENV)?.[ts|js|json]` is found.
 * - Supports debug and silent modes for flexible output.
 *
 * Usage:
 *   $ ffc portal manifest [manifest] [options]
 *
 * Arguments:
 *   [manifest]           Manifest build file to use (e.g., portal.manifest[.env]?.[ts,js,json])
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging
 *   -o, --output         Write manifest to the specified file (default: stdout)
 *   -s, --silent         Silent mode, suppresses output except errors
 *
 * Example:
 *   $ ffc portal manifest
 *   $ ffc portal manifest portal.manifest.prod.ts --output ./dist/portal.manifest.json
 *   $ ffc portal manifest --debug
 *
 * @see loadPortalManifest for implementation details
 */
export const command = createCommand('manifest')
  .description('Generate or validate a Fusion portal manifest file.')
  .addHelpText(
    'after',
    [
      '',
      'By default, outputs the generated manifest object to stdout or a file. Use --output to write to a file.',
      '',
      'Note:',
      '- If not `portal.manifest(.$ENV)?.[ts|js|json]` is found it will fallback to generate a default manifest',
      '',
      'Examples:',
      '  $ ffc portal manifest',
      '  $ ffc portal manifest portal.manifest.prod.ts --output ./dist/portal.manifest.json',
      '  $ ffc portal manifest --silent | jq ".build.entryPoint"',
      '  $ ffc portal manifest --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('-o, --output <string>', 'Write manifest to the specified file', 'stdout')
  .option('-s, --silent', 'Silent mode, suppresses output except errors')
  .argument('[manifest]', 'Manifest build file to use (e.g., portal.manifest[.env]?.[ts,js,json])')
  .action(async (manifest, opt) => {
    const log = opt.silent ? null : new ConsoleLogger('portal:manifest', { debug: opt.debug });
    const result = await loadPortalManifest({ log, manifest });
    if (opt.output) {
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
