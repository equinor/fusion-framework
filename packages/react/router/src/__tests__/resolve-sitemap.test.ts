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

  it('ignores imported icons and runtime UI values inside handle.route', async () => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file(
      'src/page.tsx',
      `import { home } from '@equinor/eds-icons';
       ${page}
       const uiState = [];
       uiState.push('runtime-only');
       export const handle = {
         route: {
           icon: home,
           title: loadTitle(),
           uiState,
           description: 'Home',
           search: { tab: 'Selected tab' },
         },
       };`,
    );
    expect(await resolveSitemap({ root })).toEqual([
      ['/', 'Home', { search: { tab: 'Selected tab' } }],
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

  it('treats nested absolute paths as complete URLs and resolves their relative descendants', async () => {
    await file(
      'src/routes.ts',
      `${dsl} export default route('projects', './page.tsx', [
        layout('./layout.tsx', [
          route('/projects/:id', './page.tsx', [
            index('./page.tsx'),
            route('settings', './page.tsx'),
          ]),
        ]),
      ]);`,
    );
    await file('src/page.tsx', page);
    await file('src/layout.tsx', page);
    expect(await resolveSitemap({ root })).toEqual([
      ['projects', ''],
      ['projects/:id', ''],
      ['projects/:id', ''],
      ['projects/:id/settings', ''],
    ]);
  });

  it('rejects registry mutations instead of silently publishing an empty sitemap', async () => {
    await file(
      'src/routes.ts',
      `${dsl}
       const routes = [];
       routes.push(index('./page.tsx'));
       export default routes;`,
    );
    await file('src/page.tsx', page);
    await expect(resolveSitemap({ root })).rejects.toThrow('mutable');
  });

  it.each([
    `const schema = { description: 'Before' }; schema.description = 'After';
     export const handle = { route: schema };`,
    `const params = { id: 'Before' }; const alias = params; mutate(alias);
     export const handle = { route: { params } };`,
    `export const handle = { route: { description: 'Before' } };
     const { route: schema } = handle; schema.description = 'After';`,
    `const schema = {
       description: 'Before',
       get icon() { this.description = 'After'; return 'icon'; },
     };
     const icon = schema.icon;
     export const handle = { route: schema };`,
    `const schema = { description: 'Before' };
     const icon = ({
       schema,
       get icon() { this.schema.description = 'After'; return 'icon'; },
     }).icon;
     export const handle = { route: schema };`,
  ])('rejects mutable page metadata instead of publishing stale descriptions', async (metadata) => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file('src/page.tsx', `${page} ${metadata}`);
    await expect(resolveSitemap({ root })).rejects.toThrow('mutable');
  });

  it.each([
    'const icon = schema.icon;',
    'const { description, ...ui } = schema;',
    'const ui = { ...schema };',
  ])('rejects getter/setter pairs invoked by reads or copies: %s', async (read) => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file(
      'src/page.tsx',
      `${page}
       const schema = {
         description: 'Before',
         get icon() { this.description = 'After'; return 'icon'; },
         set icon(value) {},
       };
       ${read}
       export const handle = { route: schema };`,
    );
    await expect(resolveSitemap({ root })).rejects.toThrow('mutable');
  });

  it('accepts primitive metadata copied into an unrelated accessor receiver', async () => {
    await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
    await file(
      'src/page.tsx',
      `${page}
       const description = 'Home';
       const ui = { description, get icon() { return 'icon'; } };
       const icon = ui.icon;
       export const handle = { route: { description } };`,
    );
    expect(await resolveSitemap({ root })).toEqual([['/', 'Home']]);
  });

  it.each(['const title = handle.route.description;', 'const copy = { ...handle.route };'])(
    'accepts literal metadata when an unrelated getter is never invoked: %s',
    async (read) => {
      await file('src/routes.ts', `${dsl} export default index('./page.tsx');`);
      await file(
        'src/page.tsx',
        `${page}
       export const handle = {
         route: { description: 'Home' },
         get description() { throw new Error('Unused getter must not execute'); },
       };
       ${read}`,
      );
      expect(await resolveSitemap({ root })).toEqual([['/', 'Home']]);
    },
  );

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
