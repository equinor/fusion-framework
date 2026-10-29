---
description: Rules for handling Dependabot pull requests
name: Dependabot PR Rules
---

# Dependabot PR Rules

Repository facts for Dependabot PRs. Review behavior comes from the APM-installed
`fusion-dependency-review` skill; automated maintenance follows its runner.

## TL;DR (for AI agents)

- Dependabot PRs target `maintenance/dependencies`. That branch's CI runs the full
  `pnpm test && pnpm build && pnpm -w check` suite, and maintainers fix and validate there before promotion to `main`.
- Changesets are mandatory for dependency changes that affect published packages (see changeset decision below).
- Refresh branches by rebasing only; never merge the base branch into a Dependabot branch.
- Regenerate `pnpm-lock.yaml` with `pnpm install`; never hand-merge lockfile hunks or invent resolutions.
- Squash-merge dependency PRs.

## Changeset decision for dependency PRs

A changeset is **mandatory** when the dependency update affects any published package. All packages under `packages/` with `"publishConfig": { "access": "public" }` are published.

### Compilable packages (always require changesets)

These packages produce build artifacts and must always get a changeset for dependency changes:

- `@equinor/fusion-framework-cli` — CLI tool (rollup build, has `bin` executables)
- `@equinor/fusion-framework-dev-portal` — Dev portal app (vite build)
- `@equinor/fusion-framework-dev-server` — Dev server library (tsc build)

### Other published packages

Any package under `packages/` with `publishConfig` requires a changeset when its dependencies change, including all `@equinor/fusion-framework-*` packages.

### Cookbook packages

`cookbooks/*` packages are versioned and published — always create a changeset when their dependencies change, including dev dependencies.

### Identifying affected packages

1. Check which `package.json` files changed in the PR diff.
2. For each changed `package.json`, read the `name` field.
3. If the package has `publishConfig`, it needs a changeset.
4. If only `pnpm-lock.yaml` changed, trace which packages are affected by checking the lockfile diff for workspace package entries.

### When to skip

- Lockfile-only changes with no `package.json` manifest modifications in published packages.
- Changes to `devDependencies` that do not affect the published output of a non-cookbook package.

### Bump type

| Upstream change | Bump type | Summary prefix |
|----------------|-----------|----------------|
| Patch or minor dep update | `patch` | `Internal:` |
| Major dep update (no breaking consumer impact) | `patch` | `Internal:` |
| Major dep update with consumer-facing changes | `minor` or `major` | (describe the impact) |

### Changeset format

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old-version>` to `<new-version>`.
```

## AI review scheduling

AI research uses one repository-wide concurrency slot. Preserve the research job's
fixed concurrency group, `queue: max`, and `cancel-in-progress: false` so reviews
for different PRs wait without replacing each other. Per-PR workflow gates remain separate.

## Validation commands

Keep `react` and `react-dom` runtime updates together in the Dependabot `react`
group. Direct runtime and type dependencies use `catalog:react`, defined in
`pnpm-workspace.yaml`; update its `react` and `react-dom` entries to the same
exact version. Preserve consumer-facing peer ranges. Type packages in the
catalog do not need the same version as the runtime.

The full validation suite runs in CI on `maintenance/dependencies`; run it locally when you change code:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Rebase strategy

- Always rebase Dependabot branches; never merge the base branch into the PR branch.
- After rebase, run `pnpm install --frozen-lockfile`. If the lockfile is out of sync, resolve the intended
  dependency inputs and regenerate it with `pnpm install`.
- Push rebased branches with `git push --force-with-lease`.

## Merge strategy

- Use **squash merge** for dependency PRs.
- Keep the commit message concise: `chore(deps): bump <package> from <old> to <new>`.
