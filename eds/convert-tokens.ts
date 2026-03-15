const out = './tokens';
await Bun.$`mkdir -p ${out}`.quiet();

type TokenMap = Record<string, string | number>;

/** Read and parse a JSON token file. */
const readTokens = (file: string): Promise<TokenMap> => Bun.file(file).json();

/** Convert a flat { key: value } token JSON file into a markdown table. */
async function convert(file: string, title: string, prefix: string, unit = ''): Promise<string> {
  const tokens = await readTokens(file);
  const rows = Object.entries(tokens).map(([key, val]) => {
    const cssVar = `${prefix}${key}`;
    const display = typeof val === 'number' ? `${val}${unit}` : val;
    return `| \`${cssVar}\` | \`${display}\` |`;
  });
  return `# ${title}\n\nInstall: \`pnpm install @equinor/eds-tokens\`\nImport: \`@import '@equinor/eds-tokens/css/variables';\`\n\n| CSS Variable | Value |\n|---|---|\n${rows.join('\n')}\n`;
}

// Color tokens — static semantic (light theme, explicit category in var name)
await Bun.write(
  `${out}/color-tokens-light.md`,
  await convert(
    'json/color/static/flat/semantic.json',
    'EDS Color Tokens — Light Theme (Static Semantic)',
    '--eds-color-',
  ),
);

// Color tokens — dark scheme
await Bun.write(
  `${out}/color-tokens-dark.md`,
  await convert(
    'json/color/color-scheme/flat/dark-semantic.json',
    'EDS Color Tokens — Dark Theme',
    '--eds-color-',
  ),
);

// Spacing tokens — both density modes
await Bun.write(
  `${out}/spacing-tokens-spacious.md`,
  await convert(
    'json/spacing/flat/spacious.json',
    'EDS Spacing & Sizing Tokens — Spacious Density',
    '--eds-',
    'px',
  ),
);

await Bun.write(
  `${out}/spacing-tokens-comfortable.md`,
  await convert(
    'json/spacing/flat/comfortable.json',
    'EDS Spacing & Sizing Tokens — Comfortable Density',
    '--eds-',
    'px',
  ),
);

// Dynamic color tokens (per-category, used with data-color-appearance)
const categories = ['accent', 'neutral', 'success', 'info', 'warning', 'danger'] as const;
const dynamicRows = (
  await Promise.all(
    categories.map(async (cat) => {
      const tokens = await readTokens(`json/color/dynamic/flat/semantic-${cat}.json`);
      const heading = `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (\`data-color-appearance="${cat}"\`)\n`;
      const rows = Object.entries(tokens).map(
        ([key, val]) => `| \`--eds-color-${key}\` | \`${val}\` |`,
      );
      return `${heading}\n| CSS Variable | Value |\n|---|---|\n${rows.join('\n')}`;
    }),
  )
).join('\n\n');

await Bun.write(
  `${out}/color-tokens-dynamic.md`,
  `# EDS Dynamic Color Tokens\n\nThese tokens resolve per semantic category set via \`data-color-appearance\` on a parent element.\nThe CSS variable names omit the category — the attribute controls which palette is active.\n\nInstall: \`pnpm install @equinor/eds-tokens\`\nImport: \`@import '@equinor/eds-tokens/css/variables';\`\n\n${dynamicRows}\n`,
);

console.log('Token markdown generated:', out);
