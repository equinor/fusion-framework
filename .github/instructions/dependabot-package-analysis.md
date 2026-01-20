# Finding Package Usage in pnpm Monorepo (Dependabot Guidance)

When reviewing Dependabot or manual dependency PRs in Fusion Framework, use this guide to understand package impact and blast radius before merging.

## Quick Decision Tree

**1. First, what package is being upgraded?**
```bash
# Look at the PR title: e.g., "build(deps): bump lodash from 4.x to 5.x"
# Run this from repo root:
PACKAGE="lodash"
pnpm why "$PACKAGE" --recursive --depth=0
```

**Output shows:** Which workspace packages directly depend on it.

**2. How widespread is it?**

- **1–2 workspaces**: Low risk, check one changelog
- **3–5 workspaces**: Medium risk, test carefully
- **6+ workspaces**: High risk, core shared dep — review thoroughly

**3. Is it a dev tool or production dependency?**

```bash
# Check if it appears mainly in devDependencies
pnpm why "$PACKAGE" --recursive --json | jq -r '.[] | "\(.workspace): \(.dependencyType)"'
# (or without jq: pnpm why "$PACKAGE" --recursive | grep -E 'devDependencies|dependencies')
```

- **devDependencies only** → usually safer (unless it's eslint, typescript, vite, vitest, jest, rollup, playwright, storybook)
- **dependencies** → production impact — more caution needed
- **Both** → requires full testing

**4. Are there version inconsistencies?**

```bash
# See real resolved versions
pnpm why "$PACKAGE" --recursive --json \
  | jq -r '.[] | "\(.workspace)\t→ \(.version)"'
```

- **All same version** → good, consistent
- **Multiple versions** → check if workspace:* controls it or if overrides are needed
- **Very different** (e.g., v4 vs v5) → potential bugs, test before merge

## Merge Decision Checklist

Before clicking "Approve & Merge" on a Dependabot PR:

- [ ] Run `pnpm why <PACKAGE> --recursive --depth=0` to see spread
- [ ] Check if marked `workspace:*` (almost always safe) or has mixed versions (riskier)
- [ ] For high-spread packages (6+), skim the package's CHANGELOG for breaking changes
- [ ] For tooling (eslint, vite, etc.), verify lint/build still works
- [ ] For major version bumps in production deps, request test results or run locally

## Common Patterns

### Safe to merge immediately (low friction)

✅ One or two workspaces affected  
✅ Uses `workspace:*` or workspace protocol  
✅ Only appears in `devDependencies`  
✅ Patch or minor version bump  

### Requires careful review (plan ahead)

⚠️ 5+ workspaces affected  
⚠️ Appears in production (`dependencies`)  
⚠️ Major version bump  
⚠️ Touches core tools (eslint, typescript, vite, vitest)  

### Escalate to team (discuss before merge)

🚫 Package used as shared library (everyone depends on it)  
🚫 Multiple conflicting versions after upgrade  
🚫 Breaking changes with no migration path  
🚫 Touches build or CI infrastructure  

## Full Commands Reference

See `.github/skills/pnpm-dependency-analysis/SKILL.md` for:
- Core dependency lookup commands
- Workspace graph visualization (Mermaid)
- One-liner investigation reports
- Risk assessment table
- Filter techniques for large monorepos

## For Automating This

Copilot Agents can use the `pnpm-dependency-analysis` skill automatically. In chat or agent mode, ask:

- "Analyze deps for lodash in this PR"
- "What's the blast radius for upgrading typescript?"
- "Show me which packages use @tanstack/react-query"

The skill will load pnpm commands and guide analysis.

---

**Last updated:** January 2026  
**Applies to:** All Dependabot / manual dependency updates  
**Maintained by:** Fusion Framework team
