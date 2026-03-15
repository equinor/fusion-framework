# Tokens

These queries test whether the EDS index surfaces accurate design token information
when developers ask about CSS variables, color values, spacing, and sizing tokens.

When judging results, verify that:
- Returned CSS variable names are real `--eds-*` tokens, not invented names.
- Token values match the actual theme (light vs dark) referenced in the query.
- Results distinguish between light and dark theme tokens when relevant.
- Spacing and sizing tokens reference the correct density mode (comfortable vs spacious).
- Install and import instructions reference `@equinor/eds-tokens`.

## What color token to use for a danger background

- must return a CSS variable matching `--eds-color-bg-danger-*`
- must show at least `--eds-color-bg-danger-surface` or `--eds-color-bg-danger-fill-emphasis-default`
- must reference `@equinor/eds-tokens` as the source package
- should distinguish between light and dark theme values
- should mention related text token `--eds-color-text-danger-*` for pairing

## How to use EDS spacing tokens for layout padding

- must mention `--eds-spacing-*` CSS variables
- must reference comfortable or spacious density modes
- must mention `@equinor/eds-tokens` and the CSS import path
- should show specific spacing variable examples like `--eds-spacing-comfortable-medium`
- should mention the 8px increment base scale

## What are the dark theme background color tokens in EDS

- must return `--eds-color-bg-neutral-canvas` and `--eds-color-bg-neutral-surface` with dark theme values
- must mention that dark theme tokens are in the dark color scheme
- should list accent, success, warning, danger, and info background categories
- should reference `@import '@equinor/eds-tokens/css/variables'` for CSS import

## How to set icon sizes using EDS sizing tokens

- must mention `--eds-sizing-icon-*` CSS variables
- must show size scale from `xs` through `6xl` with pixel values
- must reference `@equinor/eds-tokens` as the source
- should mention that icon sizing tokens differ between comfortable and spacious density

## What EDS tokens are available for elevation and shape

- must mention elevation or shape-related tokens if they exist in the index
- should reference the foundation design-tokens documentation for elevation and shape
- should mention `--eds-sizing-stroke-thin` and `--eds-sizing-stroke-thick` for border tokens

## How to import and use EDS CSS token variables in a project

- must show `@import '@equinor/eds-tokens/css/variables'` or equivalent import path
- must mention `pnpm install @equinor/eds-tokens` for installation
- must show usage of CSS variables in styling (e.g., `var(--eds-color-bg-neutral-surface)`)
- should mention that tokens support both light and dark themes via `data-color-scheme` or similar
