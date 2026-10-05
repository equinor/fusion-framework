import { readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { readHelpArticles, readHelpFaqs } from '@equinor/fusion-openapi-mock-server/presets/fusion';

/** Where a resolved help docs folder came from, for the mock server's startup log. */
export type HelpDocsSource = 'option' | 'config' | 'plugin' | 'detected';

/** Setting names used in startup errors, so a misconfigured folder points at its origin. */
const SETTING_NAMES: Record<Exclude<HelpDocsSource, 'detected'>, string> = {
  option: '--help-docs',
  config: 'mockServer.helpDocs in dev-server.config.ts',
  plugin: 'mockServerPlugin({ helpDocs })',
};

/** A help docs folder the mock server serves as the `help` service. */
export interface ResolvedHelpDocs {
  /** Absolute help docs folder (the folder itself, or its parent when articles live in `articles/`). */
  dir: string;
  /** Number of help articles found at startup. */
  articleCount: number;
  /** Number of FAQs found at startup. */
  faqCount: number;
  /** How the folder was chosen. */
  source: HelpDocsSource;
}

/** Inputs for {@link resolveHelpDocs}, in descending precedence. */
export interface ResolveHelpDocsOptions {
  /** Receives a message when an auto-detect candidate is skipped because it cannot be read. Defaults to `console.warn`. */
  warn?: (message: string) => void;
  /** `--help-docs <dir>` (string) or `--no-help-docs` (`false`). */
  option?: string | false;
  /** `mockServer.helpDocs` from `dev-server.config.ts`. */
  config?: string | false;
  /** `helpDocs` passed to `mockServerPlugin()` in `fusion-cli.config.ts`. */
  defaults?: string | false;
}

/**
 * Counts the help articles and FAQs in a help docs folder.
 *
 * @param dir - Help docs folder.
 * @returns Article and FAQ counts.
 */
async function countHelpDocs(dir: string): Promise<{ articleCount: number; faqCount: number }> {
  const [articles, faqs] = await Promise.all([readHelpArticles(dir), readHelpFaqs(dir)]);
  return { articleCount: articles.length, faqCount: faqs.length };
}

/**
 * Checks whether a path is an existing directory.
 *
 * @param path - Candidate path.
 * @returns `true` when the path exists and is a directory.
 */
async function isDirectory(path: string): Promise<boolean> {
  const stats = await stat(path).catch(() => undefined);
  return stats?.isDirectory() ?? false;
}

/**
 * Reads the app key the Fusion CLI derives from `package.json` (the name without its npm scope).
 *
 * @param root - Project root.
 * @returns The app key, or `undefined` when there is no readable package name.
 */
async function readAppKey(root: string): Promise<string | undefined> {
  try {
    const { name } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {
      name?: unknown;
    };
    return typeof name === 'string' ? name.replace(/^@[^/]+\//, '') : undefined;
  } catch {
    // Auto-detection is best effort; a project without package.json simply has no app-key lookup.
    return undefined;
  }
}

/**
 * Lists auto-detect candidates: the project's own `docs` folder, then `docs/<appKey>` in the
 * project and each parent folder up to the repository root (the Fusion core apps layout).
 *
 * @param root - Project root.
 * @returns Candidate help docs folders in search order.
 */
async function listCandidates(root: string): Promise<string[]> {
  const candidates = [join(root, 'docs')];
  const appKey = await readAppKey(root);
  // Without an app key there is no `docs/<appKey>` convention to follow.
  if (!appKey) return candidates;

  let current = root;
  // Walk up to the repository root so detection never reaches unrelated folders above it.
  while (true) {
    candidates.push(join(current, 'docs', appKey));
    const isRepositoryRoot =
      (await stat(join(current, '.git')).catch(() => undefined)) !== undefined ||
      (await stat(join(current, 'pnpm-workspace.yaml')).catch(() => undefined)) !== undefined;
    const parent = dirname(current);
    // Stop at the repository root, or at the filesystem root when there is no repository marker.
    if (isRepositoryRoot || parent === current) break;
    current = parent;
  }
  return candidates;
}

/**
 * Resolves the help docs folder `ffc mock-server` serves as a local `help` service, so the
 * dev portal can show the help articles an app opens with `useHelpCenter().openArticle()`.
 *
 * Precedence: `--help-docs` / `--no-help-docs`, then `mockServer.helpDocs`, then the plugin
 * default, then auto-detection. `false` at any level turns help docs off. A configured folder
 * is relative to `root` and must exist; it is served even when it has no articles yet.
 * Auto-detection only picks a folder that contains at least one help article or FAQ, and is best
 * effort: a candidate that cannot be read (e.g. a project docs file with invalid frontmatter) is
 * skipped with a warning, so projects that never opted in still start.
 *
 * @param root - Project root that relative paths resolve from.
 * @param options - Command-line, config, and plugin-default settings.
 * @returns The folder to serve, or `undefined` when help docs are off or none were found.
 * @throws {Error} When a configured folder does not exist, or a document in it has malformed frontmatter.
 *
 * @example
 * ```typescript
 * const helpDocs = await resolveHelpDocs(process.cwd(), { config: '../docs/my-app' });
 * if (helpDocs) server.use([defineHelpArticlesMock({ dir: helpDocs.dir })]);
 * ```
 */
export async function resolveHelpDocs(
  root: string,
  options: ResolveHelpDocsOptions = {},
): Promise<ResolvedHelpDocs | undefined> {
  const explicit: [string | false, Exclude<HelpDocsSource, 'detected'>] | undefined =
    options.option !== undefined
      ? [options.option, 'option']
      : options.config !== undefined
        ? [options.config, 'config']
        : options.defaults !== undefined
          ? [options.defaults, 'plugin']
          : undefined;

  // An explicit setting always wins over auto-detection, including an explicit opt-out.
  if (explicit) {
    const [value, source] = explicit;
    // `false` is an explicit opt-out that also suppresses auto-detection.
    if (value === false) return undefined;
    const dir = resolve(root, value);
    // A configured folder that does not exist is a misconfiguration, so fail loudly at startup.
    if (!(await isDirectory(dir))) {
      throw new Error(
        `Help docs folder "${dir}" does not exist (set by ${SETTING_NAMES[source]}).`,
      );
    }
    return { dir, ...(await countHelpDocs(dir)), source };
  }

  const warn = options.warn ?? console.warn;
  // Auto-detection picks the first candidate that actually holds help articles or FAQs.
  for (const dir of await listCandidates(root)) {
    // Missing candidates are expected; most projects only match one convention.
    if (!(await isDirectory(dir))) continue;
    let counts: Awaited<ReturnType<typeof countHelpDocs>>;
    try {
      counts = await countHelpDocs(dir);
    } catch (error) {
      // An unreadable folder the user never configured must not stop the mock server.
      warn(
        `skipping help docs auto-detection in ${dir}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Later candidates may still hold readable help docs.
      continue;
    }
    // A docs folder without articles or FAQs (e.g. project docs) must not enable the help service.
    if (counts.articleCount + counts.faqCount > 0) return { dir, ...counts, source: 'detected' };
  }
  return undefined;
}

export default resolveHelpDocs;
