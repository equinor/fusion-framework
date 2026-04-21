# Changeset Decision for Dependency PRs

## When a changeset is mandatory

A changeset **must** be created when the dependency update affects any published package. In the Fusion Framework monorepo, all packages with `publishConfig` in their `package.json` are published.

### Compilable packages (always require changesets)

These packages produce build artifacts and must always get a changeset for dependency changes:

- `@equinor/fusion-framework-cli` — CLI tool (rollup build, has `bin` executables)
- `@equinor/fusion-framework-dev-portal` — Dev portal app (vite build)
- `@equinor/fusion-framework-dev-server` — Dev server library (tsc build)

### Other published packages

Any package under `packages/` with `"publishConfig": { "access": "public" }` requires a changeset when its dependencies change. This includes:

- `@equinor/fusion-framework` (core)
- `@equinor/fusion-framework-app`
- `@equinor/fusion-framework-react`
- `@equinor/fusion-framework-module-*`
- `@equinor/fusion-framework-react-*`
- `@equinor/fusion-framework-vite-plugin-*`
- `@equinor/fusion-log`

## When to skip

- Lockfile-only changes with no `package.json` manifest modifications in published packages
- Changes to `devDependencies` that do not affect the published output

> **Note:** `cookbooks/*` packages are versioned and published — always create a changeset when their dependencies change, including dev dependencies.

## Bump type

| Upstream change | Bump type | Summary prefix |
|----------------|-----------|----------------|
| Patch or minor dep update | `patch` | `Internal:` |
| Major dep update (no breaking consumer impact) | `patch` | `Internal:` |
| Major dep update with consumer-facing changes | `minor` or `major` | (describe the impact) |

## Changeset format

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old-version>` to `<new-version>`.
```

## Identifying affected packages

1. Check which `package.json` files changed in the PR diff.
2. For each changed `package.json`, read the `name` field.
3. If the package has `publishConfig`, it needs a changeset.
4. If only `pnpm-lock.yaml` changed, trace which packages are affected by checking the lockfile diff for workspace package entries.
