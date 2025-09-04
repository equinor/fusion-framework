import { createCommand } from 'commander';

import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

import { ConsoleLogger, loadPortalManifest } from '@equinor/fusion-framework-cli/bin';
import { fileExistsSync } from '@equinor/fusion-framework-cli/utils';

export const command = createCommand('manifest')
  .description('Generate or validate a Fusion portal manifest file.')
  .addHelpText(
    'after',
    [
      'Generates or validates a Fusion portal manifest file.',
      '',
      'If no manifest is provided, a default portal.manifest.[ts|js|json] is used from the current directory.',
      '',
      'Options:',
      '  -o, --output   Write manifest to the specified file (default: stdout)',
      '  -d, --debug    Enable debug mode for verbose logging',
      '  -s, --silent   Silent mode, suppresses output except errors',
      '',
      'Examples:',
      '  $ fusion-framework-cli portal manifest',
      '  $ fusion-framework-cli portal manifest portal.manifest.prod.ts --output ./dist/portal.manifest.json',
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
      console.log(JSON.stringify(result.manifest, null, 2));
    }
  });
export default command;
