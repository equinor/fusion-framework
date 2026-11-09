import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** File name of the notices emitted next to the built site assets. */
export const THIRD_PARTY_NOTICES_FILE = 'third-party-licenses.txt';

const NODE_MODULES_SEGMENT = '/node_modules/';
const LICENSE_FILE_PATTERN = /^(licen[cs]e|copying|notice)(\.(md|txt|markdown))?$/i;

/** A third-party package bundled into the site, as listed in the notices. */
export interface ThirdPartyPackage {
  name: string;
  version: string;
  license: string;
  source?: string;
  licenseTexts: string[];
}

/** The parts of a Vite/Rolldown output bundle the notices plugin reads. */
interface NoticesOutputBundle {
  [fileName: string]: { type: 'chunk'; moduleIds: readonly string[] } | { type: 'asset' };
}

/** The parts of the Vite plugin context the notices plugin uses. */
interface NoticesPluginContext {
  /** The build environment; VuePress builds the client and server-side rendering bundles at once. */
  environment?: { config: { build: { ssr?: unknown } } };
  emitFile(file: { type: 'asset'; fileName: string; source: string }): string;
}

/** The Vite plugin returned by {@link thirdPartyNoticesPlugin}. */
export interface ThirdPartyNoticesVitePlugin {
  name: string;
  apply: 'build';
  generateBundle(this: NoticesPluginContext, options: unknown, bundle: NoticesOutputBundle): void;
}

/**
 * Resolves the directory of the npm package that a bundled module belongs to.
 *
 * @param moduleId - Module id from a bundle chunk; may carry a query or a virtual-module prefix.
 * @returns The package directory, or `undefined` when the module is not inside `node_modules`.
 *
 * @example
 * ```ts
 * resolvePackageDirectory('/repo/node_modules/.pnpm/elkjs@0.12.1/node_modules/elkjs/lib/elk.js');
 * // '/repo/node_modules/.pnpm/elkjs@0.12.1/node_modules/elkjs'
 * ```
 */
export const resolvePackageDirectory = (moduleId: string): string | undefined => {
  const normalized = moduleId.replace(/^\0/, '').split('?')[0].split(path.sep).join('/');
  const index = normalized.lastIndexOf(NODE_MODULES_SEGMENT);
  // Site sources and workspace packages are not third-party code.
  if (index === -1) return undefined;
  const root = normalized.slice(0, index + NODE_MODULES_SEGMENT.length);
  const [first, second] = normalized.slice(root.length).split('/');
  // Scoped packages span two path segments.
  const name = first?.startsWith('@') ? `${first}/${second}` : first;
  return name ? `${root}${name}` : undefined;
};

/**
 * Reads a package repository URL as a browsable source link.
 *
 * @param repository - The `repository` field of a `package.json`.
 * @returns A source URL, or `undefined` when the package declares none.
 */
const readSourceUrl = (repository: unknown): string | undefined => {
  const url =
    typeof repository === 'string'
      ? repository
      : typeof repository === 'object' && repository !== null && 'url' in repository
        ? String(repository.url)
        : undefined;
  if (!url) return undefined;
  // npm shorthand such as `github:owner/repo` or `owner/repo`.
  const shorthand = /^(?:github:)?([\w.-]+\/[\w.-]+)$/.exec(url);
  if (shorthand) return `https://github.com/${shorthand[1]}`;
  return url.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git$/, '');
};

/**
 * Reads the notice-relevant metadata and licence files of one installed package.
 *
 * @param directory - Package directory containing `package.json`.
 * @returns The package, or `undefined` when the directory has no readable `package.json`.
 */
