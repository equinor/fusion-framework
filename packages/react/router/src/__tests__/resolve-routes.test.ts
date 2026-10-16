// @vitest-environment node
import { chmod, readdir, rename, rm, symlink } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { existsSync } from 'node:fs';

import {
  assertRouteGraph,
  type ResolvedRouteGraph,
  RouteResolutionError,
  resolveRoutes,
} from '../build/index.js';
import { findCaseCollisions } from '../build/find-case-collisions.js';
import { toProjectPath } from '../build/to-project-path.js';
import {
  conventionProject,
  createRouteProject,
  excludedFiles,
  explodingPage,
  layoutModule,
  page,
  type RouteProjectFiles,
  removeRouteProject,
  routeDslSpecifier,
  sideEffectPage,
  writeRouteProjectFiles,
} from './fixtures/route-projects.js';

const roots: string[] = [];

/**
 * Creates a temporary fixture project that is removed after the test.
 *
 * @param files - Fixture files.
 * @returns Absolute project root.
 */
const project = async (files: RouteProjectFiles): Promise<string> => {
  const root = await createRouteProject(files);
  roots.push(root);
  return root;
};

/**
 * Builds registry source importing the public route DSL entry.
 *
 * @param body - Registry body.
 * @returns Registry module source.
 */
const registry = (body: string): string =>
  `import { index, layout, prefix, route } from ${JSON.stringify(routeDslSpecifier)};\n${body}\n`;

/**
 * Projects a graph onto the fields most assertions care about.
 *
 * @param graph - Resolved graph.
 * @returns Compact route tuples.
 */
const shape = (graph: ResolvedRouteGraph): string[] =>
  graph.routes.map((route) => `${route.kind} ${route.path} ${route.id} <- ${route.parentId}`);

/**
 * Lists diagnostic codes with their files.
 *
 * @param graph - Resolved graph.
 * @returns Code and files per diagnostic.
 */
const problems = (graph: ResolvedRouteGraph): Array<[string, string[]]> =>
  graph.diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.files]);

afterEach(async () => {
  await Promise.all(roots.splice(0).map(removeRouteProject));
});

describe('resolveRoutes: file-route discovery', () => {
  it('resolves the convention table into the canonical graph', async () => {
    const root = await project(conventionProject);
    const graph = await resolveRoutes({ root });

    expect(graph.source).toEqual({ kind: 'discovery', directory: 'src/routes' });
    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes).toEqual([
      {
        id: 'file:src/routes/layout.tsx',
        parentId: null,
        kind: 'layout',
        path: '/',
        module: 'src/routes/layout.tsx',
        capabilities: ['component'],
        metadata: {},
      },
      {
        id: 'file:src/routes/index.tsx',
        parentId: 'file:src/routes/layout.tsx',
        kind: 'index',
        path: '/',
        module: 'src/routes/index.tsx',
        capabilities: ['component'],
        metadata: {},
      },
      {
        id: 'file:src/routes/about.ts',
        parentId: 'file:src/routes/layout.tsx',
        kind: 'route',
        path: '/about',
        module: 'src/routes/about.ts',
        capabilities: ['clientLoader'],
        metadata: {},
      },
      {
        id: 'file:src/routes/projects/layout.tsx',
        parentId: 'file:src/routes/layout.tsx',
        kind: 'layout',
        path: '/projects',
        module: 'src/routes/projects/layout.tsx',
        capabilities: ['component'],
        metadata: {},
      },
      {
        id: 'file:src/routes/projects/index.tsx',
        parentId: 'file:src/routes/projects/layout.tsx',
        kind: 'index',
        path: '/projects',
        module: 'src/routes/projects/index.tsx',
        capabilities: ['component'],
        metadata: {},
      },
      {
        id: 'file:src/routes/projects/[projectId]/index.tsx',
        parentId: 'file:src/routes/projects/layout.tsx',
        kind: 'index',
        path: '/projects/:projectId',
        module: 'src/routes/projects/[projectId]/index.tsx',
        capabilities: ['component', 'handle'],
        metadata: {},
      },
      {
        id: 'file:src/routes/projects/[projectId]/reports.tsx',
        parentId: 'file:src/routes/projects/layout.tsx',
        kind: 'route',
        path: '/projects/:projectId/reports',
        module: 'src/routes/projects/[projectId]/reports.tsx',
        capabilities: ['component', 'action'],
        metadata: {},
      },
    ]);
    expect(graph.dependencies).toEqual(Object.keys(conventionProject).sort());
  });

  it('ignores tests, declarations, private, hidden and non-module files', async () => {
    const root = await project({ ...conventionProject, ...excludedFiles });
    const graph = await resolveRoutes({ root });

    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map((route) => route.module).sort()).toEqual(
      Object.keys(conventionProject).sort(),
    );
  });

  it('produces identical graphs regardless of project location', async () => {
    const first = await resolveRoutes({ root: await project(conventionProject) });
    const second = await resolveRoutes({ root: await project(conventionProject) });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('roots routes without a layout and resolves a custom directory against the project root', async () => {
    const root = await project({
      'app/pages/index.tsx': page,
      'app/pages/[id].tsx': page,
    });
    const graph = await resolveRoutes({ root, directory: 'app/pages' });

    expect(graph.source).toEqual({ kind: 'discovery', directory: 'app/pages' });
    expect(shape(graph)).toEqual([
      'index / file:app/pages/index.tsx <- null',
      'route /:id file:app/pages/[id].tsx <- null',
    ]);
  });

  it('returns an empty graph when no route source exists', async () => {
    const root = await project({ 'src/main.tsx': page });
    const graph = await resolveRoutes({ root });

    expect(graph).toEqual({
      source: { kind: 'none', directory: 'src/routes' },
      routes: [],
      diagnostics: [],
      dependencies: [],
    });
  });

  it('rejects a relative project root and a route directory outside the root', async () => {
    await expect(resolveRoutes({ root: 'relative/app' })).rejects.toThrow(TypeError);

    const root = await project({});
    const graph = await resolveRoutes({ root, directory: '../elsewhere' });
    expect(problems(graph)).toEqual([['route-file-outside-root', ['../elsewhere']]]);
  });
});

