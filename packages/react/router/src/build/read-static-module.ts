import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parse, type Expression } from 'acorn';
import { transform } from 'esbuild';
import { StaticExpressionEvaluator } from './StaticExpressionEvaluator.js';
import type { StaticBuilder, StaticCalls, StaticModule } from './static-module.types.js';

/**
 * Reads TypeScript/JSX exports without executing the module or its imports.
 *
 * Esbuild removes TypeScript and JSX syntax; Acorn parses the resulting JavaScript.
 * Evaluation is delegated to the restricted expression evaluator, not the JS runtime.
 *
 * @param file - Absolute source module filename.
 * @param calls - Trusted builders permitted for recognized route DSL imports.
 * @returns Source-only access to exports, properties and literal values.
 * @throws When the file is unreadable, invalid or contains unsupported re-exports.
 */
export async function readStaticModule(
  file: string,
  calls: StaticCalls = {},
): Promise<StaticModule> {
  const source = await readFile(file, 'utf8');
  const { code } = await transform(source, {
    loader: /\.[jt]sx$/.test(extname(file)) ? 'tsx' : 'ts',
    format: 'esm',
    sourcefile: file,
  });
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  const bindings = new Map<string, Expression>();
  const exportedExpressions = new Map<string, Expression>();
  const builders = new Map<string, StaticBuilder>();

  // Index source declarations without following or executing project imports.
  for (const statement of program.body) {
    // Esbuild lowers exported values into local declarations and export specifiers.
    if (statement.type === 'VariableDeclaration') {
      // Unrequested declarations are indexed but never evaluated.
      for (const declaration of statement.declarations) {
        // Destructuring would require a broader expression interpreter.
        if (declaration.id.type === 'Identifier' && declaration.init) {
          bindings.set(declaration.id.name, declaration.init);
        }
      }
    } else if (statement.type === 'ExportNamedDeclaration') {
      // Preserve named/default aliases without importing their defining modules.
      for (const specifier of statement.specifiers) {
        const name =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : String(specifier.exported.value);
        exportedExpressions.set(name, specifier.local);
      }
      // Re-exports cannot be resolved without following project imports.
      if (statement.source || statement.declaration) {
        throw new Error(`${file}: sitemap exports must refer to local declarations.`);
      }
    } else if (statement.type === 'ExportAllDeclaration') {
      throw new Error(`${file}: sitemap generation does not support star re-exports.`);
    } else if (
      statement.type === 'ImportDeclaration' &&
      /^@equinor\/fusion-framework-react-(?:router(?:\/routes)?|app\/routing)$/.test(
        String(statement.source.value),
      )
    ) {
      // Recognized named imports may alias the same trusted builder.
      for (const specifier of statement.specifiers) {
        // Default/namespace imports are outside the declarative registry subset.
        if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
          const builder = Object.hasOwn(calls, specifier.imported.name)
            ? calls[specifier.imported.name]
            : undefined;
          // Other imports must never become callable source expressions.
          if (builder) builders.set(specifier.local.name, builder);
        }
      }
    }
  }

  const evaluator = new StaticExpressionEvaluator(file, bindings, builders);
  return {
    getExport: (name) => exportedExpressions.get(name),
    getProperty: (expression, name) => evaluator.getProperty(expression, name),
    evaluate: (expression) => evaluator.evaluate(expression),
  };
}
