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

/** `export function x`, `export async function* x` and `export class X`; `declare` exports are type-only. */
const DECLARATION_EXPORT_PATTERN =
  /\bexport\s+(?:async\s+)?(?:function\s*\*?|(?:abstract\s+)?class)\s*([A-Za-z_$][\w$]*)/g;

/** Start of an exported variable statement; its declarators are parsed by {@link collectDeclaratorNames}. */
const VARIABLE_EXPORT_PATTERN = /\bexport\s+(?:const|let|var)\s/g;

const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*/;

/** Leading `key:` or `[computed]:` of an object pattern property. */
const PROPERTY_KEY_PATTERN = /^(?:[A-Za-z_$][\w$]*|\[[^\]]*\])\s*:/;

/** Keywords that start a new top-level statement, ending an initializer without a semicolon. */
const STATEMENT_START_PATTERN =
  /^(?:export|import|const|let|var|function|class|async|type|interface|declare|enum)\b/;

const OPENING_BRACKETS = '([{';
const CLOSING_BRACKETS = ')]}';

const DEFAULT_EXPORT_PATTERN = /\bexport\s+default\b/;

const EXPORT_LIST_PATTERN = /\bexport\s*(type\s*)?\{([^}]*)\}/g;

/**
 * Blanks a template literal, including `${...}` expressions and templates nested in
 * them. Expressions cannot contain export declarations, so blanking them is safe.
 *
 * @param source - Module source text.
 * @param out - Mutable characters of the blanked source.
 * @param start - Offset of the opening backtick.
 * @returns Offset after the closing backtick.
 */
