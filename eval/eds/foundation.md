# Foundation

These queries test whether the EDS index surfaces design foundation knowledge
— colour system architecture, spacing guidelines, typography rules, accessibility,
and design patterns that guide consistent interface construction.

When judging results, verify that:
- Colour system results reference semantic categories (accent, neutral, success, danger, warning, info), not raw hex values alone.
- Spacing results reference the 8px grid system and named spacer sizes (XX Small through XXX Large).
- Typography results reference EDS heading and paragraph components or typographic guidelines.
- Accessibility results reference EDS-specific guidance, not generic WCAG summaries.
- Results come from doc-site foundation pages, not just component stories.

## How does the EDS colour system work with light and dark themes

- must mention semantic colour categories: accent, neutral, success, danger, warning, info
- must mention that colours are organised by role/purpose, not by shade
- must mention light and dark colour scheme support
- should mention `data-color-scheme` or `data-color-appearance` attribute for theme switching
- should reference the colour palette generator tool
- should mention that colour steps are designed for intentional contrast, not linear gradients

## What spacing scale does EDS use and how to apply it

- must mention the 8px increment base scale
- must list named spacer sizes: XX Small, X Small, Small, Medium, Large, X Large, XX Large, XXX Large
- must mention that XX Small and X Small are only for use inside components
- should reference the spacing foundation documentation
- should mention comfortable and spacious density modes

## How to set up typography with EDS heading and paragraph components

- must mention `Typography` or `Heading` or `Paragraph` from `@equinor/eds-core-react`
- must show heading level props or variant options
- should mention the Equinor font family
- should reference the typography foundation documentation for font sizes and line heights

## What accessibility guidelines does EDS provide for components

- must reference EDS accessibility documentation or guidelines
- must mention accessible colour combinations and contrast requirements
- should mention ARIA patterns or keyboard navigation for EDS components
- should mention that accessibility is a core principle of the colour system

## What design patterns does EDS recommend for consistent interfaces

- must reference the EDS patterns or guidelines documentation
- must mention at least one pattern category (layout, interaction, or composition)
- should reference the do/don't guidelines available in component documentation

## How to use EDS elevation and shape tokens for visual hierarchy

- must reference elevation or shape documentation from the design tokens foundation
- must mention at least one elevation or shape concept (shadows, border-radius, or z-index)
- should reference `@equinor/eds-tokens` for token values
- should mention how elevation creates visual hierarchy in interfaces
