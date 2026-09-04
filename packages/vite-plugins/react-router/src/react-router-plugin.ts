import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, UserConfig } from 'vite';

/**
 * Configuration options for the {@link reactRouterPlugin | Fusion React Router Vite plugin}.
 */
export interface ReactRouterPluginOptions {
  /**
   * Enable verbose debug logging during transformation.
   * @defaultValue false
   */
  debug?: boolean;
}

// ============================================================================
// Regex Patterns
// ============================================================================

const ROUTE_IMPORT_PATTERN =
  /import\s*{\s*[^}]*\b(route|index|layout|prefix)\b[^}]*}\s*from\s*['"]@equinor\/fusion-framework-react-router(?:\/routes)?['"]/g;

const ROUTE_CALL_PATTERN = /\b(route|index|layout|prefix)\s*\(/g;

const IMPORT_META_RESOLVE_PATTERN = /import\.meta\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const SINGLE_ARG_PATTERN = /\b(index|layout)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const LAYOUT_WITH_RESOLVE_PATTERN =
  /\blayout\s*\(\s*import\.meta\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)\s*,\s*[^)]+\s*\)/g;

const LAYOUT_WITH_CHILDREN_PATTERN = /\blayout\s*\(\s*['"]([^'"]+)['"]\s*,\s*[^)]+\s*\)/g;

const ROUTE_PATTERN = /\broute\s*\(\s*[^,]+,\s*['"]([^'"]+)['"]\s*\)/g;

const INDEX_PATTERN = /\bindex\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const LAYOUT_SINGLE_PATTERN = /\blayout\s*\(\s*['"]([^'"]+)['"]\s*\)\s*(?!,)/g;

const LAYOUT_NESTED_PATTERN = /\blayout\s*\(\s*['"]([^'"]+)['"]\s*,\s*/g;

const ROUTE_WITH_PATH_PATTERN = /\broute\s*\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*\)/g;

