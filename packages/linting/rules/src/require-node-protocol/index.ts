import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-node-protocol';
const DEFAULT_SEVERITY: Severity = 'error';

/**
 * All Node.js built-in module names that must be imported with the `node:` prefix.
 * This set covers every stable module in Node.js ≥ 18.
 */
const NODE_BUILTINS = new Set([
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
]);

/**
 * Recursively visits every node in the AST and reports bare Node.js built-in
 * imports that are missing the `node:` protocol prefix.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Both import and export statements can reference built-ins
  if (node.type === 'import_statement' || node.type === 'export_statement') {
    const source = node.childForFieldName('source');
    // Guard: not every import/export has a source field
    if (source) {
      // source text includes surrounding quotes, e.g. `'fs'` or `"path"`
      const raw = source.text.replace(/^['"]|['"]$/g, '');
      // Only flag modules that are known Node.js built-ins without the node: prefix
      if (NODE_BUILTINS.has(raw)) {
        out.push({
          file: filePath,
          line: node.startPosition.row + 1,
          col: node.startPosition.column + 1,
          rule: RULE_ID,
          message: `Import '${raw}' must use the \`node:\` protocol — use 'node:${raw}' instead`,
          severity,
        });
      }
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Requires all Node.js built-in module imports to use the `node:` protocol prefix.
 *
 * Enforces the convention `import { readFile } from 'node:fs'` over the bare form
 * `import { readFile } from 'fs'`.  The `node:` prefix makes it unambiguous that
 * the import is a Node built-in rather than an npm package of the same name.
 *
 * @example Passing
 * ```typescript
 * import { readFile } from 'node:fs/promises';
 * import { join } from 'node:path';
 * ```
 *
 * @example Failing
 * ```typescript
 * import { readFile } from 'fs/promises'; // ← missing node:
 * import { join } from 'path';            // ← missing node:
 * ```
 */
export const requireNodeProtocol: Rule = {
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.check */
  check(source: string, filePath: string): Diagnostic[] {
    const tree = tsParser.parse(source);
    // Guard: tsParser.parse returns null for empty or unparseable source
    if (!tree) return [];
    const out: Diagnostic[] = [];
    walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out);
    return out;
  },
};
