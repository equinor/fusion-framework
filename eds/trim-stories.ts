import { Glob } from 'bun';

const dir = './stories';

/** Remove empty `## Props` / `#### Props` sections (heading + optional blank lines, no table). */
function trimEmptyPropsSections(content: string): string {
  return content.replace(/^#{2,4} Props\n\n+(?=#{|$|\n*$)/gm, '');
}

/** Remove subcomponent blocks that have only a heading and an empty Props section. */
function trimEmptySubcomponents(content: string): string {
  return content.replace(/^### [^\n]+\n\n+#### Props\n\n+(?=###|\s*$)/gm, '');
}

/** Remove bare `### Name` headings with no content before the next heading or end of file. */
function trimEmptyHeadings(content: string): string {
  return content.replace(/^### [^\n]+\n\n+(?=#{2,3} |\s*$)/gm, '');
}

/** Remove a `## Subcomponents` section that has no remaining content. */
function trimEmptySubcomponentsSection(content: string): string {
  return content.replace(/^## Subcomponents\n\n+(?=## |\s*$)/gm, '');
}

/** Remove prop table rows where both Default and Description columns are empty. */
function trimEmptyPropRows(content: string): string {
  return content.replace(/^\|[^|]+\|[^|]+\|[^|]+\|\s+\|\s+\|\s*$/gm, '');
}

/** Remove bracket-only links with no display text, e.g. `[](iframe.html?...)`. */
function trimEmptyLinks(content: string): string {
  return content.replace(/^\[\]\([^)]+\)\s*$/gm, '');
}

/** Collapse runs of 3+ blank lines down to 2. */
function collapseBlankLines(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n');
}

const glob = new Glob('*.md');
let processed = 0;
let deleted = 0;

for await (const file of glob.scan(dir)) {
  const path = `${dir}/${file}`;

  // Remove beta component files — duplicates of stable docs with unstable APIs
  if (file.startsWith('eds-2-0-beta-')) {
    // @ts-expect-error Bun.glob doesn't support `rm` with `quiet` option, so we use the raw API here to avoid errors when files are already deleted.
    await Bun.$`rm ${path}`.quiet();
    deleted++;
    continue;
  }

  let content = await Bun.file(path).text();
  const before = content.length;

  content = trimEmptySubcomponents(content);
  content = trimEmptyHeadings(content);
  content = trimEmptySubcomponentsSection(content);
  content = trimEmptyPropsSections(content);
  content = trimEmptyPropRows(content);
  content = trimEmptyLinks(content);
  content = collapseBlankLines(content);
  content = content.trimEnd() + '\n';

  if (content.length !== before) {
    await Bun.write(path, content);
    processed++;
  }
}

console.log(`Deleted ${deleted} beta files, trimmed ${processed} story files`);