export const readThirdPartyPackage = (directory: string): ThirdPartyPackage | undefined => {
  const manifestPath = path.join(directory, 'package.json');
  if (!existsSync(manifestPath)) return undefined;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
  const licenseTexts = readdirSync(directory)
    .filter((file) => LICENSE_FILE_PATTERN.test(file))
    .sort()
    .map((file) => readFileSync(path.join(directory, file), 'utf8').trim());
  return {
    name: String(manifest.name ?? path.basename(directory)),
    version: String(manifest.version ?? 'unknown'),
    license:
      typeof manifest.license === 'string'
        ? manifest.license
        : licenseTexts.length > 0
          ? 'not declared in package.json; see the license text below'
          : 'UNKNOWN',
    source: readSourceUrl(manifest.repository) ?? readSourceUrl(manifest.homepage),
    licenseTexts,
  };
};

/**
 * Collects the distinct third-party packages behind a set of bundled module ids.
 *
 * @param moduleIds - Module ids from the client bundle chunks.
 * @param readPackage - Reads a package directory; injectable for tests.
 * @returns The packages, sorted by name and version.
 */
export const collectThirdPartyPackages = (
  moduleIds: Iterable<string>,
  readPackage: (directory: string) => ThirdPartyPackage | undefined = readThirdPartyPackage,
): ThirdPartyPackage[] => {
  const directories = new Set<string>();
  for (const moduleId of moduleIds) {
    const directory = resolvePackageDirectory(moduleId);
    if (directory) directories.add(directory);
  }
  const packages = new Map<string, ThirdPartyPackage>();
  for (const directory of directories) {
    const pkg = readPackage(directory);
    // pnpm can install one version in several places; list it once.
    if (pkg) packages.set(`${pkg.name}@${pkg.version}`, pkg);
  }
  return [...packages.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );
};

/**
 * Formats the notices file published with the site.
 *
 * @param packages - Packages bundled into the site.
 * @returns Plain-text notices listing each package, its licence, source and licence text.
 */
export const formatThirdPartyNotices = (packages: readonly ThirdPartyPackage[]): string => {
  const header = [
    'Third-party software notices',
    '',
    'The Fusion Framework documentation site includes the following third-party software.',
    'Each package is redistributed under its own licence, shown below. Where a package offers',
    'a choice of licences, it is used under the first licence listed. The source code of each',
    'package is available at the source URL given.',
  ].join('\n');
  const entries = packages.map((pkg) =>
    [
      `${pkg.name}@${pkg.version}`,
      `License: ${pkg.license}`,
      `Source: ${pkg.source ?? `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`}`,
      ...(pkg.licenseTexts.length > 0 ? ['', ...pkg.licenseTexts] : []),
    ].join('\n'),
  );
  return `${[header, ...entries].join(`\n\n${'-'.repeat(80)}\n\n`)}\n`;
};

/**
 * Vite plugin that publishes licence notices for third-party code bundled into the docs site.
 *
 * @remarks
 * The site serves dependencies such as `mermaid` and `elkjs` as minified JavaScript, and those
 * bundles carry no licence comments of their own. Licences such as EPL-2.0, MIT and Apache-2.0
 * ask redistributors to keep the notices and say where the source is, so the client build emits
 * {@link THIRD_PARTY_NOTICES_FILE} at the site root. The server-side rendering build is skipped
 * because its output is never published.
 *
 * @returns A build-only Vite plugin.
 *
 * @example
 * ```ts
 * viteBundler({ viteOptions: { plugins: [thirdPartyNoticesPlugin()] } });
 * ```
 */
export const thirdPartyNoticesPlugin = (): ThirdPartyNoticesVitePlugin => ({
  name: 'fusion-docs:third-party-notices',
  apply: 'build',
  generateBundle(_options, bundle) {
    // Both builds share this plugin instance and run in parallel, so read the build per call.
    if (this.environment?.config.build.ssr) return;
    const moduleIds = Object.values(bundle).flatMap((output) =>
      output.type === 'chunk' ? output.moduleIds : [],
    );
    this.emitFile({
      type: 'asset',
      fileName: THIRD_PARTY_NOTICES_FILE,
      source: formatThirdPartyNotices(collectThirdPartyPackages(moduleIds)),
    });
  },
});

export default thirdPartyNoticesPlugin;
