/** Keywords after which a `/` starts a regular expression literal instead of a division. */
const REGEX_PRECEDING_KEYWORDS: ReadonlySet<string> = new Set([
  'await',
  'case',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'in',
  'instanceof',
  'new',
  'of',
  'return',
  'throw',
  'typeof',
  'void',
  'yield',
]);

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
 * Decides whether a `/` at `index` starts a regular expression literal rather than a
 * division, from the previous significant token of the already blanked output.
 *
 * A regex can only start where an expression is expected: at the start of the
 * module, after an operator or opening punctuation, or after a keyword such as
 * `return`. After an identifier, a number, `)` or `]` the slash divides.
 *
 * @param out - Blanked characters before `index`.
 * @param index - Offset of the slash.
 * @returns `true` when the slash starts a regex literal.
 */
function startsRegex(out: readonly string[], index: number): boolean {
  let cursor = index - 1;
  // Whitespace and blanked comments do not form tokens
  while (cursor >= 0 && /\s/.test(out[cursor])) cursor--;
  // A slash at the start of the module begins an expression
  if (cursor < 0) return true;
  const previous = out[cursor];
  // Punctuation that cannot end an operand is always followed by an expression
  if ('(,=:[!&|?{};+-*%<>~^'.includes(previous)) return true;
  // Identifiers and numbers end an operand, unless they are expression-introducing keywords
  if (/[\w$]/.test(previous)) {
    let start = cursor;
    // Read back to the start of the word
    while (start > 0 && /[\w$]/.test(out[start - 1])) start--;
    return REGEX_PRECEDING_KEYWORDS.has(out.slice(start, cursor + 1).join(''));
  }
  return false;
}

/**
 * Finds the end of a regular expression literal starting at `start`.
 *
 * @param source - Module source text.
 * @param start - Offset of the opening slash.
 * @returns Offset after the closing slash and flags, or `-1` when the slash does not
 *   start a well-formed single-line regex.
 */
function findRegexEnd(source: string, start: number): number {
  let index = start + 1;
  let inClass = false;
  // A regex literal cannot span lines, which bounds a mistaken guess
  while (index < source.length && source[index] !== '\n') {
    const char = source[index];
    // Escapes consume the next character, including escaped slashes and brackets
    if (char === '\\') {
      index += 2;
      // The escaped character is part of the body
      continue;
    }
    // A slash inside a character class does not end the literal
    if (char === '[') inClass = true;
    else if (char === ']') inClass = false;
    else if (char === '/' && !inClass) {
      index++;
      // Flags directly follow the closing slash
      while (index < source.length && /[a-z]/i.test(source[index])) index++;
      return index;
    }
    index++;
  }
  return -1;
}

/**
 * Replaces comments, string, template and regular expression literal contents with
 * spaces so source scans cannot match text that is not code. Offsets and line
 * breaks are preserved, and quote characters stay in place so callers can read
 * literal values (such as import specifiers) from the original source.
 *
 * Regex literals are told apart from division by the preceding token, which is the
 * usual lexer heuristic; this is not a full TypeScript parser.
 *
 * @param source - Module source text.
 * @returns Source text with comments and literal contents blanked.
 */
export function blankModuleSource(source: string): string {
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
    } else if (char === '/' && startsRegex(out, index) && findRegexEnd(source, index) > 0) {
      const end = findRegexEnd(source, index);
      // Keep the opening slash so the literal still separates the surrounding tokens
      for (index++; index < end; index++) out[index] = ' ';
    } else if (char === '`') {
      index = blankTemplate(source, out, index);
    } else if (char === '"' || char === "'") {
      index++;
      // Blank the literal body, honouring escapes so an escaped quote does not end it early.
      // Quoted strings cannot span lines, so an unmatched quote (such as an apostrophe in
      // JSX text) only blanks the rest of its line.
      while (index < source.length && source[index] !== char && source[index] !== '\n') {
        // A backslash consumes the following character as part of the escape
        if (source[index] === '\\') {
          out[index++] = ' ';
        }
        // Blank the literal character
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
