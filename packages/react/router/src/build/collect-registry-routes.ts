import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { RouterSchema } from '../types.js';
import { detectRouteModuleCapabilities } from './detect-route-module-capabilities.js';
import type { RouteCollection } from './discover-file-routes.js';
import { isMissingFileError } from './is-missing-file-error.js';
import { toProjectPath } from './to-project-path.js';
import type { ResolvedRoute, ResolvedRouteKind, RouteDiagnostic } from './types.js';

/** Extensions tried, in order, when a DSL module reference omits its extension. */
const MODULE_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js'];
const PARAM_NAME_PATTERN = /^[A-Za-z_$][\w$]*$/;

/** A registry route before IDs are assigned. */
interface RouteDraft {
  kind: ResolvedRouteKind;
  path: string;
  module: string;
  parent: RouteDraft | null;
  metadata: RouterSchema;
}

/**
 * Narrows an unknown value to a plain object record.
 *
 * @param value - Value to check.
 * @returns `true` for non-null objects.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Joins a DSL path segment onto a parent path, following the joining rules used by `toRouteSchema`.
 *
 * @param base - Parent full path starting with `/`.
 * @param segment - DSL path segment, with or without slashes.
 * @returns The full path starting with `/`.
 */
function joinRoutePath(base: string, segment: string): string {
  // Concatenate both segment lists and drop empties so duplicate slashes collapse
  const parts = [...base.split('/'), ...segment.split('/')].filter(Boolean);
  return `/${parts.join('/')}`;
}

/**
 * Copies DSL route schema metadata into plain JSON data, keeping only `RouterSchema` fields.
 *
 * @param handle - DSL node `handle` value.
 * @returns Cloned metadata.
 */
function toMetadata(handle: unknown): RouterSchema {
  const schema = isRecord(handle) && isRecord(handle.route) ? handle.route : {};
  const metadata: RouterSchema = {};
  // Copy only well-typed fields so arbitrary handle data never leaks into the graph
  if (typeof schema.description === 'string') metadata.description = schema.description;
  const params = toStringRecord(schema.params);
  // Parameter descriptions are only kept when present
  if (params) metadata.params = params;
  const search = toStringRecord(schema.search);
  // Search parameter descriptions follow the same shape as path parameters
  if (search) metadata.search = search;
  return metadata;
}

/**
 * Copies the string-valued entries of a record, validating each value instead of casting.
 *
 * @param value - Candidate record.
 * @returns A new record with string values only, or `undefined` when `value` is not a record.
 */
function toStringRecord(value: unknown): Record<string, string> | undefined {
  // Non-objects carry no parameter descriptions
  if (!isRecord(value)) return undefined;
  const result: Record<string, string> = {};
  // Non-string descriptions are dropped rather than coerced
  for (const [key, entry] of Object.entries(value)) {
    // Only string descriptions are valid RouterSchema values
    if (typeof entry === 'string') result[key] = entry;
  }
  return result;
}

/**
 * Formats a thrown value for a diagnostic message.
 *
 * @param error - Thrown value.
 * @returns The error message.
 */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Finds the first existing file for a module reference, probing common extensions.
 *
 * @param candidate - Absolute path without guaranteed extension.
 * @returns The existing absolute file path, or `null`.
 * @throws {Error} When a candidate exists but cannot be inspected.
 */
async function findModuleFile(candidate: string): Promise<string | null> {
  // Exact references win, then extensions in preference order
  for (const extension of MODULE_EXTENSIONS) {
    const file = `${candidate}${extension}`;
    try {
      // Only regular files are route modules; a folder with the same name is not
      if ((await stat(file)).isFile()) return file;
    } catch (error) {
      // Permission and I/O failures must surface; only a missing candidate tries the next extension
      if (!isMissingFileError(error)) throw error;
    }
  }
  return null;
}

/**
 * Converts an explicit route registry (route DSL nodes) into route entries.
 *
 * DSL nodes are recognized structurally by `kind`, so registries bundled with their
 * own copy of the DSL classes are accepted. `prefix` nodes only contribute URL
 * segments. Module references must be absolute paths or `file:` URLs: relative
 * references are already resolved at their DSL call site while the registry is
 * bundled (see {@link loadRouteRegistry}), and `import.meta.resolve` yields URLs.
 *
 * Route IDs are `file:<module>` when a module occurs once. When a module is reused,
 * every occurrence is suffixed with its graph location (`#<kind>:<path>`).
 *
 * @param root - Absolute project root.
 * @param registryFile - Absolute registry module path, used in diagnostics.
 * @param definition - Registry export: one route node or an array of route nodes.
 * @returns Registry routes, diagnostics and the files that were read.
 */
