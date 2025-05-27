import { createCommand } from 'commander';
import { ConsoleLogger } from '../../../bin/utils';
import { buildPortal } from '../../../bin/portal-build.js';

export const command = createCommand('build')
  .description(
    [
      'Build the Fusion portal using a manifest file and environment-specific configuration.',
      '',
      'If no manifest is provided, the command will search for a default app.manifest.[ts|js|json] in the current directory.',
      'You can use environment variables to customize the build process.',
      '',
      'Examples:',
      '  $ fusion portal build',
      '  $ fusion portal build app.manifest.prod.ts --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .argument(
    '[manifest]',
    'Manifest build file to use for building (e.g., app.manifest[.env]?.[ts,js,json])',
  )
  .action(async (manifest, opt) => {
    const log = new ConsoleLogger('portal:build', { debug: opt.debug });
    await buildPortal({ log, manifest });
  });

export default command;
