import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, UserConfig } from 'vite';

export interface ReactRouterPluginOptions {
  /** Whether to enable debug logging. Defaults to false */
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
 * Extracts all file paths from DSL route calls in the code
 */
function extractFilePaths(code: string): Set<string> {
  const filePaths = new Set<string>();

  // Helper to add relative paths
  const addIfRelative = (path: string) => {
    if (path && isRelativePath(path)) {
      filePaths.add(path);
    }
  };

  // Match import.meta.resolve() patterns
  let match = IMPORT_META_RESOLVE_PATTERN.exec(code);
  while (match !== null) {
    addIfRelative(match[1]);
    match = IMPORT_META_RESOLVE_PATTERN.exec(code);
  }

  // Match index() and layout() calls with single file path argument
  match = SINGLE_ARG_PATTERN.exec(code);
  while (match !== null) {
    addIfRelative(match[2]);
    match = SINGLE_ARG_PATTERN.exec(code);
  }

  // Match layout() calls with import.meta.resolve() and children
  match = LAYOUT_WITH_RESOLVE_PATTERN.exec(code);
  while (match !== null) {
    addIfRelative(match[1]);
    match = LAYOUT_WITH_RESOLVE_PATTERN.exec(code);
  }

  // Match layout() calls with file path string and children
  match = LAYOUT_WITH_CHILDREN_PATTERN.exec(code);
  while (match !== null) {
    addIfRelative(match[1]);
    match = LAYOUT_WITH_CHILDREN_PATTERN.exec(code);
  }

  // Match route() calls with path and file path arguments
  match = ROUTE_PATTERN.exec(code);
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
  const extensions = ['.tsx', '.ts', '.jsx', '.js', ''];
  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }

  return null;
}

/**
 * Checks what exports exist in a file
 */
function getAvailableExports(filePath: string, currentFileId: string, debug: boolean): Set<string> {
  const availableExports = new Set<string>();

  try {
    const currentDir = path.dirname(currentFileId);
    const actualPath = resolveFilePath(filePath, currentDir);

    if (!actualPath) {
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
    const exportNames = ['clientLoader', 'action', 'handle', 'ErrorElement'];
    for (const name of exportNames) {
      if (
        fileContent.match(EXPORT_NAMED_PATTERN(name)) ||
        fileContent.match(EXPORT_REEXPORT_PATTERN(name))
      ) {
        availableExports.add(name);
      }
    }
  } catch (error) {
    if (debug) {
      console.warn(`[fusion:react-router] Error reading file ${filePath}:`, error);
    }
  }

  return availableExports;
}

/**
 * Generates a PascalCase component name from a file path
 */
function generateComponentName(filePath: string): string {
  const baseName = path.basename(filePath, path.extname(filePath));
  return (
    baseName.charAt(0).toUpperCase() +
    baseName.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase())
  );
}

/**
 * Builds route object properties string from imports
 */
