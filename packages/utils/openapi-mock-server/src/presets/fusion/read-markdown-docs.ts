import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';

/** One markdown file with a YAML frontmatter mapping, as read by {@link readMarkdownDocs}. */
export interface MarkdownDoc {
  /** File name, used in error messages. */
  fileName: string;
  /** Parsed frontmatter mapping. */
  fields: Record<string, unknown>;
  /** Markdown body after the frontmatter block, without leading blank lines. */
  body: string;
  /** File modification time, standing in for the Help API's `lastModified`. */
  lastModified: Date;
}

/** Matches a leading YAML frontmatter block and captures it plus the markdown body after it. */
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/;

/**
 * Reads every top-level `*.md` file with a YAML frontmatter mapping in a folder, in file-name order —
 * the same non-recursive scan `fhelp` uses. Files without frontmatter (e.g. a README) are skipped.
 *
 * Reads from disk on every call, so edits and new files are picked up without a restart.
 *
 * @param dir - Folder to scan.
 * @returns Parsed documents in file-name order.
 * @throws {Error} When the folder cannot be read, or a frontmatter block is not valid YAML.
 */
export async function readMarkdownDocs(dir: string): Promise<MarkdownDoc[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const fileNames = entries
    // Like fhelp, only top-level markdown files are help documents; subfolders hold other kinds.
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    // Only names are needed to read the files.
    .map((entry) => entry.name)
    .sort();

  // Files are read in parallel; Promise.all keeps results in the sorted file-name order.
  const reads = fileNames.map(async (fileName): Promise<MarkdownDoc | undefined> => {
    const path = join(dir, fileName);
    const [source, stats] = await Promise.all([readFile(path, 'utf8'), stat(path)]);
    const match = FRONTMATTER_PATTERN.exec(source);
    // Markdown without frontmatter is not a help document.
    if (!match) return undefined;
    const [, frontmatterSource = '', body = ''] = match;
    let fields: unknown;
    try {
      fields = parseYaml(frontmatterSource);
    } catch (error) {
      throw new Error(
        `Invalid help document frontmatter in "${fileName}": ${(error as Error).message}`,
        { cause: error },
      );
    }
    // Scalar or list frontmatter has no fields to read.
    if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) return undefined;
    return {
      fileName,
      fields: fields as Record<string, unknown>,
      body: body.replace(/^\s*\n/, ''),
      lastModified: stats.mtime,
    };
  });
  const docs = await Promise.all(reads);
  // Skipped files resolve to undefined and are dropped.
  return docs.filter((doc): doc is MarkdownDoc => doc !== undefined);
}

export default readMarkdownDocs;
