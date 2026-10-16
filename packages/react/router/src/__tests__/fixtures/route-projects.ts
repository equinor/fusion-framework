import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Project files keyed by project-relative path. */
export type RouteProjectFiles = Record<string, string>;

/** Absolute path of the route DSL source, so registry fixtures exercise the real DSL helpers. */
export const routeDslModule = fileURLToPath(new URL('../../routes/index.ts', import.meta.url));

/** A page module exporting a default component. */
export const page = 'export default function Page() { return null; }\n';

/** A layout module exporting a default component. */
export const layoutModule = 'export default function Layout() { return null; }\n';

/**
 * A page module whose evaluation throws, proving that resolution never imports route modules.
 */
export const explodingPage = [
  "throw new Error('route module must not be evaluated during route resolution');",
  'export default function Page() { return null; }',
  'export const clientLoader = () => null;',
  '',
].join('\n');

/**
 * The convention table from the routing specification, plus a loader-only `.ts` module.
 */
export const conventionProject: RouteProjectFiles = {
  'src/routes/layout.tsx': layoutModule,
  'src/routes/index.tsx': page,
  'src/routes/about.ts': 'export async function clientLoader() { return null; }\n',
  'src/routes/projects/layout.tsx': layoutModule,
  'src/routes/projects/index.tsx': page,
  'src/routes/projects/[projectId]/index.tsx': `${page}export const handle = { route: {} };\n`,
  'src/routes/projects/[projectId]/reports.tsx': `${page}export const action = async () => null;\n`,
};

/** Files inside the route directory that must never become routes. */
export const excludedFiles: RouteProjectFiles = {
  'src/routes/index.test.tsx': page,
  'src/routes/index.spec.ts': page,
  'src/routes/env.d.ts': 'declare const value: string;\n',
  'src/routes/_helpers.ts': 'export const helper = 1;\n',
  'src/routes/_private/page.tsx': page,
  'src/routes/__tests__/page.tsx': page,
  'src/routes/__mocks__/page.tsx': page,
  'src/routes/.hidden/page.tsx': page,
  'src/routes/.page.tsx': page,
  'src/routes/styles.css': 'body {}\n',
  'src/routes/notes.md': '# notes\n',
  'src/routes/legacy.js': page,
};

/**
 * Creates a temporary project from fixture files.
 *
 * @param files - Files keyed by project-relative path.
 * @returns Absolute project root.
 */
export async function createRouteProject(files: RouteProjectFiles): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'fusion-routes-'));
  await writeRouteProjectFiles(root, files);
  return root;
}

/**
 * Writes fixture files into an existing project, creating folders as needed.
 *
 * @param root - Absolute project root.
 * @param files - Files keyed by project-relative path.
 */
export async function writeRouteProjectFiles(
  root: string,
  files: RouteProjectFiles,
): Promise<void> {
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

/**
 * Removes a temporary project.
 *
 * @param root - Absolute project root.
 */
export async function removeRouteProject(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
