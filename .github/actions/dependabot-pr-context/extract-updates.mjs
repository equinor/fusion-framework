// Extracts the dependency updates described by a Dependabot PR (body table, sentences, title) as sorted unique JSON.
import { readFileSync } from 'node:fs';

const pr = JSON.parse(readFileSync(0, 'utf8'));
const updates = [];
for (const line of (pr.body ?? '').split('\n')) {
  const table = line.match(/^\| \[([^\]]+)\]\([^)]*\) \| `([^`]+)` \| `([^`]+)` \|$/);
  if (table) updates.push({ name: table[1], from: table[2], to: table[3] });

  const sentence = line.match(/^Updates `([^`]+)` from ([^ ]+) to ([^ ]+)$/);
  if (sentence) {
    updates.push({ name: sentence[1], from: sentence[2], to: sentence[3] });
  }
}

const title = pr.title.match(/[Bb]ump (.+) from ([^ ]+) to ([^ ]+)(?: in .+)?$/);
if (title) updates.push({ name: title[1], from: title[2], to: title[3] });

const unique = [
  ...new Map(
    updates.map((update) => [JSON.stringify([update.name, update.from, update.to]), update]),
  ).values(),
].sort((a, b) =>
  JSON.stringify([a.name, a.from, a.to]).localeCompare(JSON.stringify([b.name, b.from, b.to])),
);
process.stdout.write(JSON.stringify(unique));
