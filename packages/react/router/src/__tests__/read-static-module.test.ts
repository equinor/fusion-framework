import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Expression } from 'acorn';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStaticModule } from '../build/read-static-module.js';
import type { StaticCalls, StaticModule } from '../build/static-module.types.js';

let root: string;

/**
 * Parses a real source fixture through the same module reader as sitemap generation.
 * @param source - TypeScript or JSX source text.
 * @param calls - Trusted builders used by the fixture.
 * @returns Source-only access to the fixture's exports.
 * @throws When the fixture cannot be written or parsed.
 */
async function readFixture(source: string, calls: StaticCalls = {}): Promise<StaticModule> {
  const file = join(root, 'module.tsx');
  await writeFile(file, source);
  return readStaticModule(file, calls);
}

/**
 * Requires an expected export without weakening expression types in assertions.
 * @param module - Parsed source fixture.
 * @param name - Export required by the test.
 * @returns The exported expression.
 * @throws When the fixture lacks the requested export.
 */
function requireExport(module: StaticModule, name: string): Expression {
  const expression = module.getExport(name);
  // Missing fixture exports are setup errors, not valid evaluation inputs.
  if (!expression) throw new Error(`Missing fixture export: ${name}`);
  return expression;
}

describe('readStaticModule', () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'fusion-static-module-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('resolves local aliases and TypeScript metadata without executing source', async () => {
    const module = await readFixture(`
      throw new Error('Source must not execute');
      const description = 'Home';
      const schema = { description, params: { id: 'Identifier' } } as const;
      export { schema as default, description };
    `);
    expect(module.evaluate(requireExport(module, 'default'))).toEqual({
      description: 'Home',
      params: { id: 'Identifier' },
    });
    expect(module.evaluate(requireExport(module, 'description'))).toBe('Home');
    expect(module.getExport('missing')).toBeUndefined();
  });

  it('selects route metadata without evaluating unrelated UI expressions or getters', async () => {
    const module = await readFixture(`
      import { title } from './never-imported.ts';
      export const handle = {
        route: { description: 'Home' },
        title,
        get subtitle() { throw new Error('Getter must not execute'); }
      };
    `);
    const handle = requireExport(module, 'handle');
    const metadata = module.getProperty(handle, 'route');
    expect(metadata).toBeDefined();
    // Evaluate only the selected metadata expression, as the sitemap collector does.
    if (!metadata) throw new Error('Missing fixture route metadata');
    expect(module.evaluate(metadata)).toEqual({ description: 'Home' });
    expect(module.getProperty(handle, 'missing')).toBeUndefined();
  });

  it.each([
    'const icon = schema.icon;',
    'const icon = schema["icon"];',
    'const key = "icon"; const icon = schema[key];',
    'const icon = schema?.icon;',
    'const alias = schema; const icon = alias.icon;',
    'const holder = { schema }; const icon = holder.schema.icon;',
    'const holder = { schema }; const { schema: alias } = holder; const icon = alias.icon;',
    'const { icon } = schema;',
    'const { description, ...ui } = schema;',
    'const ui = { ...schema };',
  ])('rejects accessor reads that can mutate selected metadata: %s', async (read) => {
    const module = await readFixture(`
      const schema = {
        description: 'Before',
        get icon() { this.description = 'After'; return 'icon'; },
      };
      ${read}
      export const handle = { route: schema };
    `);

    expect(() => {
      const route = module.getProperty(requireExport(module, 'handle'), 'route');
      if (!route) throw new Error('Missing fixture route metadata');
      module.getProperty(route, 'description');
    }).toThrow('mutable');
  });

  it.each([
    '',
    'const description = schema.description;',
    'const { description } = schema;',
    'const { description = { get icon() { return "unused"; } } } = schema;',
    'const holder = { schema }; const description = holder.schema.description;',
    'function render(schema) { const icon = schema.icon; }',
    'const ui = { get icon() { return "icon"; } }; const icon = ui.icon;',
  ])('preserves uninvoked UI getters and unrelated property reads: %s', async (read) => {
    const module = await readFixture(`
      const schema = {
        description: 'Home',
        get icon() { throw new Error('Getter must not execute'); },
      };
      ${read}
      export const handle = { route: schema };
    `);
    const route = module.getProperty(requireExport(module, 'handle'), 'route');
    if (!route) throw new Error('Missing fixture route metadata');
    const description = module.getProperty(route, 'description');
    if (!description) throw new Error('Missing fixture description');
    expect(module.evaluate(description)).toBe('Home');
  });

  it('invokes only a recognized named DSL import, including aliases', async () => {
    const builder = vi.fn((...args: unknown[]): unknown => args);
    const module = await readFixture(
      `import { index as home } from '@equinor/fusion-framework-react-router/routes';
       export default home('./page.tsx', { description: 'Home' });`,
      { index: builder },
    );
    expect(module.evaluate(requireExport(module, 'default'))).toEqual([
      './page.tsx',
      { description: 'Home' },
    ]);
    expect(builder).toHaveBeenCalledExactlyOnceWith('./page.tsx', { description: 'Home' });
  });

  it('preserves duplicate-key precedence and own prototype-like property names', async () => {
    const module = await readFixture(`
      export const handle = { route: { description: 'First' }, route: { description: 'Last' } };
      export default { '__proto__': 'Parameter', constructor: 'Constructor', 1: 'Numeric' };
    `);
    const metadata = module.getProperty(requireExport(module, 'handle'), 'route');
    // The final declaration is the observable JavaScript object-literal value.
    if (!metadata) throw new Error('Missing fixture route metadata');
    expect(module.evaluate(metadata)).toEqual({ description: 'Last' });
    const value = module.evaluate(requireExport(module, 'default'));
    expect(value).toEqual(
      JSON.parse('{"__proto__":"Parameter","constructor":"Constructor","1":"Numeric"}'),
    );
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
  });

  it.each([
    ['arbitrary call', 'export default loadSchema();', 'CallExpression'],
    ['array hole', 'export default [,];', 'ArrayExpression'],
    ['array spread', 'const values = []; export default [...values];', 'ArrayExpression'],
    ['object spread', 'export default { ...{} };', 'SpreadElement'],
    ['computed key', "export default { ['description']: 'Home' };", 'Property'],
    ['getter', "export default { get description() { return 'Home'; } };", 'Property'],
    ['interpolation', `export default \`Home \${loadTitle()}\`;`, 'TemplateLiteral'],
    ['regular expression', 'export default /Home/;', 'Literal'],
    ['bigint', 'export default 1n;', 'Literal'],
    ['cyclic reference', 'const a = b; const b = a; export default a;', 'Identifier'],
    [
      'namespace call',
      `import * as routes from '@equinor/fusion-framework-react-router/routes';
       export default routes.index('./page.tsx');`,
      'CallExpression',
    ],
  ])('rejects %s rather than evaluating application code', async (_name, source, syntax) => {
    const module = await readFixture(source);
    expect(() => module.evaluate(requireExport(module, 'default'))).toThrow(
      `unsupported ${syntax}`,
    );
  });

  it('rejects requested named re-exports without following their module', async () => {
    const module = await readFixture("export { schema } from './never-imported.ts';");
    expect(() => module.evaluate(requireExport(module, 'schema'))).toThrow('Identifier');
  });

  it('rejects star re-exports without following their module', async () => {
    await expect(readFixture("export * from './never-imported.ts';")).rejects.toThrow(
      'star re-exports',
    );
  });

  it('clears evaluation state after a cycle failure', async () => {
    const module = await readFixture(`
      const cycle = [cycle];
      export { cycle };
      export const valid = { description: 'Home' };
    `);
    expect(() => module.evaluate(requireExport(module, 'cycle'))).toThrow('ArrayExpression');
    expect(module.evaluate(requireExport(module, 'valid'))).toEqual({ description: 'Home' });
  });

  it('surfaces a missing source file with its filename', async () => {
    await expect(readStaticModule(join(root, 'missing.ts'))).rejects.toThrow('missing.ts');
  });

  it.each([
    'const routes = []; routes.push(1); export default routes;',
    'const routes = []; const alias = routes; alias.push(1); export default routes;',
    'const routes = []; const alias = routes; const next = alias; next[0] = 1; export default routes;',
    'const routes = []; const holder = { routes }; holder.routes.push(1); export default routes;',
    'const routes = []; const holder = { routes }; const { routes: alias } = holder; alias.push(1); export default routes;',
    'const routes = []; function mutate() { const alias = routes; alias.push(1); } mutate(); export default routes;',
    'const routes = []; function mutate(alias = routes) { alias.push(1); } mutate(); export default routes;',
    'const routes = []; let alias; alias = routes; export default routes;',
    'let routes = []; if (enabled) routes = [1]; export default routes;',
    'const routes = []; mutate(routes); export default routes;',
    'const routes = []; new Mutator(routes); export default routes;',
    'const routes = []; const leak = () => routes; mutate(leak()); export default routes;',
    'const routes = []; function leak() { return routes; } export default routes;',
    'const routes = []; eval("routes.push(1)"); export default routes;',
    'var routes = []; var routes = [1]; export default routes;',
    'var routes = []; for (var routes of [[1]]) {} export default routes;',
    'const routes = [{}]; for (const entry of routes) { entry.id = 1; } export default routes;',
    'const routes = []; await routes; export default routes;',
    "const schema = { description: 'Before' }; schema.description = 'After'; export default schema;",
    "const schema = { description: 'Before' }; Object.assign(schema, { description: 'After' }); export default schema;",
    "const schema = { params: { id: 'Before' } }; const { params } = schema; params.id = 'After'; export default schema;",
    "const schema = { params: { id: 'Before' } }; const alias = schema.params; delete alias.id; export default schema;",
    'let description = 1; description++; export default { description };',
    "let description = 'Before'; [description] = ['After']; export default { description };",
    "let description = 'Before'; for (description of ['After']) {} export default { description };",
  ])('rejects mutable definitions: %s', async (source) => {
    const module = await readFixture(source);
    expect(() => module.evaluate(requireExport(module, 'default'))).toThrow('mutable');
  });

  it.each([
    'const routes = []; const other = []; other.push(1); export default routes;',
    'const routes = []; const alias = routes; export { alias as default };',
    'const routes = []; function mutate(routes) { routes.push(1); } mutate([]); export default routes;',
    'const routes = []; function mutate() { routes.push(1); var routes = []; } export default routes;',
    'const routes = []; { const routes = []; routes.push(1); } export default routes;',
    'const routes = []; try {} catch (routes) { routes.push(1); } export default routes;',
  ])('preserves unrelated mutation, harmless aliases and lexical shadowing: %s', async (source) => {
    const module = await readFixture(source);
    expect(module.evaluate(requireExport(module, 'default'))).toEqual([]);
  });

  it('allows primitive metadata to be read by UI helpers without evaluating them', async () => {
    const module = await readFixture(`
      const description = 'Home';
      const alias = description;
      const title = formatTitle(alias);
      export default { description, alias };
    `);
    expect(module.evaluate(requireExport(module, 'default'))).toEqual({
      description: 'Home',
      alias: 'Home',
    });
  });
});