function buildRouteProperties(imports: RouteImports): string {
  const properties: string[] = [];

  if (imports.availableExports.has('default')) {
    properties.push(`Component: ${imports.component}`);
  }

  if (imports.clientLoader) {
    properties.push(`loader: ${imports.clientLoader}`);
  }

  if (imports.action) {
    properties.push(`action: ${imports.action}`);
  }

  if (imports.handle) {
    properties.push(`handle: ${imports.handle}`);
  }

  if (imports.errorElement) {
    properties.push(`errorElement: ${imports.errorElement}`);
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
      `import { useLoaderData, useActionData, useRouteError } from 'react-router-dom';`,
      `import { useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
    );
  }

  // Generate imports for each route file
  fileToImports.forEach((imports, filePath) => {
    const importParts: string[] = [];

    if (imports.availableExports.has('default')) {
      importParts.push(`default as ${imports.component}`);
    }
    if (imports.clientLoader) {
      importParts.push(`clientLoader as ${imports.clientLoader}`);
    }
    if (imports.action) {
      importParts.push(`action as ${imports.action}`);
    }
    if (imports.handle) {
      importParts.push(`handle as ${imports.handle}`);
    }
    if (imports.errorElement) {
      importParts.push(`ErrorElement as ${imports.errorElement}`);
    }

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

  while (i < code.length && count > 0) {
    if (code[i] === openChar) count++;
    if (code[i] === closeChar) count--;
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

  while (changed) {
    changed = false;
    // Use matchAll to collect matches for current iteration
    const matches = Array.from(result.matchAll(pattern));

    for (const m of matches) {
      // Defensive check: ensure we have a valid index
      const startIndex = m.index ?? -1;
      if (startIndex < 0) {
        continue;
      }

      const filePath = m[1];
      const argsStart = startIndex + m[0].length;

      // Find the opening paren of the function call (it's in the matched string)
      const openParenIndex = result.indexOf('(', startIndex);
      if (openParenIndex === -1) {
        continue;
      }

      // Find matching closing delimiter starting from the opening paren
      const delimiterEnd = findMatchingDelimiter(result, openParenIndex, '(', ')');
      if (delimiterEnd === null) {
        continue;
      }

      // Extract children content (everything between comma and closing paren)
      const childrenContent = result.slice(argsStart, delimiterEnd).trim();

      // Check if childrenContent still contains nested calls
      if (nestedPattern.test(childrenContent)) {
        continue; // Skip, will be processed in next iteration
      }

      const imports = fileToImports.get(filePath);
      const replacement = buildReplacement(filePath, childrenContent, imports);

      if (replacement !== null) {
        const before = result.slice(0, startIndex);
        const after = result.slice(delimiterEnd + 1);
        result = before + replacement + after;
        changed = true;
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

  while (match !== null) {
    const valueStart = match.index + match[0].length;

    // Skip whitespace
    let i = valueStart;
    while (i < result.length && /\s/.test(result[i])) {
      i++;
    }

    // Check if it starts with { (object)
    if (result[i] === '{') {
      const braceEnd = findMatchingDelimiter(result, i, '{', '}');
      if (braceEnd !== null) {
        const objectContent = result.slice(i, braceEnd + 1);

        // Check if it contains Component: (it's a route object)
        if (objectContent.includes('Component:')) {
          const beforeBrace = result.slice(valueStart, i).trim();
          if (!beforeBrace.startsWith('[')) {
            // Wrap in array
            const before = result.slice(0, valueStart);
            const after = result.slice(braceEnd + 1);
            result = `${before}[${objectContent}]${after}`;
            // Restart search
            EXPORT_PATTERN.lastIndex = 0;
            match = EXPORT_PATTERN.exec(result);
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

  while (changed) {
    changed = false;
    let match: RegExpExecArray | null = PREFIX_PATTERN.exec(result);

    while (match !== null) {
      const startIndex = match.index;
      const pathArg = match[1];
      const arrayStart = match.index + match[0].length - 1; // Position of opening [

      // Find matching closing bracket
      const arrayEnd = findMatchingDelimiter(result, arrayStart, '[', ']');
      if (arrayEnd === null) {
        match = PREFIX_PATTERN.exec(result);
        continue;
      }

      // Extract children content
      const childrenContent = result.slice(arrayStart + 1, arrayEnd);

      // Check if childrenContent still contains nested prefix calls
      if (/\bprefix\s*\(/.test(childrenContent)) {
        match = PREFIX_PATTERN.exec(result);
        continue; // Skip, will be processed in next iteration
      }

      // Find the closing paren after the array
      const callEnd = result.indexOf(')', arrayEnd);
      if (callEnd === -1) {
        match = PREFIX_PATTERN.exec(result);
        continue;
      }

      // Replace this prefix call
      const before = result.slice(0, startIndex);
      const after = result.slice(callEnd + 1);
      result = `${before}{\n        path: ${pathArg},\n        children: [${childrenContent}]\n    }${after}`;
      changed = true;
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

export const reactRouterPlugin = (options: ReactRouterPluginOptions = {}): Plugin => {
  const { debug = false } = options;
  let projectRoot: string;

  return {
    name: 'fusion:react-router',
    config(config: UserConfig) {
      projectRoot = config.root ?? process.cwd();

      if (debug) {
        console.log('[fusion:react-router] Project root:', projectRoot);
      }
    },
    transform(code, id) {
      try {
        // Skip files outside the project root or in node_modules
        if (!projectRoot || !id.startsWith(projectRoot) || id.includes('node_modules')) {
          return null;
        }

        // Check if the file contains DSL route imports
        if (!code.match(ROUTE_IMPORT_PATTERN)) {
          return null;
        }

        // Check if the file contains actual DSL route calls
        if (!code.match(ROUTE_CALL_PATTERN)) {
          if (debug) {
            console.log(
              '[fusion:react-router] File has DSL imports but no route calls, skipping transformation',
            );
          }
          return null;
        }

        if (debug) {
          console.log('[fusion:react-router] Transforming file:', id.replace(projectRoot, ''));
        }

        // Extract all file paths from DSL route calls
        const filePaths = extractFilePaths(code);

        if (filePaths.size === 0) {
          return null;
        }

        // Generate unique variable names for each file's exports
        const fileToImports = new Map<string, RouteImports>();

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
          if (!imports) return match;
          const properties = buildRouteProperties(imports);
          return `{\n        index: true,\n        ${properties}\n    }`;
        });

        // Transform layout() calls with single argument
        transformedCode = transformedCode.replace(LAYOUT_SINGLE_PATTERN, (match, filePath) => {
          const imports = fileToImports.get(filePath);
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
