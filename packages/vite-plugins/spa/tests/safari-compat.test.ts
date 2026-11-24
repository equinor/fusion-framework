import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseAst } from 'rollup/parseAst';
import { describe, expect, it } from 'vitest';

type AstNode = {
  type: string;
  kind?: string;
  name?: string;
  [key: string]: unknown;
};

/**
 * Traverses an ESTree AST and collects any syntax or helper constructs
 * incompatible with Safari/WebKit's lack of Explicit Resource Management.
 *
 * @param node - Root or child AST node to inspect.
 * @param findings - Accumulator for incompatible construct descriptions.
 */
function collectDisposableFindings(node: unknown, findings: string[]): void {
  // Ignore primitive values and null leaves during recursive AST traversal.
  if (!node || typeof node !== 'object') {
    return;
  }

  // Traverse AST node lists (such as statement bodies and argument arrays).
  if (Array.isArray(node)) {
    // Visit each array element recursively to inspect all statements and expressions.
    for (const item of node) {
      collectDisposableFindings(item, findings);
    }
    return;
  }

  const astNode = node as AstNode;
  // Un-downleveled `using` / `await using` declarations throw a SyntaxError in Safari/WebKit.
  if (
    astNode.type === 'VariableDeclaration' &&
    (astNode.kind === 'using' || astNode.kind === 'await using')
  ) {
    findings.push(`VariableDeclaration(${astNode.kind})`);
  }

  // TypeScript's downleveled disposable helper throws at runtime when Symbol.dispose is undefined.
  if (astNode.type === 'Identifier' && astNode.name === '__addDisposableResource') {
    findings.push('Identifier(__addDisposableResource)');
  }

  // Recurse into every child property to cover nested functions, blocks, and expressions.
  for (const value of Object.values(astNode)) {
    collectDisposableFindings(value, findings);
  }
}

describe('Safari/WebKit bundle compatibility', () => {
  it.each(['../dist/html/bootstrap.js', '../dist/html/sw.js'])(
    'emits %s without using declarations or disposable helpers',
    async (bundlePath) => {
      const code = await readFile(fileURLToPath(new URL(bundlePath, import.meta.url)), 'utf8');
      const ast = parseAst(code);
      const findings: string[] = [];

      collectDisposableFindings(ast, findings);

      expect(findings).toEqual([]);
    },
  );
});
