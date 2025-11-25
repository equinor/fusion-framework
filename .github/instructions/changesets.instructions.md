---
description: Rules for creating changesets for version management
name: Changeset Rules
applyTo: ".changeset/**/*.md"
---

# Changeset Rules

## TL;DR (for AI agents)

- **When**: Any change to a published package or `.md` docs → create a changeset (docs use `@equinor/fusion-framework-docs`).
- **Type**: Feature → `minor`, bugfix → `patch`, internal refactor → `patch` with `Internal:` prefix, breaking change → `major` with migration notes.
- **Format**: File in `.changeset/` named `{package-name}_{short-description}.md` with YAML frontmatter listing packages and bump types.
- **Content**: Write consumer-focused summaries (3–4 lines for summary content; issue references don't count), reference issues, include migration or code examples for complex/breaking changes.
- **Scope**: Prefer one package per changeset; only group packages when changes and message are identical.

## When to Create Changesets

**Create changeset for:**
- ✅ New features (minor bump)
- ✅ Bug fixes (patch bump)
- ✅ Breaking changes (major bump)
- ✅ Documentation updates (patch for `@equinor/fusion-framework-docs`)
- ✅ Internal refactoring (patch with "Internal:" prefix)

**Skip changeset for:**
- ❌ Workspace root changes (monorepo config, tooling, CI)
- ❌ Test-only changes (unless fixing public API tests)

## Changeset Format

### File Location and Naming
- **Directory**: `.changeset/` (singular, not `.changesets/`)
- **Naming**: `{package-name}_{short-description}.md`
  - Use package name without `@equinor/` scope
  - Use kebab-case
  - Keep filename under 50 characters
  - Examples: `framework_add-feature.md`, `react-module_fix-bug.md`

### Frontmatter
```markdown
---
"@equinor/fusion-framework": minor
---
```

**Rules:**
- One package per changeset (preferred)
- Multiple packages only if identical changes/messages
- Determine package name from `package.json` `name` field
- Use correct version bump: `major`, `minor`, or `patch`

### Version Bump Types
- **major**: Breaking/incompatible API or behavior changes
- **minor**: Backward-compatible new features or enhancements
- **patch**: Backward-compatible bug fixes or internal changes

### Summary Writing
Write summaries as if consumers will read them directly:

```markdown
---
"@equinor/fusion-framework": minor
---

Add optional `invalidate` argument to `Query.query` for pre-execution cache invalidation.

```typescript
// Before
await query('data');

// After
await query('data', { invalidate: true });
```

Fixes: https://github.com/equinor/fusion-framework/issues/123
```

**Guidelines:**
- Be specific and consumer-focused
- Keep summary content under 3-4 lines (issue references and contributor credits don't count toward this limit)
- Include code examples for complex features
- Reference issues: `Fixes #123` or `Closes #123`
- Credit contributors: `Thanks @username`

**Breaking Changes:**
- Include migration instructions
- Show before/after code if complex
- Link to migration guide if extensive

### Internal Changes
```markdown
---
"@equinor/fusion-framework": patch
---

Internal: refactor module loading to simplify dependency graph; no public API changes.
```

## AI Agent Rules

When creating changesets:
1. Analyze git state: staged → unstaged → branch diff
2. Check `.changeset/` for existing changesets first
3. Create changeset for ALL package changes
4. Prefer one package per changeset
5. Use package name (without scope) as filename prefix
6. Mark internal changes with "Internal:" prefix
7. Include migration notes for breaking changes

## Common Mistakes to Avoid

- ❌ Using `.changesets/` instead of `.changeset/`
- ❌ Grouping unrelated changes in one changeset
- ❌ Missing affected packages in frontmatter
- ❌ Vague summaries or wrong version bump
- ❌ Skipping changesets for package changes
- ❌ Omitting migration notes for breaking changes