const PREFIX_PATTERN = /\bprefix\s*\(\s*([^,]+)\s*,\s*\[/g;

const DSL_IMPORT_REMOVE_PATTERN =
  /import\s*{\s*[^}]*\b(route|index|layout|prefix)\b[^}]*}\s*from\s*['"]@equinor\/fusion-framework-react-router(?:\/routes)?['"];?\s*/g;

const EXPORT_PATTERN = /export\s+const\s+\w+\s*=\s*/g;

const IMPORT_STATEMENT_PATTERN = /^import\s+.*?;$/gm;

// Export detection patterns
const EXPORT_DEFAULT_PATTERN = /export\s+default|export\s*{\s*default\s*}/;

const EXPORT_NAMED_PATTERN = (name: string) =>
  new RegExp(`\\bexport\\s+(const|function|class|async\\s+function)\\s+${name}\\b`);

const EXPORT_REEXPORT_PATTERN = (name: string) =>
  new RegExp(`export\\s*{\\s*[^}]*${name}[^}]*}\\s*from`);

// ============================================================================
// Type Definitions
// ============================================================================

interface RouteImports {
  component: string;
  clientLoader?: string;
  action?: string;
  handle?: string;
  errorElement?: string;
  hydrateFallback?: string;
  shouldRevalidate?: string;
  availableExports: Set<string>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a file path is a relative path (starts with ./ or ../)
 */
function isRelativePath(filePath: string): boolean {
  return filePath.startsWith('./') || filePath.startsWith('../');
}

/**
 * Normalizes filesystem separators for comparison with Vite module IDs.
 *
 * @param filePath - A filesystem path or Vite module ID.
 * @returns The path with POSIX separators.
 */
function normalizePathSeparators(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Extracts all file paths from DSL route calls in the code
 */
function extractFilePaths(code: string): Set<string> {
  const filePaths = new Set<string>();

  // Helper to add relative paths
  const addIfRelative = (path: string) => {
    // Only track relative paths — bare package specifiers can't be resolved to a route file
    if (path && isRelativePath(path)) {
      filePaths.add(path);
    }
  };

  // Match import.meta.resolve() patterns
  let match = IMPORT_META_RESOLVE_PATTERN.exec(code);
  // Iterate every regex match; exec() advances lastIndex until it returns null
  while (match !== null) {
    addIfRelative(match[1]);
    match = IMPORT_META_RESOLVE_PATTERN.exec(code);
  }

  // Match index() and layout() calls with single file path argument
  match = SINGLE_ARG_PATTERN.exec(code);
  // Iterate every regex match; exec() advances lastIndex until it returns null
  while (match !== null) {
    addIfRelative(match[2]);
    match = SINGLE_ARG_PATTERN.exec(code);
  }

  // Match layout() calls with import.meta.resolve() and children
  match = LAYOUT_WITH_RESOLVE_PATTERN.exec(code);
  // Iterate every regex match; exec() advances lastIndex until it returns null
  while (match !== null) {
    addIfRelative(match[1]);
    match = LAYOUT_WITH_RESOLVE_PATTERN.exec(code);
  }

  // Match layout() calls with file path string and children
  match = LAYOUT_WITH_CHILDREN_PATTERN.exec(code);
  // Iterate every regex match; exec() advances lastIndex until it returns null
  while (match !== null) {
    addIfRelative(match[1]);
    match = LAYOUT_WITH_CHILDREN_PATTERN.exec(code);
  }

  // Match route() calls with path and file path arguments
  match = ROUTE_PATTERN.exec(code);
  // Iterate every regex match; exec() advances lastIndex until it returns null
  while (match !== null) {
    addIfRelative(match[1]);
    match = ROUTE_PATTERN.exec(code);
  }

  return filePaths;
}

/**
 * Resolves a file path relative to a base directory, trying common extensions
 */
function resolveFilePath(filePath: string, baseDir: string): string | null {
  const resolvedPath = path.resolve(baseDir, filePath);

  // Check if file exists without extension
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  // Try common extensions, finally check without extension
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  // Try each extension in priority order until one resolves to an existing file
  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    // Stop at the first extension that resolves to a real file
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }

  return null;
}

/**
 * Scans a route file and returns the set of recognised export names.
 *
 * The following exports are detected and wired into the generated React Router data route:
 *
 * | Export | Mapped to |
 * |---|---|
 * | `default` | `Component` |
 * | `clientLoader` | `loader` |
 * | `action` | `action` |
 * | `handle` | `handle` |
 * | `ErrorElement` | `errorElement` |
 * | `HydrateFallback` | `HydrateFallback` |
 * | `shouldRevalidate` | `shouldRevalidate` |
 *
 * Any other named export in the file is silently ignored.
 */
function getAvailableExports(filePath: string, currentFileId: string, debug: boolean): Set<string> {
  const availableExports = new Set<string>();

  try {
    const currentDir = path.dirname(currentFileId);
    const actualPath = resolveFilePath(filePath, currentDir);

    // Bail out early if the referenced route file could not be located
    if (!actualPath) {
      // Debug logging is opt-in to avoid noisy build output by default
      if (debug) {
        console.warn(
          `[fusion:react-router] File not found: ${filePath} (resolved from: ${currentFileId})`,
        );
      }
      return availableExports;
    }

    const fileContent = fs.readFileSync(actualPath, 'utf-8');

    // Check for default export
    if (fileContent.match(EXPORT_DEFAULT_PATTERN)) {
      availableExports.add('default');
    }

    // Check for named exports and re-exports
    const exportNames = [
      'clientLoader',
      'action',
      'handle',
      'ErrorElement',
      'HydrateFallback',
      'shouldRevalidate',
    ];
    // Check each recognised export name individually, as both direct and re-export syntax are supported
    for (const name of exportNames) {
      // Recognise the export whether it's declared directly or re-exported from another module
      if (
        fileContent.match(EXPORT_NAMED_PATTERN(name)) ||
        fileContent.match(EXPORT_REEXPORT_PATTERN(name))
      ) {
        availableExports.add(name);
      }
    }
  } catch (error) {
    // Swallow file-read errors so a single unreadable route file doesn't fail the whole build
    if (debug) {
      console.warn(`[fusion:react-router] Error reading file ${filePath}:`, error);
    }
  }

  return availableExports;
}

/**
 * Generates a unique PascalCase component name from a route file path.
 *
 * Supports two file-naming conventions:
 * - Suffix-based (e.g. `home.page.tsx`): `-`, `_`, and `.` are treated as word
 *   separators, producing `HomePage`.
 * - Directory-based (Qwik-style fs-routing, e.g. `products/[id]/index.tsx`):
 *   when the basename is literally `index`, the name is instead derived from
 *   its directory path (bracketed dynamic segments have their brackets
 *   stripped), so every route's `index.tsx` resolves to a distinct
 *   identifier (e.g. `ProductsId`) instead of colliding on the literal
 *   basename `index`. Non-`index` basenames are used as-is, regardless of
 *   how deeply nested the file is.
 */
function generateComponentName(filePath: string): string {
  const withoutExt = filePath.replace(/\.[^./]+$/, '');
  // Drop the extension and any "." / ".." segments so only meaningful path parts remain.
  const segments = withoutExt
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..');
  const last = segments[segments.length - 1] ?? 'index';

  // Only fold in ancestor directory segments when the basename itself carries no
  // naming information (i.e. it's a bare "index" file); otherwise use it as-is.
  const nameSegments =
    last.toLowerCase() === 'index' && segments.length > 1 ? segments.slice(0, -1) : [last];

  // Strip dynamic-segment brackets and convert each path segment to PascalCase before joining.
  return nameSegments
    .map((segment) =>
      segment
        .replace(/[[\]]/g, '')
        .replace(/[-_.](.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^(.)/, (c) => c.toUpperCase()),
    )
    .join('');
}

/**
 * Builds route object properties string from imports
 */
function buildRouteProperties(imports: RouteImports): string {
  const properties: string[] = [];

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.availableExports.has('default')) {
    properties.push(`Component: ${imports.component}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.clientLoader) {
    properties.push(`loader: ${imports.clientLoader}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.action) {
    properties.push(`action: ${imports.action}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.handle) {
    properties.push(`handle: ${imports.handle}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.errorElement) {
    properties.push(`errorElement: ${imports.errorElement}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.hydrateFallback) {
    properties.push(`HydrateFallback: ${imports.hydrateFallback}`);
  }

  // Only wire up a route object property when the route file actually has the matching export
  if (imports.shouldRevalidate) {
    properties.push(`shouldRevalidate: ${imports.shouldRevalidate}`);
  }

  return properties.join(',\n        ');
}

/**
 * Generates import statements for route components
 */
function generateImportStatements(
  fileToImports: Map<string, RouteImports>,
  hasRoutes: boolean,
): string[] {
  const importStatements: string[] = [];

  // Add React Router imports if we have routes
  if (hasRoutes) {
    importStatements.push(
      `import React from 'react';`,
      `import { useLoaderData, useActionData, useRouteError, useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
    );
  }

  // Generate imports for each route file
  fileToImports.forEach((imports, filePath) => {
    const importParts: string[] = [];

    // Only import the destructured export alias when the route file actually has it
    if (imports.availableExports.has('default')) {
      importParts.push(`default as ${imports.component}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.clientLoader) {
      importParts.push(`clientLoader as ${imports.clientLoader}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.action) {
      importParts.push(`action as ${imports.action}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.handle) {
      importParts.push(`handle as ${imports.handle}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.errorElement) {
      importParts.push(`ErrorElement as ${imports.errorElement}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.hydrateFallback) {
      importParts.push(`HydrateFallback as ${imports.hydrateFallback}`);
    }
    // Only import the destructured export alias when the route file actually has it
    if (imports.shouldRevalidate) {
      importParts.push(`shouldRevalidate as ${imports.shouldRevalidate}`);
    }

    // Skip files that ended up with nothing to import (no recognised exports)
    if (importParts.length > 0) {
      importStatements.push(`import {\n    ${importParts.join(',\n    ')}\n} from '${filePath}';`);
    }
  });

  return importStatements;
}

/**
 * Finds matching closing delimiter by counting nested delimiters
 */
function findMatchingDelimiter(
  code: string,
  startIndex: number,
  openChar: string,
  closeChar: string,
): number | null {
  let count = 1;
  let i = startIndex + 1;

  // Scan forward, tracking nesting depth until the matching delimiter closes it back to zero
  while (i < code.length && count > 0) {
    // An opening delimiter increases nesting depth
    if (code[i] === openChar) count++;
    // A closing delimiter decreases nesting depth
    if (code[i] === closeChar) count--;
    // Depth returned to zero means we found the matching closing delimiter
    if (count === 0) return i;
    i++;
  }

  return null;
}

/**
 * Generic function to transform nested DSL calls (layout/prefix)
 */
function transformNestedCall(
  code: string,
  pattern: RegExp,
  nestedPattern: RegExp,
  buildReplacement: (
    filePath: string,
    childrenContent: string,
    imports: RouteImports | undefined,
  ) => string | null,
  fileToImports: Map<string, RouteImports>,
): string {
  let result = code;
  let changed = true;

  // Keep re-scanning until a full pass makes no further replacements (handles nested DSL calls)
  while (changed) {
    changed = false;
    // Use matchAll to collect matches for current iteration
    const matches = Array.from(result.matchAll(pattern));

    // Process each match found in this pass
    for (const m of matches) {
      // Defensive check: ensure we have a valid index
      const startIndex = m.index ?? -1;
      // Skip matches without a usable index; matchAll guarantees one, but guard defensively
      if (startIndex < 0) {
        // Nothing usable to process for this match; move on to the next one
        continue;
      }

      const filePath = m[1];
      const argsStart = startIndex + m[0].length;

      // Find the opening paren of the function call (it's in the matched string)
      const openParenIndex = result.indexOf('(', startIndex);
      // Skip this match if the call's opening paren can't be located
      if (openParenIndex === -1) {
        // Malformed call syntax; move on to the next match
        continue;
      }

      // Find matching closing delimiter starting from the opening paren
      const delimiterEnd = findMatchingDelimiter(result, openParenIndex, '(', ')');
      // Skip this match if the matching closing paren can't be located
      if (delimiterEnd === null) {
        // Unbalanced delimiters; move on to the next match
        continue;
      }

      // Extract children content (everything between comma and closing paren)
      const childrenContent = result.slice(argsStart, delimiterEnd).trim();

      // Check if childrenContent still contains nested calls
      if (nestedPattern.test(childrenContent)) {
        // Skip, will be processed in next iteration
        continue;
      }

      const imports = fileToImports.get(filePath);
      const replacement = buildReplacement(filePath, childrenContent, imports);

      // Apply the replacement and restart the scan only when the builder produced output
      if (replacement !== null) {
        const before = result.slice(0, startIndex);
        const after = result.slice(delimiterEnd + 1);
        result = before + replacement + after;
        changed = true;
        // Restart the outer while loop from the beginning since the string layout changed
        break; // Restart from beginning
      }
    }
  }

  return result;
}

/**
 * Wraps single route object exports in arrays
 */
function wrapSingleRouteExports(code: string): string {
  let result = code;
  let match: RegExpExecArray | null = EXPORT_PATTERN.exec(result);

  // Iterate every top-level `export const X = ...` in the file
  while (match !== null) {
    const valueStart = match.index + match[0].length;

    // Skip whitespace
    let i = valueStart;
    // Advance past any whitespace between the `=` and the exported value
    while (i < result.length && /\s/.test(result[i])) {
      i++;
    }

    // Check if it starts with { (object)
    if (result[i] === '{') {
      const braceEnd = findMatchingDelimiter(result, i, '{', '}');
      // Only proceed if the object literal's closing brace could be located
      if (braceEnd !== null) {
        const objectContent = result.slice(i, braceEnd + 1);

        // Check if it contains Component: (it's a route object)
        if (objectContent.includes('Component:')) {
          const beforeBrace = result.slice(valueStart, i).trim();
          // Only wrap if the export isn't already an array literal
          if (!beforeBrace.startsWith('[')) {
            // Wrap in array
            const before = result.slice(0, valueStart);
            const after = result.slice(braceEnd + 1);
            result = `${before}[${objectContent}]${after}`;
            // Restart search
            EXPORT_PATTERN.lastIndex = 0;
            match = EXPORT_PATTERN.exec(result);
            // Re-evaluate the loop condition against the freshly restarted regex state
            continue;
          }
        }
      }
    }

    match = EXPORT_PATTERN.exec(result);
  }

  return result;
}

/**
 * Transforms prefix() calls to plain objects with path and children
 * Prefix doesn't use file paths, just path strings and arrays of children
 */
function transformPrefix(code: string): string {
  let result = code;
  let changed = true;

  // Keep re-scanning until a full pass makes no further replacements (handles nested prefix calls)
  while (changed) {
    changed = false;
    let match: RegExpExecArray | null = PREFIX_PATTERN.exec(result);

    // Process each prefix() call found in this pass
    while (match !== null) {
      const startIndex = match.index;
      const pathArg = match[1];
      const arrayStart = match.index + match[0].length - 1; // Position of opening [

      // Find matching closing bracket
      const arrayEnd = findMatchingDelimiter(result, arrayStart, '[', ']');
      // Skip this match if the matching closing bracket can't be located
      if (arrayEnd === null) {
        match = PREFIX_PATTERN.exec(result);
        // Malformed call syntax; move on to the next match
        continue;
      }

      // Extract children content
      const childrenContent = result.slice(arrayStart + 1, arrayEnd);

      // Check if childrenContent still contains nested prefix calls
      if (/\bprefix\s*\(/.test(childrenContent)) {
        match = PREFIX_PATTERN.exec(result);
        // Skip, will be processed in next iteration
        continue;
      }

      // Find the closing paren after the array
      const callEnd = result.indexOf(')', arrayEnd);
      // Skip this match if the call's closing paren can't be located
      if (callEnd === -1) {
        match = PREFIX_PATTERN.exec(result);
        // Malformed call syntax; move on to the next match
        continue;
      }

      // Replace this prefix call
      const before = result.slice(0, startIndex);
      const after = result.slice(callEnd + 1);
      result = `${before}{\n        path: ${pathArg},\n        children: [${childrenContent}]\n    }${after}`;
      changed = true;
      // Restart the outer while loop from the beginning since the string layout changed
      break; // Restart from beginning
    }
  }

  return result;
}

/**
 * Inserts import statements after existing imports
 */
function insertImports(code: string, importStatements: string[]): string {
  const imports = code.match(IMPORT_STATEMENT_PATTERN);
  // Insert after the last existing import so generated imports don't break import ordering
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = code.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    return (
      code.slice(0, insertPosition) +
      '\n' +
      importStatements.join('\n') +
      '\n' +
      code.slice(insertPosition)
    );
  }
  // No existing imports, add at the top
  return `${importStatements.join('\n')}\n${code}`;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * Vite plugin that transforms the Fusion React Router DSL into standard React Router data routes.
 *
 * The plugin scans source files for imports of `layout`, `index`, `route`, and `prefix`
 * from `@equinor/fusion-framework-react-router/routes`, inspects the referenced page modules
 * to discover available exports (`default`, `clientLoader`, `action`, `handle`, `ErrorElement`),
 * and rewrites the DSL calls into plain `RouteObject` definitions at build time.
 *
 * @param options - Optional configuration for the plugin.
 * @returns A Vite plugin instance.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { reactRouterPlugin } from '@equinor/fusion-framework-vite-plugin-react-router';
 *
 * export default defineConfig({
 *   plugins: [react(), reactRouterPlugin({ debug: true })],
 * });
 * ```
 */
export const reactRouterPlugin = (options: ReactRouterPluginOptions = {}): Plugin => {
  const { debug = false } = options;
  let projectRoot: string;

  return {
    name: 'fusion:react-router',
    config(config: UserConfig) {
      projectRoot = normalizePathSeparators(config.root ?? process.cwd());

      // Debug logging is opt-in to avoid noisy build output by default
      if (debug) {
        console.log('[fusion:react-router] Project root:', projectRoot);
      }
    },
    transform(code, id) {
      try {
        // Vite initializes the project root through the config hook before transforming modules.
        if (!projectRoot) {
          return null;
        }

        const normalizedId = normalizePathSeparators(id);
        const projectRootPrefix = projectRoot.endsWith('/') ? projectRoot : `${projectRoot}/`;
        const isWithinProject =
          normalizedId === projectRoot || normalizedId.startsWith(projectRootPrefix);

        // Vite module IDs use POSIX separators even when the configured root uses Windows separators.
        if (!isWithinProject || normalizedId.includes('/node_modules/')) {
          return null;
        }

        // Check if the file contains DSL route imports
        if (!code.match(ROUTE_IMPORT_PATTERN)) {
          return null;
        }

        // Check if the file contains actual DSL route calls
        if (!code.match(ROUTE_CALL_PATTERN)) {
          // Debug logging is opt-in to avoid noisy build output by default
          if (debug) {
            console.log(
              '[fusion:react-router] File has DSL imports but no route calls, skipping transformation',
            );
          }
          return null;
        }

        // Debug logging is opt-in to avoid noisy build output by default
        if (debug) {
          console.log(
            '[fusion:react-router] Transforming file:',
            normalizedId.replace(projectRoot, ''),
          );
        }

        // Extract all file paths from DSL route calls
        const filePaths = extractFilePaths(code);

        // Nothing to transform if no DSL route calls reference a file
        if (filePaths.size === 0) {
          return null;
        }

        // Generate unique variable names for each file's exports
        const fileToImports = new Map<string, RouteImports>();

        // Resolve the recognised exports for every route file referenced in this module
        filePaths.forEach((filePath) => {
          const componentName = generateComponentName(filePath);
          const availableExports = getAvailableExports(filePath, id, debug);

          fileToImports.set(filePath, {
            component: componentName,
            clientLoader: availableExports.has('clientLoader')
              ? `clientLoader${componentName}`
              : undefined,
            action: availableExports.has('action') ? `action${componentName}` : undefined,
            handle: availableExports.has('handle') ? `handle${componentName}` : undefined,
            errorElement: availableExports.has('ErrorElement')
              ? `ErrorElement${componentName}`
              : undefined,
            hydrateFallback: availableExports.has('HydrateFallback')
              ? `HydrateFallback${componentName}`
              : undefined,
            shouldRevalidate: availableExports.has('shouldRevalidate')
              ? `shouldRevalidate${componentName}`
              : undefined,
            availableExports,
          });
        });

        // Generate import statements
        const importStatements = generateImportStatements(fileToImports, filePaths.size > 0);

        // Transform DSL calls to plain RouteObject structures
        let transformedCode = code;

        // Replace import.meta.resolve() with just the file path string
        transformedCode = transformedCode.replace(IMPORT_META_RESOLVE_PATTERN, '"$1"');

        // Transform index() calls
        transformedCode = transformedCode.replace(INDEX_PATTERN, (match, filePath) => {
          const imports = fileToImports.get(filePath);
          // Leave the call untouched if we never resolved exports for this file
          if (!imports) return match;
          const properties = buildRouteProperties(imports);
          return `{\n        index: true,\n        ${properties}\n    }`;
        });

        // Transform layout() calls with single argument
        transformedCode = transformedCode.replace(LAYOUT_SINGLE_PATTERN, (match, filePath) => {
          const imports = fileToImports.get(filePath);
          // Leave the call untouched if we never resolved exports for this file
          if (!imports) return match;
          const properties = buildRouteProperties(imports);
          return `{\n        ${properties}\n    }`;
        });

        // Transform layout() calls with children
        transformedCode = transformNestedCall(
          transformedCode,
          LAYOUT_NESTED_PATTERN,
          /\blayout\s*\(/,
          (_filePath, childrenContent, imports) => {
            // Leave the call untouched if we never resolved exports for this file
            if (!imports) return null;
            const properties = buildRouteProperties(imports);
            return `{\n        ${properties},\n        children: ${childrenContent}\n    }`;
          },
          fileToImports,
        );

        // Transform route() calls
        transformedCode = transformedCode.replace(
          ROUTE_WITH_PATH_PATTERN,
          (match, pathArg, filePath) => {
            const imports = fileToImports.get(filePath);
            // Leave the call untouched if we never resolved exports for this file
            if (!imports) return match;
            const properties = buildRouteProperties(imports);
            return `{\n        path: ${pathArg},\n        ${properties}\n    }`;
          },
        );

        // Transform prefix() calls - prefix doesn't use file paths, just path strings
        transformedCode = transformPrefix(transformedCode);

        // Remove DSL imports
        transformedCode = transformedCode.replace(DSL_IMPORT_REMOVE_PATTERN, '');

        // Wrap single route object exports in arrays
        transformedCode = wrapSingleRouteExports(transformedCode);

        // Insert import statements
        transformedCode = insertImports(transformedCode, importStatements);

        return transformedCode;
      } catch (error) {
        console.error('[fusion:react-router] Error during transformation:', error);
        return code;
      }
    },
  };
};
