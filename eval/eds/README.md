# EDS Evaluation Index

Evaluation infrastructure for validating EDS (Equinor Design System) search retrieval quality in the dedicated EDS index. Domain files in this directory define expected search queries and what the index should return for each.

## How it works

Each **domain file** lists search queries as `##` headings. Under each heading, bullet points describe what the index **must** or **should** return. When evaluating, run the heading as a search query against the EDS index and check results against the expectations.

## Directory structure

```
eval/
  eds/
    README.md            # This file
    components.md        # Input, feedback, navigation, surface, data-display components
    tokens.md            # Color tokens (light/dark), spacing, sizing, elevation
    icons.md             # Icon discovery, import patterns, categories
    foundation.md        # Colour system, accessibility, typography, design patterns
    getting-started.md   # Installation, EdsProvider, package structure
```

## Format

Each domain file follows the same structure as `eval/index/`:

```markdown
# Domain Name

Judgement instructions for this domain.

## Search query as a natural question

- must mention X
- must show Y pattern
- should reference Z
```

### Requirement levels

- **`must`** — the index must surface this for the query; absence means a gap
- **`should`** — the index should ideally surface this; absence is not critical

## Index details

- **Index name**: `eds-2026-03-14`
- **Embedding model**: `text-embedding-3-large`
- **Content sources**: Storybook-extracted docs (64), doc-site pages (104), token/icon references (7)
- **Config**: `fusion-ai.config.eds.ts`

## How to contribute

1. Pick the right domain file
2. Add a `##` heading phrased as a natural question developers would search for
3. Add `must` and `should` bullets for what the index should return
