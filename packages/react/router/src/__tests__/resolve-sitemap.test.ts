import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveSitemap } from '../build/index.js';

let root: string;

/** Writes a fixture module while preserving its registry-relative location. */
async function file(name: string, source: string): Promise<void> {
  const target = path.join(root, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, source);
}

const dsl = `import { index, layout, prefix, route } from '@equinor/fusion-framework-react-router/routes';`;
const page = `throw new Error('Page modules must not execute'); export default function Page() { return <div />; }`;

describe('resolveSitemap', () => {
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'fusion-sitemap-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('reads a PSS-style src/routes.ts registry without executing registry, layout or pages', async () => {
    await file(
      'src/routes.ts',
      `${dsl}
       throw new Error('Registry must not execute');
       const routes = layout('./routes/layout.tsx', [
         index('./routes/index.tsx'),
         prefix('projects/:slug', [
           index('./routes/projects/index.tsx'),
           route('demands/:demandId', './routes/projects/demands/index.tsx')
         ])
       ]);
       export default routes;`,
    );
    await file('src/routes/layout.tsx', page);
    await file(
      'src/routes/index.tsx',
      `${page} export const handle = { route: { description: 'Home' } };`,
    );
    await file('src/routes/projects/index.tsx', page);
    await file(
      'src/routes/projects/demands/index.tsx',
      `${page}
       const title = () => { throw new Error('Dynamic UI metadata must not execute'); };
       export const handle = {
         title,
         route: {
           description: 'Demand',
           params: { slug: 'Project identifier', demandId: 'Demand identifier' },
           search: { tab: 'Selected tab' }
         }
       } satisfies RouterHandle;`,
    );
    expect(await resolveSitemap({ root })).toEqual([
      ['/', 'Home'],
      ['projects/:slug', ''],
      [
        'projects/:slug/demands/:demandId',
        'Demand',
        {
          params: { slug: 'Project identifier', demandId: 'Demand identifier' },
          search: { tab: 'Selected tab' },
        },
      ],
    ]);
  });

  it('supports explicit registry paths, local constants, aliases and named exports', async () => {
    await file(
      'custom/registry.ts',
      `import { index as home } from '@equinor/fusion-framework-react-app/routing';
       const filename = './home.tsx';
       export const routes = [home(filename)];`,
    );
    await file('custom/home.tsx', page);
    expect(await resolveSitemap({ root, routesFile: 'custom/registry.ts' })).toEqual([['/', '']]);
  });

  it('lets inline schemas override individual module-schema fields', async () => {
    await file(
      'src/routes.ts',
      `${dsl} export default [index('./page.tsx', { description: 'Inline', params: { id: 'New' } })];`,
    );
    await file(
      'src/page.tsx',
      `${page} export const handle = { route: { description: 'Module', params: { old: 'Old' }, search: { q: 'Query' } } };`,
    );
    expect(await resolveSitemap({ root })).toEqual([
      ['/', 'Inline', { params: { id: 'New' }, search: { q: 'Query' } }],
    ]);
  });

  it('does not discover unrelated files or require a browser', async () => {
    await file('src/routes.ts', `${dsl} export default [];`);
    await file('src/routes/broken.tsx', 'this is not valid TypeScript');
    expect(await resolveSitemap({ root })).toEqual([]);
  });

  it('preserves parent/index duplicates, nested arrays and authored child order', async () => {
    await file(
      'src/routes.ts',
      `${dsl} export default [[
        route('projects/:slug', './page.tsx', [
          index('./page.tsx'),
          route('settings', './settings.tsx'),
        ]),
      ]];`,
    );
    await file(
      'src/page.tsx',
      `${page} export const handle = { route: { description: 'Project' } };`,
    );
    await file('src/settings.tsx', page);
    expect(await resolveSitemap({ root })).toEqual([
      ['projects/:slug', 'Project'],
      ['projects/:slug', 'Project'],
      ['projects/:slug/settings', ''],
    ]);
  });

  it.each([
    ['computed registry', `${dsl} export default makeRoutes();`, 'CallExpression'],
    ['missing export', `${dsl} const tree = [];`, 'expected a default export'],
    ['invalid node', 'export default [42];', 'expected a route DSL node'],
    ['non-string path', `${dsl} export default route(42, './page.tsx');`, 'paths must be strings'],
    [
      'invalid children',
      `${dsl} export default layout('./page.tsx', [42]);`,
      'children must be an array',
    ],
    ['cyclic binding', 'const a = b; const b = a; export default a;', 'Identifier'],
    ['cyclic array', 'const routes = [routes]; export default routes;', 'ArrayExpression'],
    [
      'invalid structural node',
      `export default { kind: 'route', path: 'missing-file' };`,
      'expected a route DSL node',
    ],
    ['imported helper', `import routes from './helper'; export default routes;`, 'Identifier'],
  ])(
    'reports %s instead of silently publishing a partial sitemap',
    async (_name, source, message) => {
      await file('src/routes.ts', source);
      await expect(resolveSitemap({ root })).rejects.toThrow(message);
    },
  );

  it('rejects dynamic page metadata without invoking it', async () => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file('src/page.tsx', `${page} export const handle = { route: loadSchema() };`);
    await expect(resolveSitemap({ root })).rejects.toThrow('CallExpression');
  });

  it('reports invalid metadata values', async () => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file('src/page.tsx', `${page} export const handle = { route: { params: { id: 42 } } };`);
    await expect(resolveSitemap({ root })).rejects.toThrow('params.id must be a string');
  });

  it('fails for a missing registry rather than falling back to discovery', async () => {
    await file('src/routes/index.tsx', page);
    await expect(resolveSitemap({ root })).rejects.toThrow('routes.ts');
  });

  it('reports missing referenced modules', async () => {
    await file('src/routes.ts', `${dsl} export default index('./missing.tsx');`);
    await expect(resolveSitemap({ root })).rejects.toThrow('missing.tsx');
  });
});
