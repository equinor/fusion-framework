import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Package source root. TSDoc is copied verbatim into the emitted declarations, so ranking the
 * source comments measures the same text a consumer's editor and a retrieval index both see.
 */
const SRC = fileURLToPath(new URL('../../', import.meta.url));

/** The natural-language probe: how a developer would search for this package's entry points. */
const QUERY = 'httpclient request service roles user';

/** Every `.ts` module that ships, excluding tests and fixtures. */
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return entry === '__tests__' ? [] : sourceFiles(full);
    return full.endsWith('.ts') ? [full] : [];
  });

/** Folds a simple English plural, so `roles` and `role` rank as one term. */
const stem = (token: string): string =>
  token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token;

/**
 * Tokenizes documentation the way a subword retrieval model sees it.
 *
 * Word runs, camelCase parts, and joins of adjacent parts are all emitted, so `IHttpClient` and
 * the prose `HTTP client` both produce `httpclient` — the form a developer actually types.
 *
 * @param text - Documentation prose plus the symbol name.
 * @returns Stemmed tokens, with repeats preserved so term frequency stays meaningful.
 */
const tokenize = (text: string): string[] => {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const tokens = [...words];
  for (const word of text.match(/[A-Za-z][A-Za-z0-9]*/g) ?? []) {
    const parts = word
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(/\s+/)
      .map((part) => part.toLowerCase());
    tokens.push(...parts);
    // Joining neighbouring parts is what lets a one-word query match a two-word phrase.
    for (let index = 0; index < parts.length - 1; index += 1) {
      tokens.push(parts[index] + parts[index + 1]);
    }
  }
  for (let index = 0; index < words.length - 1; index += 1) {
    tokens.push(words[index] + words[index + 1]);
  }
  return tokens.map(stem);
};

/** One retrievable documentation chunk: a documented declaration or a module's package doc. */
type Chunk = { id: string; file: string; text: string; tokens: string[] };

/** Splits every shipped module into the documentation chunks a retrieval index would store. */
const buildCorpus = (): Chunk[] => {
  const chunks: Chunk[] = [];
  for (const file of sourceFiles(SRC)) {
    const source = readFileSync(file, 'utf8');
    const relative = path.relative(SRC, file);
    const declarations = source.matchAll(
      /\/\*\*([\s\S]*?)\*\/\s*\n(?:export )?(?:declare )?(const|type|enum) (\w+)/g,
    );
    for (const [, comment, , name] of declarations) {
      const prose = comment.replace(/^[ \t]*\*[ \t]?/gm, ' ').replace(/\s+/g, ' ');
      const text = `${name} ${prose}`;
      chunks.push({ id: name, file: relative, text, tokens: tokenize(text) });
    }
    const packageDoc = source.match(/\/\*\*[\s\S]*?@packageDocumentation[\s\S]*?\*\//);
    if (packageDoc) {
      const text = packageDoc[0].replace(/^[ \t]*\*[ \t]?/gm, ' ').replace(/\s+/g, ' ');
      chunks.push({
        id: `@packageDocumentation ${relative}`,
        file: relative,
        text,
        tokens: tokenize(text),
      });
    }
  }
  return chunks;
};

/**
 * Ranks documentation chunks against a query with BM25.
 *
 * A lexical ranker is a deterministic *proxy* for the embedding search a retrieval index runs:
 * it cannot judge meaning, but it does prove the canonical entry points carry the vocabulary a
 * developer searches with, and that unrelated internals do not outrank them.
 *
 * @param corpus - Documentation chunks to rank.
 * @param query - Natural-language query.
 * @returns The matching chunks, highest scoring first.
 */
const rank = (corpus: Chunk[], query: string): Chunk[] => {
  const terms = [...new Set((query.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem))];
  const averageLength = corpus.reduce((sum, chunk) => sum + chunk.tokens.length, 0) / corpus.length;
  const k1 = 1.5;
  const b = 0.75;
  return corpus
    .map((chunk) => {
      const counts = new Map<string, number>();
      for (const token of chunk.tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
      const score = terms.reduce((sum, term) => {
        const frequency = counts.get(term) ?? 0;
        if (frequency === 0) return sum;
        const matches = corpus.filter((other) => other.tokens.includes(term)).length;
        const idf = Math.log(1 + (corpus.length - matches + 0.5) / (matches + 0.5));
        const length = chunk.tokens.length / averageLength;
        return sum + (idf * (frequency * (k1 + 1))) / (frequency + k1 * (1 - b + b * length));
      }, 0);
      return { chunk, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b2) => b2.score - a.score || a.chunk.id.localeCompare(b2.chunk.id))
    .map((entry) => entry.chunk);
};

const ranked = rank(buildCorpus(), QUERY);
const topIds = ranked.slice(0, 25).map((chunk) => chunk.id);

describe(`retrieval probe: "${QUERY}"`, () => {
  it('surfaces the package entry point', () => {
    expect(topIds).toContain('@packageDocumentation roles/index.ts');
  });

  it.each([
    'getRole',
    'listRoles',
    'createRole',
    'deleteRole',
    'assignRole',
    'listRoleAssignments',
    'listAccountRoleAssignments',
    'listAccountAccessRoleAssignments',
  ])('surfaces %s', (endpoint) => {
    expect(topIds).toContain(endpoint);
  });

  it('ranks endpoint operations above versioned schema internals', () => {
    // A query about calling the service must not answer with a model schema module, which is
    // what happens when endpoint documentation is too generic to compete.
    const schemaChunks = ranked.slice(0, 25).filter((chunk) => chunk.file.includes('v1/schemas'));
    expect(schemaChunks.map((chunk) => chunk.id)).toEqual([]);
  });

  it('covers every query term in at least one endpoint entry point', () => {
    const entryPoints = ranked
      .slice(0, 25)
      .filter((chunk) => chunk.file.includes('roles/endpoints'));
    const terms = ['httpclient', 'request', 'service', 'role', 'user'];
    const uncovered = terms.filter(
      (term) => !entryPoints.some((chunk) => chunk.tokens.includes(term)),
    );
    expect(uncovered).toEqual([]);
  });
});
