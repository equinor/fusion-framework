import type { Dirent } from 'node:fs';
import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

import { compareCodeUnits } from './compare-code-units.js';
import { detectRouteModuleCapabilities } from './detect-route-module-capabilities.js';
import { findCaseCollisions } from './find-case-collisions.js';
import { toProjectPath } from './to-project-path.js';
import type { ResolvedRoute, ResolvedRouteGraph, RouteDiagnostic } from './types.js';

/** Route collection produced by one route source, before graph-wide validation and sorting. */
export type RouteCollection = Omit<ResolvedRouteGraph, 'source'>;

const ROUTE_MODULE_PATTERN = /\.tsx?$/;
const DECLARATION_PATTERN = /\.d\.tsx?$/;
const TEST_MODULE_PATTERN = /\.(?:test|spec)\.tsx?$/;
const DYNAMIC_SEGMENT_PATTERN = /^\[([^[\]]*)\]$/;
const PARAM_NAME_PATTERN = /^[A-Za-z_$][\w$]*$/;
const UNSUPPORTED_SEGMENT_CHARACTERS = /[[\]:*?#%\\/\s]/;

/** Result of interpreting a file or directory name as one URL segment. */
type SegmentResult = { segment: string } | { diagnostic: Omit<RouteDiagnostic, 'files'> };

/** A route-relevant entry inside one route directory. */
interface RouteDirectoryEntry {
  /** Entry name on disk. */
  name: string;
  /** Absolute path. */
  absolute: string;
  /** Whether the entry is a directory (otherwise a route module file). */
  directory: boolean;
  /** Name without extension for files, or the directory name. */
  stem: string;
}

/**
 * Decides whether a directory entry name is private to the route directory.
 *
 * Hidden names, `_`-prefixed names (including `__tests__` and `__mocks__`) are where
 * authors keep helpers, so they never become routes.
 *
 * @param name - File or directory name.
 * @returns `true` when the entry must be skipped by discovery.
 */
function isPrivateRouteEntry(name: string): boolean {
  return name.startsWith('.') || name.startsWith('_');
}

/**
 * Decides whether a file name is a candidate route module: `.ts`/`.tsx`,
 * excluding declaration files and test/spec files.
 *
 * @param name - File name.
 * @returns `true` when the file participates in route discovery.
 */
function isRouteModuleName(name: string): boolean {
  return (
    ROUTE_MODULE_PATTERN.test(name) &&
    !DECLARATION_PATTERN.test(name) &&
    !TEST_MODULE_PATTERN.test(name) &&
    !isPrivateRouteEntry(name)
  );
}

/**
 * Interprets a file stem or directory name as a URL segment.
 *
 * `[name]` becomes the required dynamic segment `:name`; other names are static.
 * Optional segments, splats and other advanced shapes are reserved for the
 * explicit DSL, so they are reported instead of guessed.
 *
 * @param name - File stem or directory name.
 * @returns The React Router segment, or a diagnostic without file references.
 */
function toUrlSegment(name: string): SegmentResult {
  const dynamic = DYNAMIC_SEGMENT_PATTERN.exec(name);
  // Bracketed names are parameters; everything else is a static segment
  if (dynamic) {
    const param = dynamic[1];
    // A splat-like `[...rest]` is a supported router shape, but only through explicit DSL
    if (param.startsWith('...')) {
      return {
        diagnostic: {
          severity: 'error',
          code: 'unsupported-route-segment',
          message: `Route segment "${name}" is not supported by file-route discovery; declare splat routes with the explicit route DSL.`,
        },
      };
    }
    // React Router param names must be identifiers to be readable from `params`
    if (!PARAM_NAME_PATTERN.test(param)) {
      return {
        diagnostic: {
          severity: 'error',
          code: 'invalid-dynamic-segment',
          message: `Dynamic route segment "${name}" must contain a parameter name made of letters, digits, "_" or "$", not starting with a digit.`,
        },
      };
    }
    return { segment: `:${param}` };
  }
  // Characters with router meaning (`*`, `?`, `:`, brackets) cannot be static segments
  if (UNSUPPORTED_SEGMENT_CHARACTERS.test(name)) {
    return {
      diagnostic: {
        severity: 'error',
        code: 'unsupported-route-segment',
        message: `Route segment "${name}" is not supported by file-route discovery; use "[name]" for a required parameter or declare optional and splat segments with the explicit route DSL.`,
      },
    };
  }
  return { segment: name };
}

/**
 * Builds the full app-relative URL path for a list of segments.
 *
 * @param segments - URL segments from the route directory to the route.
 * @returns A path starting with `/`.
 */
function toUrlPath(segments: readonly string[]): string {
  return `/${segments.join('/')}`;
}

/**
 * Reads one route directory and returns its route-relevant entries in code-unit order.
 * Symbolic links are followed so linked route folders behave like real ones.
 *
 * @param directory - Absolute directory path.
 * @returns Sorted route-relevant entries.
 */
async function readRouteDirectory(directory: string): Promise<RouteDirectoryEntry[]> {
  const dirents: Dirent[] = await readdir(directory, { withFileTypes: true });
  const entries: RouteDirectoryEntry[] = [];
  // Classify each entry as a route folder, a route module or something to ignore
  for (const dirent of dirents) {
    // Private and hidden entries are helper locations by convention and are never routes
    if (isPrivateRouteEntry(dirent.name)) continue;
    const absolute = path.join(directory, dirent.name);
    let isDirectory = dirent.isDirectory();
    let isFile = dirent.isFile();
    // Resolve symbolic links to decide whether the target is a folder or a module
    if (dirent.isSymbolicLink()) {
      const target = await stat(absolute);
      isDirectory = target.isDirectory();
      isFile = target.isFile();
    }
    // Folders always add a segment; files only when they look like route modules
    if (isDirectory) {
      entries.push({ name: dirent.name, absolute, directory: true, stem: dirent.name });
    } else if (isFile && isRouteModuleName(dirent.name)) {
      entries.push({
        name: dirent.name,
        absolute,
        directory: false,
        stem: dirent.name.replace(ROUTE_MODULE_PATTERN, ''),
      });
    }
  }
  // Code-unit order makes discovery independent of file-system enumeration order
  return entries.sort((a, b) => compareCodeUnits(a.name, b.name));
}

/**
 * Discovers file routes below a route directory using the Fusion convention:
 * `index` modules are index routes, `layout` modules are pathless layouts around
 * their directory, other module names and folders are static segments, and
 * `[name]` modules or folders are required dynamic segments.
 *
 * Modules are read as text to detect capabilities; they are never imported.
 *
 * @param root - Absolute project root.
 * @param directory - Absolute route directory inside `root`.
 * @returns Discovered routes, diagnostics and the files that were read.
 */
export async function discoverFileRoutes(
  root: string,
  directory: string,
): Promise<RouteCollection> {
  const routes: ResolvedRoute[] = [];
  const diagnostics: RouteDiagnostic[] = [];
  const dependencies: string[] = [];
  const visited = new Set<string>();
  const projectPath = (file: string): string => toProjectPath(root, file) ?? file;

  /**
   * Creates one discovered route entry and records the module as a dependency.
   *
   * @param entry - Route module entry.
   * @param kind - Route kind derived from the file name.
   * @param routePath - Full URL path.
   * @param parentId - Enclosing layout ID.
   * @returns The new route entry.
   */
  const addRoute = async (
    entry: RouteDirectoryEntry,
    kind: ResolvedRoute['kind'],
    routePath: string,
    parentId: string | null,
  ): Promise<ResolvedRoute> => {
    const module = projectPath(entry.absolute);
    const source = await readFile(entry.absolute, 'utf8');
    const route: ResolvedRoute = {
      id: `file:${module}`,
      parentId,
      kind,
      path: routePath,
      module,
      capabilities: detectRouteModuleCapabilities(source),
      metadata: {},
    };
    dependencies.push(module);
    routes.push(route);
    return route;
  };

  /**
   * Reports more than one module claiming the same index or layout slot.
   *
   * @param candidates - Modules for the slot in code-unit order.
   * @param code - Diagnostic code for the slot.
   * @param label - Slot name for the message.
   */
  const reportDuplicateSlot = (
    candidates: readonly RouteDirectoryEntry[],
    code: 'duplicate-index' | 'duplicate-layout',
    label: string,
  ): void => {
    // Report every candidate so authors can pick which one to keep
    const files = candidates.map((candidate) => projectPath(candidate.absolute));
    diagnostics.push({
      severity: 'error',
      code,
      message: `Only one ${label} module is allowed per route directory; found ${files.join(', ')}.`,
      files,
    });
  };

  /**
   * Walks one route directory depth-first, assigning URL segments and parent layouts.
   *
   * @param current - Absolute directory being walked.
   * @param segments - URL segments for `current`.
   * @param parentId - ID of the nearest enclosing layout.
   */
  const walk = async (
    current: string,
    segments: readonly string[],
    parentId: string | null,
  ): Promise<void> => {
    const real = await realpath(current);
    // Symbolic links may form cycles; each physical folder is discovered at most once
    if (visited.has(real)) return;
    visited.add(real);
    const entries = await readRouteDirectory(current);

    // Case-only differences resolve differently per file system, so they are always errors
    const stems = entries.map((entry) => entry.stem);
    // One diagnostic per group of names that collide case-insensitively
    for (const group of findCaseCollisions(stems)) {
      const files = entries
        // Entries whose names belong to this collision group
        .filter((entry) => group.includes(entry.stem))
        // Report project-relative paths
        .map((entry) => projectPath(entry.absolute));
      // Quote each conflicting name for the message
      const names = group.map((name) => `"${name}"`);
      diagnostics.push({
        severity: 'error',
        code: 'case-collision',
        message: `Route names ${names.join(', ')} differ only by letter case: ${files.join(', ')}.`,
        files,
      });
    }

    // Only files can claim the layout or index slot of a directory
    const modules = entries.filter((entry) => !entry.directory);
    // `layout.ts` and `layout.tsx` both claim the layout slot
    const layouts = modules.filter((entry) => entry.stem === 'layout');
    // `index.ts` and `index.tsx` both claim the index slot
    const indexes = modules.filter((entry) => entry.stem === 'index');
    // Two layouts would make the parent ambiguous; the first is kept so discovery can continue
    if (layouts.length > 1) reportDuplicateSlot(layouts, 'duplicate-layout', 'layout');
    // Two index modules would render competing pages at the directory URL
    if (indexes.length > 1) reportDuplicateSlot(indexes, 'duplicate-index', 'index');

    const directoryPath = toUrlPath(segments);
    // A layout wraps every route in its directory and below, so it becomes their parent
    const layout = layouts[0]
      ? await addRoute(layouts[0], 'layout', directoryPath, parentId)
      : undefined;
    const childParentId = layout?.id ?? parentId;

    // The index route renders at the directory URL inside the layout
    if (indexes[0]) {
      await addRoute(indexes[0], 'index', directoryPath, childParentId);
    }

    // Remaining modules and folders each contribute one URL segment
    for (const entry of entries) {
      // Layout and index modules were handled above; folders named like them are still segments
      if (!entry.directory && (entry.stem === 'layout' || entry.stem === 'index')) continue;
      const result = toUrlSegment(entry.stem);
      // Invalid names are reported with their path and skipped, together with any subtree
      if ('diagnostic' in result) {
        diagnostics.push({ ...result.diagnostic, files: [projectPath(entry.absolute)] });
        // Nothing below an invalid segment can get a valid URL
        continue;
      }
      const childSegments = [...segments, result.segment];
      // Folders recurse; files become leaf routes
      if (entry.directory) {
        await walk(entry.absolute, childSegments, childParentId);
      } else {
        await addRoute(entry, 'route', toUrlPath(childSegments), childParentId);
      }
    }
  };

  await walk(directory, [], null);
  return { routes, diagnostics, dependencies };
}
