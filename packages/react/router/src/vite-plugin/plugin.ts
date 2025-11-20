import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, UserConfig } from 'vite';

export interface ReactRouterPluginOptions {
  /** Whether to enable debug logging. Defaults to false */
  debug?: boolean;
  /** Whether to transform all files with DSL routes or only specific ones. Defaults to false (all files) */
  strict?: boolean;
}

export const reactRouterPlugin = (options: ReactRouterPluginOptions = {}): Plugin => {
  const { debug = false, strict = false } = options;
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

        // Check if the file contains DSL route imports from our package
        const hasRouteImports =
          /import\s*{\s*[^}]*\b(route|index|layout|prefix)\b[^}]*}\s*from\s*['"]@equinor\/fusion-framework-react-router(?:\/routes)?['"]/g.test(
            code,
          );

        if (!hasRouteImports) {
          return null;
        }

        // Check if the file contains actual DSL route calls (not just imports)
        const hasRouteCalls = /\b(route|index|layout|prefix)\s*\(/g.test(code);

        if (!hasRouteCalls) {
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
        const filePaths = new Set<string>();

        // Match import.meta.resolve() patterns
        const importMetaResolvePattern = /import\.meta\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let match = importMetaResolvePattern.exec(code);
        while (match !== null) {
          const filePath = match[1];
          if (filePath && (filePath.startsWith('./') || filePath.startsWith('../'))) {
            filePaths.add(filePath);
          }
          match = importMetaResolvePattern.exec(code);
        }

        // Match index() and layout() calls with single file path argument
        const singleArgPattern = /\b(index|layout)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        match = singleArgPattern.exec(code);
        while (match !== null) {
          const filePath = match[2];
          if (filePath && (filePath.startsWith('./') || filePath.startsWith('../'))) {
            filePaths.add(filePath);
          }
          match = singleArgPattern.exec(code);
        }

        // Match layout() calls with import.meta.resolve() and children
        const layoutWithResolvePattern =
          /\blayout\s*\(\s*import\.meta\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)\s*,\s*[^)]+\s*\)/g;
        match = layoutWithResolvePattern.exec(code);
        while (match !== null) {
          const filePath = match[1];
          if (filePath && (filePath.startsWith('./') || filePath.startsWith('../'))) {
            filePaths.add(filePath);
          }
          match = layoutWithResolvePattern.exec(code);
        }

        // Match layout() calls with file path string and children
        const layoutWithChildrenPattern = /\blayout\s*\(\s*['"]([^'"]+)['"]\s*,\s*[^)]+\s*\)/g;
        match = layoutWithChildrenPattern.exec(code);
        while (match !== null) {
          const filePath = match[1];
          if (filePath && (filePath.startsWith('./') || filePath.startsWith('../'))) {
            filePaths.add(filePath);
          }
          match = layoutWithChildrenPattern.exec(code);
        }

        // Match route() calls with path and file path arguments
        const routePattern = /\broute\s*\(\s*[^,]+,\s*['"]([^'"]+)['"]\s*\)/g;
        match = routePattern.exec(code);
        while (match !== null) {
          const filePath = match[1];
          if (filePath && (filePath.startsWith('./') || filePath.startsWith('../'))) {
            filePaths.add(filePath);
          }
          match = routePattern.exec(code);
        }

        if (filePaths.size === 0) {
          return null;
        }

        // Helper function to check what exports exist in a file
        const getAvailableExports = (filePath: string): Set<string> => {
          const availableExports = new Set<string>();
          try {
            // Resolve the file path relative to the current file
            const currentDir = path.dirname(id);
            const resolvedPath = path.resolve(currentDir, filePath);

            // Check if file exists (try with and without extensions)
            let actualPath = resolvedPath;
            if (!fs.existsSync(actualPath)) {
              // Try common extensions
              const extensions = ['.tsx', '.ts', '.jsx', '.js'];
              for (const ext of extensions) {
                const pathWithExt = resolvedPath + ext;
                if (fs.existsSync(pathWithExt)) {
                  actualPath = pathWithExt;
                  break;
                }
              }
            }

            if (!fs.existsSync(actualPath)) {
              if (debug) {
                console.warn(
                  `[fusion:react-router] File not found: ${filePath} (resolved: ${actualPath})`,
                );
              }
              return availableExports;
            }

            const fileContent = fs.readFileSync(actualPath, 'utf-8');

            // Check for default export
            if (/export\s+default|export\s*{\s*default\s*}/.test(fileContent)) {
              availableExports.add('default');
            }

            // Check for named exports
            if (
              /\bexport\s+(const|function|class|async\s+function)\s+clientLoader\b/.test(
                fileContent,
              )
            ) {
              availableExports.add('clientLoader');
            }
            if (/\bexport\s+(const|function|class|async\s+function)\s+action\b/.test(fileContent)) {
              availableExports.add('action');
            }
            if (/\bexport\s+(const|function|class)\s+handle\b/.test(fileContent)) {
              availableExports.add('handle');
            }
            if (/\bexport\s+(const|function|class)\s+ErrorElement\b/.test(fileContent)) {
              availableExports.add('ErrorElement');
            }

            // Also check for re-exports: export { clientLoader } from ...
            if (/export\s*{\s*[^}]*clientLoader[^}]*}\s*from/.test(fileContent)) {
              availableExports.add('clientLoader');
            }
            if (/export\s*{\s*[^}]*action[^}]*}\s*from/.test(fileContent)) {
              availableExports.add('action');
            }
            if (/export\s*{\s*[^}]*handle[^}]*}\s*from/.test(fileContent)) {
              availableExports.add('handle');
            }
            if (/export\s*{\s*[^}]*ErrorElement[^}]*}\s*from/.test(fileContent)) {
              availableExports.add('ErrorElement');
            }
          } catch (error) {
            if (debug) {
              console.warn(`[fusion:react-router] Error reading file ${filePath}:`, error);
            }
          }
          return availableExports;
        };

        // Generate unique variable names for each file's exports
        const fileToImports = new Map<
          string,
          {
            component: string;
            clientLoader?: string;
            action?: string;
            handle?: string;
            errorElement?: string;
            availableExports: Set<string>;
          }
        >();

        filePaths.forEach((filePath) => {
          // Generate base name from file path (e.g., './HomePage.tsx' -> 'HomePage')
          const baseName = path.basename(filePath, path.extname(filePath));
          const camelCaseName =
            baseName.charAt(0).toUpperCase() +
            baseName.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase());

          const availableExports = getAvailableExports(filePath);

          fileToImports.set(filePath, {
            component: camelCaseName,
            clientLoader: availableExports.has('clientLoader')
              ? `clientLoader${camelCaseName}`
              : undefined,
            action: availableExports.has('action') ? `action${camelCaseName}` : undefined,
            handle: availableExports.has('handle') ? `handle${camelCaseName}` : undefined,
            errorElement: availableExports.has('ErrorElement')
              ? `ErrorElement${camelCaseName}`
              : undefined,
            availableExports,
          });
        });

        // Generate import statements for route components
        const importStatements: string[] = [];
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
            importStatements.push(
              `import {\n    ${importParts.join(',\n    ')}\n} from '${filePath}';`,
            );
          }
        });

        // Add imports for React Router hooks and context (only if we have routes to transform)
        const needsRouterImports = filePaths.size > 0;
        if (needsRouterImports) {
          importStatements.unshift(
            `import React from 'react';`,
            `import { useLoaderData, useActionData, useRouteError } from 'react-router';`,
            `import { useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
          );
        }

        // Transform DSL calls to plain RouteObject structures
        let transformedCode = code;

        // First, replace import.meta.resolve() with just the file path string
        transformedCode = transformedCode.replace(
          /import\.meta\.resolve\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
          '"$1"',
        );

        // Helper function to build route object properties with wrapper functions
        const buildRouteProperties = (imports: {
          component: string;
          clientLoader?: string;
          action?: string;
          handle?: string;
          errorElement?: string;
          availableExports: Set<string>;
        }): string => {
          const properties: string[] = [];

          if (imports.availableExports.has('default')) {
            // Wrap Component to inject loaderData, actionData, and fusion
            properties.push(`Component: ${imports.component}`);
          }

          if (imports.clientLoader) {
            // Wrap clientLoader to inject fusion from context
            properties.push(`loader: ${imports.clientLoader}`);
          }

          if (imports.action) {
            // Wrap action to inject fusion from context
            properties.push(`action: ${imports.action}`);
          }

          if (imports.handle) {
            properties.push(`handle: ${imports.handle}`);
          }

          if (imports.errorElement) {
            // Wrap ErrorElement to inject error and fusion
            properties.push(`errorElement: ${imports.errorElement}`);
          }

          return properties.join(',\n        ');
        };

        // Transform index() calls to plain objects with index: true
        transformedCode = transformedCode.replace(
          /\bindex\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
          (match, filePath) => {
            const imports = fileToImports.get(filePath);
            if (!imports) return match;

            const properties = buildRouteProperties(imports);
            return `{\n        index: true,\n        ${properties}\n    }`;
          },
        );

        // Transform layout() calls with single argument to plain objects
        transformedCode = transformedCode.replace(
          /\blayout\s*\(\s*['"]([^'"]+)['"]\s*\)\s*(?!,)/g,
          (match, filePath) => {
            const imports = fileToImports.get(filePath);
            if (!imports) return match;

            const properties = buildRouteProperties(imports);
            return `{\n        ${properties}\n    }`;
          },
        );

        // Transform layout() calls with children (two arguments)
        // Use a function that properly handles nested structures
        const transformLayout = (code: string): string => {
          let result = code;
          let changed = true;

          while (changed) {
            changed = false;
            const layoutPattern = /\blayout\s*\(\s*['"]([^'"]+)['"]\s*,\s*/g;
            let match: RegExpExecArray | null = layoutPattern.exec(result);

            while (match !== null) {
              const startIndex = match.index;
              const filePath = match[1];
              const argsStart = match.index + match[0].length;

              // Find the matching closing paren by counting nested parens
              let parenCount = 1;
              let i = argsStart;
              let argsEnd = -1;

              while (i < result.length && parenCount > 0) {
                if (result[i] === '(') parenCount++;
                if (result[i] === ')') parenCount--;
                if (parenCount === 0) {
                  argsEnd = i;
                  break;
                }
                i++;
              }

              if (argsEnd === -1) {
                match = layoutPattern.exec(result);
                continue;
              }

              // Extract children argument (everything between the comma and closing paren)
              const childrenContent = result.slice(argsStart, argsEnd).trim();

              // Check if childrenContent still contains layout calls (nested)
              if (/\blayout\s*\(/.test(childrenContent)) {
                match = layoutPattern.exec(result);
                continue; // Skip, will be processed in next iteration
              }

              const imports = fileToImports.get(filePath);
              if (!imports) {
                match = layoutPattern.exec(result);
                continue;
              }

              const properties = buildRouteProperties(imports);
              const before = result.slice(0, startIndex);
              const after = result.slice(argsEnd + 1);
              result =
                before +
                `{\n        ${properties},\n        children: ${childrenContent}\n    }` +
                after;
              changed = true;
              break; // Restart from beginning
            }
          }

          return result;
        };

        transformedCode = transformLayout(transformedCode);

        // Transform route() calls to plain objects with path
        transformedCode = transformedCode.replace(
          /\broute\s*\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*\)/g,
          (match, pathArg, filePath) => {
            const imports = fileToImports.get(filePath);
            if (!imports) return match;

            const properties = buildRouteProperties(imports);
            return `{\n        path: ${pathArg},\n        ${properties}\n    }`;
          },
        );

        // Transform prefix() calls to plain objects with path and children
        // Use a function that properly handles nested brackets
        const transformPrefix = (code: string): string => {
          let result = code;
          let changed = true;

          while (changed) {
            changed = false;
            const prefixPattern = /\bprefix\s*\(\s*([^,]+)\s*,\s*\[/g;
            let match: RegExpExecArray | null = prefixPattern.exec(result);

            while (match !== null) {
              const startIndex = match.index;
              const pathArg = match[1];
              const arrayStart = match.index + match[0].length - 1; // Position of opening [

              // Find matching closing bracket by counting nested brackets
              let bracketCount = 1;
              let i = arrayStart + 1;
              let arrayEnd = -1;

              while (i < result.length && bracketCount > 0) {
                if (result[i] === '[') bracketCount++;
                if (result[i] === ']') bracketCount--;
                if (bracketCount === 0) {
                  arrayEnd = i;
                  break;
                }
                i++;
              }

              if (arrayEnd === -1) {
                match = prefixPattern.exec(result);
                continue; // No matching bracket found
              }

              // Check if this prefix call contains nested prefix calls
              const childrenContent = result.slice(arrayStart + 1, arrayEnd);
              if (/\bprefix\s*\(/.test(childrenContent)) {
                match = prefixPattern.exec(result);
                continue; // Skip, will be processed in next iteration
              }

              // Extract the full prefix call including closing paren
              const callEnd = result.indexOf(')', arrayEnd);
              if (callEnd === -1) {
                match = prefixPattern.exec(result);
                continue;
              }

              // Replace this prefix call
              const before = result.slice(0, startIndex);
              const after = result.slice(callEnd + 1);
              result =
                before +
                `{\n        path: ${pathArg},\n        children: [${childrenContent}]\n    }` +
                after;
              changed = true;
              break; // Restart from beginning
            }
          }

          return result;
        };

        transformedCode = transformPrefix(transformedCode);

        // Remove DSL imports since we're replacing them with plain objects
        transformedCode = transformedCode.replace(
          /import\s*{\s*[^}]*\b(route|index|layout|prefix)\b[^}]*}\s*from\s*['"]@equinor\/fusion-framework-react-router(?:\/routes)?['"];?\s*/g,
          '',
        );

        // Wrap single route object exports in arrays (Router expects RouteObject[])
        // This handles cases like: export const routes = layout(...) which becomes a single object
        const wrapSingleRouteExports = (code: string): string => {
          // Match: export const routes = { ... };
          const exportPattern = /export\s+const\s+\w+\s*=\s*/g;
          let match: RegExpExecArray | null = exportPattern.exec(code);

          while (match !== null) {
            const valueStart = match.index + match[0].length;

            // Skip whitespace
            let i = valueStart;
            while (i < code.length && /\s/.test(code[i])) {
              i++;
            }

            // Check if it starts with { (object) or [ (array)
            if (code[i] === '{') {
              // Find matching closing brace
              let braceCount = 1;
              let j = i + 1;
              let braceEnd = -1;

              while (j < code.length && braceCount > 0) {
                if (code[j] === '{') braceCount++;
                if (code[j] === '}') braceCount--;
                if (braceCount === 0) {
                  braceEnd = j;
                  break;
                }
                j++;
              }

              if (braceEnd !== -1) {
                const objectContent = code.slice(i, braceEnd + 1);
                // Check if it contains Component: (it's a route object)
                if (objectContent.includes('Component:')) {
                  // Check if it's already wrapped in array (look before for [)
                  const beforeBrace = code.slice(valueStart, i).trim();
                  if (!beforeBrace.startsWith('[')) {
                    // Wrap in array
                    const before = code.slice(0, valueStart);
                    const after = code.slice(braceEnd + 1);
                    code = before + '[' + objectContent + ']' + after;
                    // Restart search
                    exportPattern.lastIndex = 0;
                    match = exportPattern.exec(code);
                    continue;
                  }
                }
              }
            }

            match = exportPattern.exec(code);
          }

          return code;
        };

        transformedCode = wrapSingleRouteExports(transformedCode);

        // Insert import statements after existing imports
        // Find the last import statement
        const importRegex = /^import\s+.*?;$/gm;
        const imports = transformedCode.match(importRegex);
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const lastImportIndex = transformedCode.lastIndexOf(lastImport);
          const insertPosition = lastImportIndex + lastImport.length;
          transformedCode =
            transformedCode.slice(0, insertPosition) +
            '\n' +
            importStatements.join('\n') +
            '\n' +
            transformedCode.slice(insertPosition);
        } else {
          // No existing imports, add at the top
          transformedCode = `${importStatements.join('\n')}\n${transformedCode}`;
        }

        return transformedCode;
      } catch (error) {
        console.error('[fusion:react-router] Error during transformation:', error);
        // Return original code if transformation fails
        return code;
      }
    },
  };
};
