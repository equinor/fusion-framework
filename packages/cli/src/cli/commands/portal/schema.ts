import { createCommand } from 'commander';

// @ts-expect-error - @todo - fix this import
import Ajv2020 from 'ajv/dist/2020';

import { importJSON } from '@equinor/fusion-imports';

import { loadPortalSchema } from '@equinor/fusion-framework-cli/portal';

import { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

import { writeFile } from '@equinor/fusion-framework-cli/utils';

import { createEnvOption } from '../../options/env.js';

/**
 * CLI command: `schema`
 *
 * Generates or validates a Fusion portal schema file.
 *
 * Features:
 * - Supports environment variables to customize the schema generation.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc portal schema [schema] [options]
 *
 * Arguments:
 *   [schema]   Schema build file to use (e.g., portal.schema[.env]?.[ts,js,json])
 *
 * Options:
 *   -o, --output <string>  Output file name (default: stdout)
 *   -d, --debug            Enable debug mode for verbose logging
 *   -v, --validate <file>  Validate the generated schema against a JSON file
 *
 * Example:
 *   $ ffc portal schema
 *   $ ffc portal schema --output portal.schema.json
 *   $ ffc portal schema --validate my-config.json
 *
 * @see loadPortalSchema for implementation details
 */
export const command = createCommand('schema')
  .description('Generate or validate a Fusion portal schema file.')
  .addHelpText(
    'after',
    [
      '',
      'Examples:',
      '  $ ffc portal schema',
      '  $ ffc portal schema --output portal.schema.json',
      '  $ ffc portal schema --validate my-config.json',
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