export async function collectRegistryRoutes(
  root: string,
  registryFile: string,
  definition: unknown,
): Promise<RouteCollection> {
  const registry = toProjectPath(root, registryFile) ?? registryFile;
  const drafts: RouteDraft[] = [];
  const diagnostics: RouteDiagnostic[] = [];
  const dependencies = new Set<string>([registry]);
  const capabilitiesByModule = new Map<string, ResolvedRoute['capabilities']>();
  const unreadableModules = new Set<string>();
  let realRoot: Promise<string> | undefined;

  /**
   * Records a registry diagnostic that names the registry and any related module.
   *
   * @param code - Diagnostic code.
   * @param message - Explanation without file prefix.
   * @param files - Additional project-relative files.
   */
  const report = (
    code: RouteDiagnostic['code'],
    message: string,
    files: readonly string[] = [],
  ): void => {
    diagnostics.push({
      severity: 'error',
      code,
      message: `${registry}: ${message}`,
      files: [...new Set([registry, ...files])].sort(),
    });
  };

  /**
   * Resolves a DSL module reference to a project-relative path and reads its capabilities once.
   *
   * @param reference - Module reference as written in the registry.
   * @returns The project-relative module path, or `null` when it cannot be used.
   */
  const resolveModule = async (reference: string): Promise<string | null> => {
    const candidate = reference.startsWith('file:') ? fileURLToPath(reference) : reference;
    // Bare specifiers have no call-site base and would resolve differently per tool
    if (!path.isAbsolute(candidate)) {
      report(
        'unresolved-route-file',
        `route module "${reference}" must be relative to the module that declares it ("./" or "../"), absolute, or a file: URL.`,
      );
      return null;
    }
    // Bundlers may report symlink-resolved paths (for example /private/var on macOS)
    realRoot ??= realpath(root);
    const candidateFiles = [
      toProjectPath(root, candidate) ?? toProjectPath(await realRoot, candidate) ?? candidate,
    ];
    let file: string | null;
    let module: string | null = null;
    try {
      file = await findModuleFile(candidate);
      module = file
        ? (toProjectPath(root, file) ?? toProjectPath(await realRoot, await realpath(file)))
        : null;
    } catch (error) {
      report(
        'route-file-unreadable',
        `route module "${candidateFiles[0]}" could not be inspected: ${describeError(error)}`,
        candidateFiles,
      );
      return null;
    }
    // A missing module cannot provide capabilities or an ID
    if (!file) {
      report(
        'unresolved-route-file',
        `route module "${candidateFiles[0]}" does not exist.`,
        candidateFiles,
      );
      return null;
    }
    // IDs must be project-relative, so modules outside the project cannot be identified
    if (!module) {
      report(
        'route-file-outside-root',
        `route module "${candidateFiles[0]}" is outside the project root; move it into the project.`,
      );
      return null;
    }
    // An unreadable module was reported at its first occurrence
    if (unreadableModules.has(module)) return null;
    // Read each module once, even when the registry reuses it
    if (!capabilitiesByModule.has(module)) {
      dependencies.add(module);
      try {
        capabilitiesByModule.set(
          module,
          detectRouteModuleCapabilities(await readFile(file, 'utf8')),
        );
      } catch (error) {
        unreadableModules.add(module);
        report(
          'route-file-unreadable',
          `route module ${module} could not be read: ${describeError(error)}`,
          [module],
        );
        return null;
      }
    }
    return module;
  };

  /**
   * Validates dynamic segment names in an explicit DSL path.
   *
   * @param routePath - Full route path.
   * @param module - Module the path belongs to, for diagnostics.
   */
  const validatePath = (routePath: string, module: string): void => {
    // Check every segment of the full path, including inherited prefix segments
    for (const segment of routePath.split('/')) {
      // Static segments need no parameter validation
      if (!segment.startsWith(':')) continue;
      const name = segment.slice(1).replace(/\?$/, '');
      // Parameter names become manifest parameter keys, so they must be plain identifiers
      if (!PARAM_NAME_PATTERN.test(name)) {
        report(
          'invalid-dynamic-segment',
          `route "${routePath}" has invalid parameter segment "${segment}" (${module}).`,
          [module],
        );
      }
    }
  };

  /**
   * Walks DSL nodes depth-first, flattening prefixes and recording file routes.
   *
   * @param nodes - DSL nodes at this level.
   * @param basePath - Full path contributed by ancestors.
   * @param parent - Nearest file route ancestor.
   */
  const walk = async (
    nodes: readonly unknown[],
    basePath: string,
    parent: RouteDraft | null,
  ): Promise<void> => {
    // Validate and convert each node; invalid nodes are reported and skipped with their subtree
    for (const node of nodes) {
      const kind = isRecord(node) ? node.kind : undefined;
      // Plain React Router objects carry no module reference and cannot be resolved statically
      if (!isRecord(node) || typeof kind !== 'string') {
        report(
          'invalid-route-registry',
          'registry entries must be route DSL nodes created with layout(), index(), route() or prefix().',
        );
        // Without a kind there is no module or path to recurse with
        continue;
      }
      const children = Array.isArray(node.children) ? (node.children as unknown[]) : [];
      // Prefixes add URL segments but no route entry of their own
      if (kind === 'prefix') {
        // A prefix without a path cannot contribute segments
        if (typeof node.path !== 'string') {
          report('invalid-route-registry', 'prefix() requires a string path.');
          // Skip the malformed prefix and its children
          continue;
        }
        await walk(children, joinRoutePath(basePath, node.path), parent);
        // Prefix children were walked under the joined path
        continue;
      }
      // Only file-backed DSL kinds map to route entries
      if (kind !== 'layout' && kind !== 'index' && kind !== 'route') {
        report('invalid-route-registry', `unknown route node kind "${kind}".`);
        // Unknown kinds have no defined meaning for their children
        continue;
      }
      // Every file-backed node needs a module to identify and inspect
      if (typeof node.file !== 'string' || node.file.length === 0) {
        report('invalid-route-registry', `${kind}() requires a module path.`);
        // Without a module the node cannot get a file-based ID
        continue;
      }
      // Named routes must declare their own segment
      if (kind === 'route' && typeof node.path !== 'string') {
        report('invalid-route-registry', `route() for "${node.file}" requires a string path.`);
        // Without a path the route URL is undefined
        continue;
      }
      const module = await resolveModule(node.file);
      // resolveModule already reported why the module is unusable
      if (!module) continue;
      const routePath =
        kind === 'route' && typeof node.path === 'string'
          ? joinRoutePath(basePath, node.path)
          : basePath;
      validatePath(routePath, module);
      const draft: RouteDraft = {
        kind,
        path: routePath,
        module,
        parent,
        metadata: toMetadata(node.handle),
      };
      drafts.push(draft);
      await walk(children, routePath, draft);
    }
  };

  // A registry may export a single root node (commonly a layout) or a list of nodes
  if (Array.isArray(definition)) {
    await walk(definition, '/', null);
  } else if (isRecord(definition)) {
    await walk([definition], '/', null);
  } else {
    report(
      'invalid-route-registry',
      'export route DSL nodes as the default export or as a named "routes" export.',
    );
  }

  const ids = assignRegistryIds(drafts);
  // Replace draft parent links with the final IDs
  const routes = drafts.map(
    (draft): ResolvedRoute => ({
      id: ids.get(draft) as string,
      parentId: draft.parent ? (ids.get(draft.parent) as string) : null,
      kind: draft.kind,
      path: draft.path,
      module: draft.module,
      capabilities: capabilitiesByModule.get(draft.module) ?? [],
      metadata: draft.metadata,
    }),
  );
  return { routes, diagnostics, dependencies: [...dependencies] };
}

/**
 * Assigns stable IDs to registry drafts.
 *
 * A module used once keeps the discovery-compatible `file:<module>` ID. Reused modules
 * are distinguished by graph location; an exact repeat of module, kind and path
 * additionally receives an ordinal in declaration order.
 *
 * @param drafts - Drafts in declaration order.
 * @returns Draft-to-ID map.
 */
function assignRegistryIds(drafts: readonly RouteDraft[]): Map<RouteDraft, string> {
  const usage = new Map<string, number>();
  // Count occurrences per module to decide which IDs need a location suffix
  for (const draft of drafts) {
    usage.set(draft.module, (usage.get(draft.module) ?? 0) + 1);
  }
  const ids = new Map<RouteDraft, string>();
  const seen = new Map<string, number>();
  // Assign IDs in declaration order so ordinals are stable
  for (const draft of drafts) {
    const base = `file:${draft.module}`;
    const located =
      (usage.get(draft.module) ?? 0) > 1 ? `${base}#${draft.kind}:${draft.path}` : base;
    const occurrence = (seen.get(located) ?? 0) + 1;
    seen.set(located, occurrence);
    ids.set(draft, occurrence > 1 ? `${located}~${occurrence}` : located);
  }
  return ids;
}