function blankTemplate(source: string, out: string[], start: number): number {
  let index = start + 1;
  let depth = 0;
  // Scan until the backtick that closes this template at expression depth zero
  while (index < source.length) {
    const char = source[index];
    // Nested templates inside expressions are blanked recursively
    if (depth > 0 && char === '`') {
      index = blankTemplate(source, out, index);
      // The nested template already advanced past its closing backtick
      continue;
    }
    // The closing backtick ends the template
    if (depth === 0 && char === '`') return index + 1;
    // Escapes consume the next character so an escaped backtick does not close the template
    if (char === '\\') {
      out[index++] = ' ';
    } else if (char === '$' && source[index + 1] === '{' && depth === 0) {
      depth = 1;
      out[index++] = ' ';
    } else if (depth > 0 && char === '{') {
      depth++;
    } else if (depth > 0 && char === '}') {
      depth--;
    }
    // Line breaks survive so offsets and lines stay aligned
    if (index < source.length && source[index] !== '\n') out[index] = ' ';
    index++;
  }
  return index;
}

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
    } else if (char === '`') {
      index = blankTemplate(source, out, index);
    } else if (char === '"' || char === "'") {
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
 * Skips whitespace.
 *
 * @param code - Blanked module source.
 * @param index - Start offset.
 * @returns Offset of the next non-whitespace character, or the code length.
 */
function skipWhitespace(code: string, index: number): number {
  let cursor = index;
  // Advance over spaces, tabs and line breaks
  while (cursor < code.length && /\s/.test(code[cursor])) cursor++;
  return cursor;
}

/**
 * Skips a declarator's type annotation or initializer up to the token that ends it.
 *
 * Brackets are balanced so commas inside calls, objects and arrays do not end the
 * declarator. Inside type annotations `<...>` is balanced too and `=>` is not an
 * assignment. Without a semicolon, a line break ends the statement when the next
 * line starts a new declaration.
 *
 * @param code - Blanked module source.
 * @param index - Offset after `:` or `=`.
 * @param annotation - Whether a type annotation (rather than an initializer) is skipped.
 * @returns Offset of the terminating `,`, `;`, `=` (annotations only) or statement end.
 */
function skipDeclaratorPart(code: string, index: number, annotation: boolean): number {
  let depth = 0;
  let cursor = index;
  // Scan until a terminator is found at bracket depth zero
  for (; cursor < code.length; cursor++) {
    const char = code[cursor];
    // `=>` belongs to function types and arrow functions, never ends a part
    if (char === '=' && code[cursor + 1] === '>') {
      cursor++;
      // The arrow is consumed as a unit
      continue;
    }
    // Opening brackets (and generic `<` in types) nest
    if (OPENING_BRACKETS.includes(char) || (annotation && char === '<')) {
      depth++;
    } else if (CLOSING_BRACKETS.includes(char) || (annotation && char === '>')) {
      // A closing bracket at depth zero belongs to an enclosing block, ending the statement
      if (depth === 0) return cursor;
      depth--;
    } else if (depth === 0) {
      // Separators only count outside nested brackets
      if (char === ',' || char === ';' || (annotation && char === '=')) return cursor;
      // A line break followed by a new statement ends a semicolon-free declaration
      if (char === '\n' && STATEMENT_START_PATTERN.test(code.slice(skipWhitespace(code, cursor)))) {
        return cursor;
      }
    }
  }
  return cursor;
}

/**
 * Finds the offset of the bracket closing the one at `index`.
 *
 * @param code - Blanked module source.
 * @param index - Offset of an opening bracket.
 * @returns Offset of the matching closing bracket, or the code length.
 */
function findClosingBracket(code: string, index: number): number {
  let depth = 0;
  // Balance all bracket kinds; blanked strings cannot contain brackets
  for (let cursor = index; cursor < code.length; cursor++) {
    // Nested openings deepen the scan
    if (OPENING_BRACKETS.includes(code[cursor])) depth++;
    // The matching close returns to depth zero
    else if (CLOSING_BRACKETS.includes(code[cursor]) && --depth === 0) return cursor;
  }
  return code.length;
}

/**
 * Splits a destructuring pattern body on top-level commas.
 *
 * @param body - Text between the pattern brackets.
 * @returns Pattern elements.
 */
function splitPatternElements(body: string): string[] {
  const elements: string[] = [];
  let depth = 0;
  let start = 0;
  // Split only on commas that are not inside nested patterns or defaults
  for (let cursor = 0; cursor < body.length; cursor++) {
    // Track nesting so nested commas stay inside their element
    if (OPENING_BRACKETS.includes(body[cursor])) depth++;
    else if (CLOSING_BRACKETS.includes(body[cursor])) depth--;
    else if (body[cursor] === ',' && depth === 0) {
      elements.push(body.slice(start, cursor));
      start = cursor + 1;
    }
  }
  elements.push(body.slice(start));
  return elements;
}

/**
 * Collects binding names from a destructuring pattern such as `{ a, b: c, ...d }` or `[e, f = 1]`.
 *
 * @param pattern - Pattern text including its outer brackets.
 * @returns Bound names.
 */
function collectPatternNames(pattern: string): string[] {
  const names: string[] = [];
  const isObject = pattern.startsWith('{');
  // Each element binds one name, possibly through a nested pattern
  for (const rawElement of splitPatternElements(pattern.slice(1, -1))) {
    let element = rawElement.trim().replace(/^\.\.\./, '');
    const key = isObject ? PROPERTY_KEY_PATTERN.exec(element) : null;
    // In object patterns `key: target` binds the target, not the key
    if (key) element = element.slice(key[0].length).trim();
    // Defaults do not change the bound name
    const target = element.split('=')[0].trim();
    // Nested patterns bind their own names
    if (target.startsWith('{') || target.startsWith('[')) {
      names.push(...collectPatternNames(target));
    } else {
      const identifier = IDENTIFIER_PATTERN.exec(target);
      // Holes in array patterns bind nothing
      if (identifier) names.push(identifier[0]);
    }
  }
  return names;
}

/**
 * Collects the names bound by an exported variable statement, including every
 * declarator of `export const a = 1, b = 2` and simple destructuring patterns.
 *
 * @param code - Blanked module source.
 * @param index - Offset right after `export const|let|var`.
 * @returns Bound names; parsing stops conservatively at anything unexpected.
 */
function collectDeclaratorNames(code: string, index: number): string[] {
  const names: string[] = [];
  let cursor = index;
  // Read declarators until the statement ends
  while (cursor < code.length) {
    cursor = skipWhitespace(code, cursor);
    const declared: string[] = [];
    // Destructuring declarators bind every name in the pattern
    if (code[cursor] === '{' || code[cursor] === '[') {
      const end = findClosingBracket(code, cursor);
      declared.push(...collectPatternNames(code.slice(cursor, end + 1)));
      cursor = end + 1;
    } else {
      const identifier = IDENTIFIER_PATTERN.exec(code.slice(cursor));
      // Anything but a binding means this is not a declarator list we understand
      if (!identifier) break;
      declared.push(identifier[0]);
      cursor += identifier[0].length;
    }
    cursor = skipWhitespace(code, cursor);
    // Optional definite-assignment `!` before a type annotation
    if (code[cursor] === '!') cursor = skipWhitespace(code, cursor + 1);
    // Type annotations are skipped up to the initializer or separator
    if (code[cursor] === ':') cursor = skipDeclaratorPart(code, cursor + 1, true);
    // Initializers are skipped up to the next declarator or the statement end
    if (code[cursor] === '=') cursor = skipDeclaratorPart(code, cursor + 1, false);
    // Only a declarator followed by a separator or statement end is trusted
    if (cursor < code.length && !',;\n})'.includes(code[cursor]) && !/\s/.test(code[cursor])) {
      // Unrecognized syntax: stop rather than guess at later declarators
      break;
    }
    names.push(...declared);
    // A comma continues the declarator list; anything else ends the statement
    if (code[cursor] !== ',') break;
    cursor++;
  }
  return names;
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
 * declared inline (functions, classes and every declarator of a `const`/`let`/`var`
 * statement, including simple destructuring) or listed in an `export { ... }` clause
 * (including named re-exports). Comments and string contents are ignored, and
 * type-only and `declare` exports are not capabilities.
 *
 * The scan is a lightweight lexer, not a TypeScript parser, and is independent of the
 * Vite plugin's export detection. Known limitations: `export * from` re-exports
 * cannot be expanded without reading the target, so they contribute nothing, and
 * regular expression literals are not blanked.
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
  // Inline function and class declarations such as `export function clientLoader()`
  for (const match of code.matchAll(DECLARATION_EXPORT_PATTERN)) {
    exported.add(match[1]);
  }
  // Variable statements may declare several exports, e.g. `export const a = 1, action = 2`
  for (const match of code.matchAll(VARIABLE_EXPORT_PATTERN)) {
    // Each bound name is exported
    for (const name of collectDeclaratorNames(code, match.index + match[0].length)) {
      exported.add(name);
    }
  }
  // Walk the canonical table so capability order never depends on source order
  return CAPABILITY_EXPORTS.filter(([, name]) => exported.has(name)).map(
    // Report capability names rather than export names
    ([capability]) => capability,
  );
}
