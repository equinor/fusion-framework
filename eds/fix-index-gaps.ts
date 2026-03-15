/**
 * fix-index-gaps.ts — Patch EDS index output to close eval gaps
 *
 * 1. Remove empty component skeleton pages (only headings + empty sections)
 * 2. Prepend an import one-liner to each story extraction
 *
 * Safe to re-run: each step is idempotent.
 *
 * Usage: bun run eds/fix-index-gaps.ts
 */
import { readdir, readFile, writeFile, unlink, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';

const BASE_DIR = process.argv[2] ?? join(import.meta.dirname, 'out');
const COMPONENTS_DIR = join(BASE_DIR, 'components');
const STORIES_DIR = join(BASE_DIR, 'stories');
const ASSETS_DIR = join(COMPONENTS_DIR, 'assets');

// ─── 1. Remove empty component skeleton pages ──────────────────────────────

/** Returns true if the file is an empty skeleton (only headings, frontmatter,
 *  admonition fences, bare list markers, bold markers, and whitespace). */
function isEmpty(content: string): boolean {
  const stripped = content
    .replace(/^---[\s\S]*?^---/m, '') // frontmatter
    .replace(/^#.*$/gm, '') // headings
    .replace(/^:::.*/gm, '') // admonition fences
    .replace(/^- *$/gm, '') // bare list markers
    .replace(/^\*\*.*$/gm, '') // bold markers
    .replace(/\s+/g, ''); // all whitespace
  return stripped.length === 0;
}

async function collectMdFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMdFiles(full)));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

async function removeEmptySkeletons(): Promise<void> {
  console.log('=== Step 1: Remove empty component skeleton pages ===');
  const files = await collectMdFiles(COMPONENTS_DIR);
  let removed = 0;
  let kept = 0;

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    if (isEmpty(content)) {
      console.log(`  REMOVE: ${file}`);
      await unlink(file);
      removed++;
    } else {
      kept++;
    }
  }

  console.log(`  Removed: ${removed} | Kept: ${kept}\n`);
}

// ─── 2. Prepend import one-liner to story extractions ───────────────────────

/** Overrides where the story heading name differs from the eds-core-react export. */
const IMPORT_OVERRIDES: Record<string, string> = {
  Chips: 'Chip',
  Lists: 'List',
  Circular: 'Progress',
  Dots: 'Progress',
  Linear: 'Progress',
  Star: 'Progress',
  Preview: 'Icon',
  Group: 'Button',
  Toggle: 'Button',
  Heading: 'Typography',
  Paragraph: 'Typography',
  TypographyNext: 'Typography',
};

/** Headings that don't map to a component import. */
const SKIP_HEADINGS = new Set([
  '# Equinor Design System Storybook',
  '# Playground/Examples',
  '# @equinor/utils',
  '# Foundation/Spacing',
  '# Icons', // preview page, no heading slash
]);

function getImportName(heading: string): string | null {
  if (SKIP_HEADINGS.has(heading.trim())) return null;

  // Extract last path segment: "# Category/Sub/Component" → "Component"
  const withoutHash = heading.replace(/^#\s*/, '');
  const segments = withoutHash.split('/');
  const component = segments[segments.length - 1].trim();

  return IMPORT_OVERRIDES[component] ?? component;
}

async function prependImportLines(): Promise<void> {
  console.log('=== Step 2: Prepend import line to story files ===');
  const entries = await readdir(STORIES_DIR);
  let patched = 0;
  let skipped = 0;

  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    const file = join(STORIES_DIR, name);
    const content = await readFile(file, 'utf-8');

    // Already patched?
    if (content.includes('@equinor/eds-core-react')) {
      skipped++;
      continue;
    }

    const heading = content.split('\n')[0];
    const importName = getImportName(heading);

    if (!importName) {
      console.log(`  SKIP (non-component): ${basename(file)}`);
      skipped++;
      continue;
    }

    const importLine = `> **Package:** \`@equinor/eds-core-react\` — \`import { ${importName} } from '@equinor/eds-core-react'\``;

    // Insert import line after the heading (line 1)
    const lines = content.split('\n');
    const patched_content = [lines[0], '', importLine, ...lines.slice(1)].join('\n');
    await writeFile(file, patched_content);

    console.log(`  PATCH: ${basename(file)} → import { ${importName} }`);
    patched++;
  }

  console.log(`  Patched: ${patched} | Skipped: ${skipped}\n`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

await rm(ASSETS_DIR, { recursive: true, force: true });
console.log(`Removed assets directory: ${ASSETS_DIR}`);
await removeEmptySkeletons();
await prependImportLines();
console.log('=== Done ===');
