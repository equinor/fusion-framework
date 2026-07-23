import type { ConfigBuilder } from '../../../config-builder.js';

/**
 * Builder factory fixture — exercises `recommended`, `configureRule`, and
 * `addRule`. Used by load-config integration tests.
 *
 * @param builder - The `ConfigBuilder` instance provided by the loader.
 */
export default function configure(builder: ConfigBuilder): void {
  builder.recommended = true;
  builder.configureRule('require-tsdoc', (rule) => {
    rule.severity = 'error';
  });
  builder.addRule({
    id: 'custom-fixture-rule',
    severity: 'warn',
    check: (_source: string, _filePath: string) => [],
  });
}
