# Fusion Framework Evaluation Index

Shared evaluation infrastructure for validating Fusion Framework MCP search retrieval quality. Domain files in this directory define expected coding patterns, conventions, and usage guidance that the search index must surface accurately.

## Purpose

The evaluation index exists to:

- Define authoritative framework patterns that retrieval must return correctly
- Provide structured test material for validating index freshness and accuracy
- Give contributors a clear format for documenting patterns that drive evaluation
- Support automated evaluation workflows that compare retrieval results against expected patterns

## How it works

Each **domain file** describes a set of patterns for a specific area of Fusion Framework. When the search index is evaluated, queries derived from these patterns are run against the index, and the results are checked for accuracy and completeness.

A pattern represents a single coding convention, API usage rule, or architectural requirement. Each pattern includes:

- A descriptive name
- A requirement level (`must` or `should`)
- Canonical code examples or file references showing the correct approach
- Context explaining when and why the pattern applies

## Directory structure

```
eval/
  index/
    README.md            # This file — framework overview and contribution guide
    core.md              # Core framework patterns (modules, providers, initialization)
    state-data.md        # State management and data flow patterns
    http-services.md     # HTTP client and service layer patterns
    auth.md              # Authentication and authorization patterns
    ui-components.md     # React components and UI patterns
    features.md          # Feature flags, bookmarks, and app-level features
    utilities.md         # Shared utilities and helper patterns
```

## Domain file template

Every domain file follows the same markdown structure. Use this template when adding new patterns to a domain file.

### File header

Each domain file starts with a title and a one-line summary of what the domain covers:

```markdown
# Domain Name

Brief description of which part of Fusion Framework this domain covers and what kinds of patterns belong here.
```

### Pattern format

Each pattern is a level-2 heading followed by structured sections:

```markdown
## Pattern: Descriptive Pattern Name

**Requirement:** `must` | `should`

Brief explanation of what this pattern requires and why it matters for Fusion Framework consumers.

### Example

\`\`\`typescript
// Canonical code example showing the correct approach
import { something } from '@equinor/fusion-framework-module-something';

const result = something.doTheRightThing();
\`\`\`

### File references

- `packages/modules/something/src/provider.ts` — where the pattern is implemented
- `cookbooks/app-react/src/App.tsx` — cookbook example demonstrating usage

### Notes

- Any constraints, edge cases, or related patterns worth mentioning
- Links to related patterns in other domain files when relevant
```

### Requirement levels

- **`must`** — A hard requirement. Code that violates this pattern is incorrect or will break. The search index must surface this pattern accurately for relevant queries.
- **`should`** — A strong recommendation. Code that follows this pattern is idiomatic and maintainable. The search index should surface this pattern for relevant queries but it is not a correctness issue if missed.

### Complete single-pattern example

Below is a fully populated example pattern showing the expected format:

```markdown
## Pattern: Use scoped package imports

**Requirement:** `must`

Always import from scoped `@equinor/fusion-framework-*` package names. Never use relative imports to reach into other monorepo packages. Scoped imports ensure correct dependency resolution and allow each package to be versioned and published independently.

### Example

\`\`\`typescript
// Correct — scoped package import
import { useFramework } from '@equinor/fusion-framework-react';

// Incorrect — relative cross-package import
import { useFramework } from '../../react/src/useFramework';
\`\`\`

### File references

- `packages/react/src/useFramework.ts` — hook implementation
- `.github/instructions/monorepo-structure.instructions.md` — import rules

### Notes

- This applies to all source code, tests, and cookbooks
- The `workspace:^` protocol is used in `package.json` but never in source imports
```

## How to contribute

1. Identify which domain file your pattern belongs to
2. Add a new `## Pattern:` section following the template above
3. Choose the correct requirement level (`must` or `should`)
4. Include at least one code example showing the correct approach
5. Add file references pointing to real files in the repository
6. Submit a PR with the pattern addition

### Guidelines

- One pattern per `## Pattern:` section — keep patterns focused and atomic
- Use real package names, exported symbols, and file paths from the repository
- Keep code examples minimal but realistic enough to be unambiguous
- Prefer showing both correct and incorrect approaches when the distinction matters
- Cross-reference related patterns in other domain files using relative links

## Related

- **Parent issue:** [equinor/fusion-core-tasks#599](https://github.com/equinor/fusion-core-tasks/issues/599) — Fusion Framework documentation index freshness
- **Evaluation automation:** Covered in separate follow-up issues
- **Framework instructions:** `.github/instructions/` — source-of-truth rules for code generation