describe('resolveRoutes: discovery diagnostics', () => {
  it('reports duplicate URL matches with the conflicting files', async () => {
    const root = await project({
      'src/routes/about.tsx': page,
      'src/routes/about/index.tsx': page,
      'src/routes/items/[id].tsx': page,
      'src/routes/items/[slug]/index.tsx': page,
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['duplicate-route-path', ['src/routes/about.tsx', 'src/routes/about/index.tsx']],
      ['duplicate-route-path', ['src/routes/items/[id].tsx', 'src/routes/items/[slug]/index.tsx']],
    ]);
    expect(graph.diagnostics[0].message).toContain('/about');
  });

  it('reports several index or layout modules in one directory', async () => {
    const root = await project({
      'src/routes/index.ts': page,
      'src/routes/index.tsx': page,
      'src/routes/layout.ts': layoutModule,
      'src/routes/layout.tsx': layoutModule,
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['duplicate-index', ['src/routes/index.ts', 'src/routes/index.tsx']],
      ['duplicate-layout', ['src/routes/layout.ts', 'src/routes/layout.tsx']],
    ]);
  });

  it('reports invalid and unsupported segments, pointing at explicit DSL for advanced shapes', async () => {
    const root = await project({
      'src/routes/[1id].tsx': page,
      'src/routes/[]/index.tsx': page,
      'src/routes/[...slug].tsx': page,
      'src/routes/[[lang]]/index.tsx': page,
      'src/routes/a b.tsx': page,
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['unsupported-route-segment', ['src/routes/[...slug].tsx']],
      ['invalid-dynamic-segment', ['src/routes/[1id].tsx']],
      ['unsupported-route-segment', ['src/routes/[[lang]]']],
      ['invalid-dynamic-segment', ['src/routes/[]']],
      ['unsupported-route-segment', ['src/routes/a b.tsx']],
    ]);
    expect(graph.diagnostics[0].message).toContain('explicit route DSL');
    expect(graph.routes).toEqual([]);
  });

  it('treats URLs that differ only by case as duplicates', async () => {
    const root = await project({
      'src/routes/Projects/index.tsx': page,
      'src/routes/projects.tsx': page,
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['case-collision', ['src/routes/Projects', 'src/routes/projects.tsx']],
      ['duplicate-route-path', ['src/routes/Projects/index.tsx', 'src/routes/projects.tsx']],
    ]);
  });

  it('detects case-only name collisions independent of the file system', () => {
    expect(findCaseCollisions(['About', 'about', 'index', 'ABOUT', 'users'])).toEqual([
      ['ABOUT', 'About', 'about'],
    ]);
    expect(findCaseCollisions(['index', 'index', 'layout'])).toEqual([]);
  });

  it('reports modules without a component, loader or action', async () => {
    const root = await project({
      'src/routes/index.tsx': page,
      'src/routes/utils.ts': 'export const format = (value: string) => value;\n',
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([['missing-route-capability', ['src/routes/utils.ts']]]);
    expect(graph.diagnostics[0].message).toContain('private "_" path');
  });
});

describe('resolveRoutes: explicit route registry', () => {
  it('uses src/routes/routes.ts instead of merging with discovered files', async () => {
    const root = await project({
      ...conventionProject,
      'src/routes/extra.tsx': page,
      'src/routes/routes.ts': registry(`
        export const pages = [
          index('./index.tsx', { description: 'Home' }),
          prefix('projects', [
            layout('./projects/layout.tsx', [
              index('./projects/index.tsx'),
              route(':projectId', './projects/[projectId]/index.tsx', [], {
                description: 'Project',
                params: { projectId: 'Project context ID' },
              }),
            ]),
          ]),
        ];
        export default layout('./layout.tsx', pages);
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.source).toEqual({ kind: 'registry', file: 'src/routes/routes.ts' });
    expect(graph.diagnostics).toEqual([]);
    expect(shape(graph)).toEqual([
      'layout / file:src/routes/layout.tsx <- null',
      'index / file:src/routes/index.tsx <- file:src/routes/layout.tsx',
      'layout /projects file:src/routes/projects/layout.tsx <- file:src/routes/layout.tsx',
      'index /projects file:src/routes/projects/index.tsx <- file:src/routes/projects/layout.tsx',
      'route /projects/:projectId file:src/routes/projects/[projectId]/index.tsx <- file:src/routes/projects/layout.tsx',
    ]);
    expect(graph.routes[1].metadata).toEqual({ description: 'Home' });
    expect(graph.routes[4].metadata).toEqual({
      description: 'Project',
      params: { projectId: 'Project context ID' },
    });
    expect(graph.dependencies).toContain('src/routes/routes.ts');
    expect(graph.dependencies).not.toContain('src/routes/extra.tsx');
  });

  it('never evaluates route modules referenced by the registry', async () => {
    const root = await project({
      'src/pages/home.tsx': explodingPage,
      'src/registry.ts': registry(`export const routes = [index('../src/pages/home.tsx')];`),
    });
    const graph = await resolveRoutes({ root, routesFile: 'src/registry.ts' });

    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes[0]).toMatchObject({
      id: 'file:src/pages/home.tsx',
      capabilities: ['component', 'clientLoader'],
    });
  });

  it('supports advanced DSL shapes, module reuse and import.meta.resolve references', async () => {
    const root = await project({
      'src/pages/shell.tsx': layoutModule,
      'src/pages/docs.tsx': page,
      'src/pages/not-found.tsx': page,
      'src/pages/list.tsx': page,
      'src/routes/routes.ts': registry(`
        export default [
          layout(import.meta.resolve('../pages/shell.tsx'), [
            route(':lang?/docs', '../pages/docs'),
            prefix('a', [route('items', '../pages/list.tsx')]),
            prefix('b', [route('items', '../pages/list.tsx')]),
            route('*', '../pages/not-found.tsx'),
          ]),
        ];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.diagnostics).toEqual([]);
    expect(shape(graph)).toEqual([
      'layout / file:src/pages/shell.tsx <- null',
      'route /* file:src/pages/not-found.tsx <- file:src/pages/shell.tsx',
      'route /:lang?/docs file:src/pages/docs.tsx <- file:src/pages/shell.tsx',
      'route /a/items file:src/pages/list.tsx#route:/a/items <- file:src/pages/shell.tsx',
      'route /b/items file:src/pages/list.tsx#route:/b/items <- file:src/pages/shell.tsx',
    ]);
  });

  it('treats a route with an index child at the same URL as a wrapper, not a duplicate', async () => {
    const root = await project({
      'src/pages/products.tsx': page,
      'src/pages/products-index.tsx': page,
      'src/routes/routes.ts': registry(`
        export default [route('products', '../pages/products.tsx', [index('../pages/products-index.tsx')])];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map((route) => route.parentId)).toEqual([
      null,
      'file:src/pages/products.tsx',
    ]);
  });

  it('reports registry problems with the registry and module paths', async () => {
    const root = await project({
      'src/pages/a.tsx': page,
      'src/pages/b.tsx': page,
      'src/pages/helper.ts': 'export const helper = 1;\n',
      'src/routes/routes.ts': registry(`
        export default [
          route('same', '../pages/a.tsx'),
          route('same', '../pages/b.tsx'),
          route('missing', '../pages/missing.tsx'),
          route(':1bad', '../pages/helper.ts'),
          { path: 'plain', lazy: () => null },
        ];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['duplicate-route-path', ['src/pages/a.tsx', 'src/pages/b.tsx']],
      ['invalid-dynamic-segment', ['src/pages/helper.ts', 'src/routes/routes.ts']],
      ['missing-route-capability', ['src/pages/helper.ts']],
      ['unresolved-route-file', ['src/pages/missing.tsx', 'src/routes/routes.ts']],
      ['invalid-route-registry', ['src/routes/routes.ts']],
    ]);
    const unresolved = graph.diagnostics.find((d) => d.code === 'unresolved-route-file');
    expect(unresolved?.message).toContain(
      'src/routes/routes.ts: route module "src/pages/missing.tsx" does not exist.',
    );
  });

  it('reports route modules outside the project root', async () => {
    const outside = await project({ 'shared/page.tsx': page });
    const root = await project({
      'src/routes/routes.ts': registry(
        `export default [index(${JSON.stringify(path.join(outside, 'shared/page.tsx'))})];`,
      ),
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([['route-file-outside-root', ['src/routes/routes.ts']]]);
  });

  it('reports missing, ambiguous, empty and failing registries', async () => {
    const missing = await resolveRoutes({
      root: await project(conventionProject),
      routesFile: 'src/app-routes.ts',
    });
    expect(missing.source).toEqual({ kind: 'registry', file: 'src/app-routes.ts' });
    expect(problems(missing)).toEqual([['missing-routes-file', ['src/app-routes.ts']]]);

    const ambiguous = await resolveRoutes({
      root: await project({
        'src/routes/routes.ts': registry('export default [];'),
        'src/routes/routes.tsx': registry('export default [];'),
      }),
    });
    expect(problems(ambiguous)).toEqual([
      ['ambiguous-route-registry', ['src/routes/routes.ts', 'src/routes/routes.tsx']],
    ]);

    const empty = await resolveRoutes({
      root: await project({ 'src/routes/routes.ts': 'export const other = 1;\n' }),
    });
    expect(problems(empty)).toEqual([['invalid-route-registry', ['src/routes/routes.ts']]]);

    const failing = await resolveRoutes({
      root: await project({ 'src/routes/routes.ts': 'export default [;\n' }),
    });
    expect(problems(failing)).toEqual([['route-registry-load-failed', ['src/routes/routes.ts']]]);
  });
});

describe('resolveRoutes: registry call sites and isolation', () => {
  it('resolves relative references at the declaring registry module', async () => {
    const root = await project({
      'src/routes/Page.tsx': page,
      'src/routes/admin/Page.tsx': `${page}export const clientLoader = () => null;\n`,
      'src/routes/admin/users/Page.tsx': `${page}export const action = async () => null;\n`,
      'src/routes/admin/admin.routes.ts': registry(`
        import { userRoutes } from './users/users.routes';
        export const adminRoutes = prefix('admin', [index('./Page.tsx'), ...userRoutes]);
      `),
      'src/routes/admin/users/users.routes.ts': registry(
        `export const userRoutes = [route('users', './Page.tsx')];`,
      ),
      'src/routes/routes.ts': registry(`
        import { adminRoutes } from './admin/admin.routes';
        export default [index('./Page.tsx'), adminRoutes];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map((route) => [route.path, route.id, route.capabilities])).toEqual([
      ['/', 'file:src/routes/Page.tsx', ['component']],
      ['/admin', 'file:src/routes/admin/Page.tsx', ['component', 'clientLoader']],
      ['/admin/users', 'file:src/routes/admin/users/Page.tsx', ['component', 'action']],
    ]);
    expect(graph.dependencies).toEqual(
      expect.arrayContaining([
        'src/routes/routes.ts',
        'src/routes/admin/admin.routes.ts',
        'src/routes/admin/users/users.routes.ts',
      ]),
    );

    // Editing an imported helper registry must be visible on the next resolution
    await writeRouteProjectFiles(root, {
      'src/routes/admin/users/users.routes.ts': registry(
        `export const userRoutes = [route('people', './Page.tsx')];`,
      ),
    });
    const edited = await resolveRoutes({ root });
    expect(edited.routes.map((route) => route.path)).toEqual(['/', '/admin', '/admin/people']);
  });

  it('evaluates every resolution in a fresh, released context without writing files', async () => {
    const root = await project({
      'src/routes/Page.tsx': page,
      'src/routes/routes.ts': registry(`
        const state = globalThis as { evaluations?: number };
        state.evaluations = (state.evaluations ?? 0) + 1;
        export default [route(String(state.evaluations), './Page.tsx')];
      `),
    });
    const listing = async (): Promise<string[]> =>
      (await readdir(root, { recursive: true })).map(String).sort();
    const before = await listing();
    const resources = process.getActiveResourcesInfo().length;

    // Repeated resolution must neither share module state nor accumulate resources
    for (let run = 0; run < 15; run++) {
      const graph = await resolveRoutes({ root });
      expect(graph.routes.map((route) => route.path)).toEqual(['/1']);
    }

    expect(await listing()).toEqual(before);
    expect(process.getActiveResourcesInfo().length).toBeLessThanOrEqual(resources);
    expect((globalThis as { evaluations?: number }).evaluations).toBeUndefined();
  });

  it('never evaluates discovered or registry-referenced page modules', async () => {
    const discovered = await project({ 'src/routes/index.tsx': sideEffectPage('ran.txt') });
    const discoveredGraph = await resolveRoutes({ root: discovered });
    expect(discoveredGraph.diagnostics).toEqual([]);
    expect(discoveredGraph.routes[0]?.capabilities).toEqual(['component', 'clientLoader']);
    expect(existsSync(path.join(discovered, 'src/routes/ran.txt'))).toBe(false);

    const referenced = await project({
      'src/routes/Page.tsx': sideEffectPage('ran.txt'),
      'src/routes/routes.ts': registry(`export default [index('./Page.tsx')];`),
    });
    const referencedGraph = await resolveRoutes({ root: referenced });
    expect(referencedGraph.diagnostics).toEqual([]);
    expect(referencedGraph.routes[0]?.capabilities).toEqual(['component', 'clientLoader']);
    expect(existsSync(path.join(referenced, 'src/routes/ran.txt'))).toBe(false);
  });

  it('rejects registries that import page modules before evaluating anything', async () => {
    const root = await project({
      'src/routes/Page.tsx': sideEffectPage('ran.txt'),
      'src/routes/routes.ts': registry(`
        import Page from './Page.tsx';
        export default [index('./Page.tsx')];
        export const component = Page;
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.routes).toEqual([]);
    expect(graph.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'unsupported-registry-import',
    );
    expect(
      graph.diagnostics.find((d) => d.files.includes('src/routes/Page.tsx'))?.message,
    ).toContain('src/routes/routes.ts');
    expect(graph.dependencies).toEqual(['src/routes/Page.tsx', 'src/routes/routes.ts']);
    expect(existsSync(path.join(root, 'src/routes/ran.txt'))).toBe(false);
  });

  it('rejects page modules that also declare routes', async () => {
    const root = await project({
      'src/routes/Page.tsx': [
        registry('export const nested = [index("./Other.tsx")];'),
        "throw new Error('page module must not be evaluated');",
        'export default function Page() { return null; }',
        'export const clientLoader = () => null;',
      ].join('\n'),
      'src/routes/Other.tsx': page,
      'src/routes/routes.ts': registry(`
        import { nested } from './Page.tsx';
        export default [index('./Page.tsx'), prefix('x', nested)];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(problems(graph)).toEqual([
      ['unsupported-registry-import', ['src/routes/Page.tsx', 'src/routes/routes.ts']],
    ]);
  });

  it('rejects package, built-in and plain helper imports in registries', async () => {
    const root = await project({
      'src/routes/Page.tsx': page,
      'src/routes/paths.ts': "export const home = 'home';\n",
      'src/routes/routes.ts': registry(`
        import { join } from 'node:path';
        import { home } from './paths';
        export default [route(join(home), './Page.tsx')];
      `),
    });
    const graph = await resolveRoutes({ root });

    expect(graph.routes).toEqual([]);
    const messages = graph.diagnostics.map(
      (diagnostic) => `${diagnostic.code} ${diagnostic.message}`,
    );
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^unsupported-registry-import .*node:path/),
        expect.stringMatching(/^unsupported-registry-import .*src\/routes\/paths\.ts/),
      ]),
    );
  });

  it('reports registries that throw during evaluation', async () => {
    const graph = await resolveRoutes({
      root: await project({
        'src/routes/routes.ts': registry(`throw new Error('registry exploded');`),
      }),
    });

    expect(problems(graph)).toEqual([['route-registry-load-failed', ['src/routes/routes.ts']]]);
    expect(graph.diagnostics[0]?.message).toContain('registry exploded');
  });
});

describe('resolveRoutes: registry IDs for reused modules', () => {
  it('gives reused modules unique, deterministic IDs per graph location', async () => {
    const files = {
      'src/pages/shell.tsx': layoutModule,
      'src/pages/other-shell.tsx': layoutModule,
      'src/pages/list.tsx': page,
      'src/routes/routes.ts': registry(`
        export default [
          prefix('a', [layout('../pages/shell.tsx', [index('../pages/list.tsx')])]),
          prefix('b', [layout('../pages/shell.tsx', [route('items', '../pages/list.tsx')])]),
          layout('../pages/other-shell.tsx', [route('dup', '../pages/list.tsx')]),
          layout('../pages/shell.tsx', [route('dup', '../pages/list.tsx')]),
        ];
      `),
    };
    const first = await resolveRoutes({ root: await project(files) });
    const second = await resolveRoutes({ root: await project(files) });

    expect(shape(first)).toEqual(shape(second));
    expect(shape(first)).toEqual([
      'layout / file:src/pages/other-shell.tsx <- null',
      'route /dup file:src/pages/list.tsx#route:/dup <- file:src/pages/other-shell.tsx',
      'layout / file:src/pages/shell.tsx#layout:/ <- null',
      'route /dup file:src/pages/list.tsx#route:/dup~2 <- file:src/pages/shell.tsx#layout:/',
      'layout /a file:src/pages/shell.tsx#layout:/a <- null',
      'index /a file:src/pages/list.tsx#index:/a <- file:src/pages/shell.tsx#layout:/a',
      'layout /b file:src/pages/shell.tsx#layout:/b <- null',
      'route /b/items file:src/pages/list.tsx#route:/b/items <- file:src/pages/shell.tsx#layout:/b',
    ]);
    expect(new Set(first.routes.map((route) => route.id)).size).toBe(first.routes.length);
    expect(problems(first)).toEqual([['duplicate-route-path', ['src/pages/list.tsx']]]);
  });
});

describe('resolveRoutes: file system failures', () => {
  const unprivileged = process.platform !== 'win32' && process.getuid?.() !== 0;

  it.runIf(unprivileged)(
    'reports unreadable route modules and folders instead of skipping them',
    async () => {
      const root = await project({
        'src/routes/index.tsx': page,
        'src/routes/secret.tsx': page,
        'src/routes/locked/index.tsx': page,
      });
      const lockedFile = path.join(root, 'src/routes/secret.tsx');
      const lockedDir = path.join(root, 'src/routes/locked');
      await chmod(lockedFile, 0o000);
      await chmod(lockedDir, 0o000);
      try {
        const graph = await resolveRoutes({ root });
        expect(problems(graph)).toEqual([
          ['route-file-unreadable', ['src/routes/locked']],
          ['route-file-unreadable', ['src/routes/secret.tsx']],
        ]);
      } finally {
        await chmod(lockedFile, 0o644);
        await chmod(lockedDir, 0o755);
      }
    },
  );

  it.runIf(unprivileged)('reports unreadable registry-referenced modules', async () => {
    const root = await project({
      'src/pages/locked/page.tsx': page,
      'src/routes/routes.ts': registry(`export default [index('../pages/locked/page.tsx')];`),
    });
    const lockedDir = path.join(root, 'src/pages/locked');
    await chmod(lockedDir, 0o000);
    try {
      const graph = await resolveRoutes({ root });
      expect(problems(graph)).toEqual([
        ['route-file-unreadable', ['src/pages/locked/page.tsx', 'src/routes/routes.ts']],
      ]);
    } finally {
      await chmod(lockedDir, 0o755);
    }
  });

  it.runIf(process.platform !== 'win32')('skips dangling symlinks', async () => {
    const root = await project({ 'src/routes/index.tsx': page });
    await symlink(path.join(root, 'missing.tsx'), path.join(root, 'src/routes/gone.tsx'));
    const graph = await resolveRoutes({ root });

    expect(graph.diagnostics).toEqual([]);
    expect(graph.routes.map((route) => route.id)).toEqual(['file:src/routes/index.tsx']);
  });
});

describe('resolveRoutes: incremental changes', () => {
  it('reflects added, removed and moved files and a registry appearing', async () => {
    const root = await project(conventionProject);
    const ids = async (): Promise<string[]> =>
      (await resolveRoutes({ root })).routes.map((route) => route.id);

    await writeRouteProjectFiles(root, { 'src/routes/settings.tsx': page });
    expect(await ids()).toContain('file:src/routes/settings.tsx');

    await rm(path.join(root, 'src/routes/about.ts'));
    expect(await ids()).not.toContain('file:src/routes/about.ts');

    await rename(
      path.join(root, 'src/routes/settings.tsx'),
      path.join(root, 'src/routes/projects/settings.tsx'),
    );
    const moved = await resolveRoutes({ root });
    expect(moved.routes.map((route) => route.id)).not.toContain('file:src/routes/settings.tsx');
    expect(
      moved.routes.find((route) => route.id === 'file:src/routes/projects/settings.tsx'),
    ).toMatchObject({
      path: '/projects/settings',
      parentId: 'file:src/routes/projects/layout.tsx',
    });

    await writeRouteProjectFiles(root, {
      'src/routes/routes.ts': registry(`export default [index('./index.tsx')];`),
    });
    expect(await ids()).toEqual(['file:src/routes/index.tsx']);

    await writeRouteProjectFiles(root, {
      'src/routes/routes.ts': registry(`export default [route('about', './index.tsx')];`),
    });
    const edited = await resolveRoutes({ root });
    expect(edited.routes.map((route) => route.path)).toEqual(['/about']);
  });
});

describe('assertRouteGraph', () => {
  it('returns a graph without errors', async () => {
    const graph = await resolveRoutes({ root: await project(conventionProject) });
    expect(assertRouteGraph(graph)).toBe(graph);
  });

  it('throws RouteResolutionError listing every error and its files', async () => {
    const graph = await resolveRoutes({
      root: await project({ 'src/routes/a.tsx': page, 'src/routes/a/index.tsx': page }),
    });

    expect(() => assertRouteGraph(graph)).toThrow(RouteResolutionError);
    try {
      assertRouteGraph(graph);
    } catch (error) {
      expect((error as RouteResolutionError).diagnostics).toHaveLength(1);
      expect((error as Error).message).toContain('src/routes/a.tsx, src/routes/a/index.tsx');
    }
  });
});

describe('toProjectPath', () => {
  it('normalizes Windows paths to forward slashes and rejects paths outside the root', () => {
    expect(toProjectPath('C:\\repo\\app', 'C:\\repo\\app\\src\\routes\\[id].tsx', path.win32)).toBe(
      'src/routes/[id].tsx',
    );
    expect(toProjectPath('C:\\repo\\app', 'D:\\other\\page.tsx', path.win32)).toBeNull();
    expect(toProjectPath('/repo/app', '/repo/other/page.tsx', path.posix)).toBeNull();
    expect(toProjectPath('/repo/app', '/repo/app', path.posix)).toBeNull();
  });
});
