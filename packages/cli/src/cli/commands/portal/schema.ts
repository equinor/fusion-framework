import { createCommand } from 'commander';

import Ajv2020 from 'ajv/dist/2020';

import { ConsoleLogger } from '../../../bin/utils/ConsoleLogger.js';

import { loadPortalSchema } from '../../../lib/portal';
import { writeFile } from '../../../lib/utils/write-file.js';
import { createEnvOption } from '../../options/env.js';
import { importJSON } from '@equinor/fusion-imports';

export const command = createCommand('schema')
  .description(
    [
      'Generate and validate the JSON schema for the Fusion portal application.',
      '',
      'This command generates a schema file for your portal app, optionally writes it to a file, and can validate a JSON file against the generated schema.',
      'Supports environment selection, debug mode, and output to stdout or file.',
      '',
      'Examples:',
      '  $ fusion portal schema',
      '  $ fusion portal schema --output portal.schema.json',
      '  $ fusion portal schema --validate my-config.json',
      '  $ fusion portal schema portal.schema.prod.ts --debug',
    ].join('\n'),
  )
  .addOption(createEnvOption({ allowDev: true }))
  .option('-o, --output <string>', 'Output file name (default: stdout)', 'stdout')
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('-v, --validate <file>', 'Validate the generated schema against a JSON file')
  .argument('[schema]', 'Schema build file to use (e.g., portal.schema[.env]?.[ts,js,json])')
  .action(async (manifest, args) => {
    const log = new ConsoleLogger('portal:schema', { debug: args.debug });

    log.debug('Manifest file:', manifest);
    log.debug('Current working directory:', process.cwd());

    log.start('Generating schema for the application...');
    const schemaResult = await loadPortalSchema({
      command: 'build',
      environment: args.environment,
      mode: 'build',
      root: process.cwd(),
    });
    log.debug('Schema:', JSON.stringify(schemaResult, null, 2));
    log.succeed('Schema generated successfully!');

    if (args.output) {
      if (args.output === 'stdout') {
        log.info('Schema:', JSON.stringify(schemaResult.schema, null, 2));
      } else {
        log.start(`Writing schema to ${args.output}`);
        writeFile(args.output, JSON.stringify(schemaResult.schema, null, 2));
        log.succeed(`Schema written to ${args.output}`);
      }
      process.exit(0);
    }

    if (args.validate) {
      log.start('Validating schema against JSON file...');
      const ajv = new Ajv2020({ strict: true });
      const validate = ajv.compile(schemaResult.schema);

      // import the JSON file to validate
      const jsonValue = await importJSON(args.validate);
      log.debug('JSON value:', JSON.stringify(jsonValue, null, 2));

      const valid = validate(jsonValue);
      if (!valid) {
        log.fail('Schema validation failed:', JSON.stringify(validate.errors ?? 'Unknown error'));
        process.exit(1);
      } else {
        log.succeed('Schema validation passed!');
      }
    }
  });

export default command;
