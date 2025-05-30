import { createCommand } from 'commander';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { stdout } from 'node:process';

import { loadPortalManifest } from '../../../bin';

import { ConsoleLogger } from '../../../bin/utils';
import { fileExistsSync } from '../../../lib/utils';

export const command = createCommand('manifest')
  .description(
    [
      'Build and output the portal manifest for Fusion apps.',
      '',
      'By default, the manifest is printed to stdout. Use --output to write it to a file.',
      'You can specify a custom manifest build file or use the default (app.manifest[.env]?.[ts,js,json]).',
      'Supports debug and silent modes for flexible output.',
      '',
      'Examples:',
      '  $ fusion portal manifest',
      '  $ fusion portal manifest app.manifest.prod.ts --output ./dist/portal.manifest.json',
      '  $ fusion portal manifest --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('-o, --output <string>', 'Write manifest to the specified file', 'stdout')
  .option('-s, --silent', 'Silent mode, suppresses output except errors')
  .argument('[manifest]', 'Manifest build file to use (e.g., app.manifest[.env]?.[ts,js,json])')
  .action(async (manifest, opt) => {
    const log = opt.silent ? null : new ConsoleLogger('app:manifest', { debug: opt.debug });
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
      stdout.write(JSON.stringify(result.manifest, null, 2));
    }
  });
export default command;
