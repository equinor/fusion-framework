import type { RouteModuleCapability } from './types.js';

/** Maps each recognized route module export to its capability, in canonical capability order. */
const CAPABILITY_EXPORTS: ReadonlyArray<readonly [RouteModuleCapability, string]> = [
  ['component', 'default'],
  ['clientLoader', 'clientLoader'],
  ['action', 'action'],
  ['handle', 'handle'],
  ['errorElement', 'ErrorElement'],
  ['hydrateFallback', 'HydrateFallback'],
  ['shouldRevalidate', 'shouldRevalidate'],
  ['middleware', 'middleware'],
];

const DECLARATION_EXPORT_PATTERN =
  /\bexport\s+(?:declare\s+)?(?:async\s+)?(?:function\s*\*?|const|let|var|class)\s*([A-Za-z_$][\w$]*)/g;

const DEFAULT_EXPORT_PATTERN = /\bexport\s+default\b/;

const EXPORT_LIST_PATTERN = /\bexport\s*(type\s*)?\{([^}]*)\}/g;

/**
 * Replaces comments and string/template literal contents with spaces so export
 * detection cannot match text that is not code. Offsets are preserved.
 *
 * @param source - Module source text.
 * @returns Source text with comments and literal contents blanked.
 */
function blankCommentsAndStrings(source: string): string {
  const out = source.split('');
  let index = 0;
  // A single forward scan keeps detection linear in the size of the module
  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];
    // Dispatch on the token that starts at the current position
    if (char === '/' && next === '/') {
      // Line comment runs until the end of the line
      while (index < source.length && source[index] !== '\n') {
        out[index++] = ' ';
      }
    } else if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      // Keep newlines so line-based reasoning in callers remains intact
      for (; index < stop; index++) {
        // Newlines survive blanking
        if (source[index] !== '\n') out[index] = ' ';
      }
    } else if (char === '"' || char === "'" || char === '`') {
      index++;
      // Blank the literal body, honouring escapes so an escaped quote does not end it early
      while (index < source.length && source[index] !== char) {
        // A backslash consumes the following character as part of the escape
        if (source[index] === '\\') {
          out[index++] = ' ';
        }
        // Blank the literal character but keep line breaks of template literals
        if (index < source.length && source[index] !== '\n') out[index] = ' ';
        index++;
      }
      index++;
    } else {
      index++;
    }
  }
  return out.join('');
}

/**
 * Collects exported names declared in `export { ... }` lists, ignoring type-only exports.
 *
 * @param code - Module source with comments and strings blanked.
 * @returns Exported names, including `default` for `export { x as default }`.
 */
function collectExportListNames(code: string): Set<string> {
  const names = new Set<string>();
  // Each match is one `export { ... }` clause
  for (const match of code.matchAll(EXPORT_LIST_PATTERN)) {
    // `export type { ... }` only carries types and never provides a runtime capability
    if (match[1]) continue;
    // Each comma-separated specifier may be aliased with `as`
    for (const rawSpecifier of match[2].split(',')) {
      const specifier = rawSpecifier.trim();
      // Inline `type` specifiers are erased at compile time, so they are not capabilities
      if (!specifier || /^type\s/.test(specifier)) continue;
      const parts = specifier.split(/\s+as\s+/);
      names.add((parts[1] ?? parts[0]).trim());
    }
  }
  return names;
}

/**
 * Detects the route module capabilities a module provides by statically scanning
 * its exports. The module is never imported or executed, so detection is safe for
 * build tooling and cannot run route components, loaders or actions.
 *
 * Recognized exports are `default` (component), `clientLoader`, `action`, `handle`,
 * `ErrorElement`, `HydrateFallback`, `shouldRevalidate` and `middleware`, whether
 * declared inline or listed in an `export { ... }` clause (including re-exports).
 *
 * @param source - Route module source text.
 * @returns Detected capabilities in canonical order.
 *
 * @example
 * ```ts
 * detectRouteModuleCapabilities('export default function Page() {}\nexport const clientLoader = load;');
 * // ['component', 'clientLoader']
 * ```
 */
export function detectRouteModuleCapabilities(source: string): RouteModuleCapability[] {
  const code = blankCommentsAndStrings(source);
  const exported = collectExportListNames(code);
  // `export default ...` declares the route component
  if (DEFAULT_EXPORT_PATTERN.test(code)) {
    exported.add('default');
  }
  // Inline declarations such as `export const clientLoader = ...`
  for (const match of code.matchAll(DECLARATION_EXPORT_PATTERN)) {
    exported.add(match[1]);
  }
  // Walk the canonical table so capability order never depends on source order
  return CAPABILITY_EXPORTS.filter(([, name]) => exported.has(name)).map(
    // Report capability names rather than export names
    ([capability]) => capability,
  );
}
