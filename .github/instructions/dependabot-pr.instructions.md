---
description: Rules for handling Dependabot pull requests
name: Dependabot PR Rules
---

# Dependabot PR Rules

## TL;DR (for AI agents)

- Do not approve, merge, push, close, or comment on a Dependabot PR without explicit user confirmation (batch-level confirmation counts for the solver skill).
- If the branch needs refreshing, use rebase-only refreshes; never merge the base branch into the PR branch.
- Abort conflicting rebases for ordinary Dependabot handling. Only explicitly enabled Greenkeeper tasks may
  attempt the bounded local resolution described under [Greenkeeper conflict exception](#greenkeeper-conflict-exception).
- If the PR needs patching, follow `.github/instructions/workflow-contribution.instructions.md`.
- Treat missing changesets, missing validation, or weak PR-template usage as explicit findings.
- Changesets are mandatory for dependency changes that affect published packages (see changeset decision below).
- Validate with `pnpm test && pnpm build && pnpm -w check` before declaring the PR ready to merge.

## Skills

| Intent | Skill |
|--------|-------|
| Review a single dependency PR in detail | `.agents/skills/fusion-dependency-review/SKILL.md` |
| Batch-process multiple Dependabot PRs with auto-merge | `.agents/skills/custom-dependency-pr-solver/SKILL.md` |

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

Run the full validation suite before declaring the PR ready to merge:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Rebase strategy

- Always rebase Dependabot branches; never merge the base branch into the PR branch.
- After rebase, run `pnpm install --frozen-lockfile`. If the lockfile is out of sync, resolve the intended
  dependency inputs and regenerate it with `pnpm install`, then repeat the frozen install and required validation.
- Publication requires explicit authorization and `git push --force-with-lease`; Greenkeeper publication is
  host-only under the exception below.
- By default, if rebase conflicts occur, abort the rebase and report manual intervention to the maintainer.
  Mark the PR as `needs-manual-intervention` only with explicit authorization. This remains the rule for
  ordinary Dependabot handling, including `custom-dependency-pr-solver`.

### Greenkeeper conflict exception

This is the only exception to the default conflict-abort rule. It applies to Greenkeeper dependency health
and PR tasks, including local rebases of `maintenance/dependencies`, only when
`GREENKEEPER_MAINTENANCE_ENABLED == 'true'` and the runner enforces a declared file scope and finite attempt
budget. Missing enablement, scope, budget, or enforcement means abort and escalate; the flag alone does not
establish runtime readiness. Do not enable the flag or widen these bounds to complete a task.

1. Work only in the task's isolated local candidate at the supplied original head and base head. Never resume
   another paused rebase, modify another worktree, merge the base branch, or skip dependency commits to bypass
   a conflict. The attempt budget covers the whole task, not a fresh allowance for each replayed commit.
2. Resolve intended source and dependency inputs first, including manifests and shared catalogs. Resolve only
   when the supplied commits and repository guidance establish the intended result without guessing versions,
   dependency intent, or unrelated code/configuration changes. All edits, including generated output and required
   release artifacts, must stay inside the declared scope.
3. Regenerate generated lockfiles with the repository-pinned package manager: use `pnpm install` for this
   repository after resolving the inputs. Never hand-merge lockfile hunks or fabricate resolutions, versions,
   or integrity hashes. If pnpm cannot regenerate safely within scope and budget, abort and escalate.
4. After the complete rebase, require `pnpm install --frozen-lockfile` and the full
   `pnpm test && pnpm build && pnpm -w check` validation. Preserve the changeset decision above and all required
   release artifacts; resolving a conflict does not waive them. Check the generated diff against the intended
   dependency changes and scope before reporting a candidate.
5. On unsupported or ambiguous conflicts, exceeded scope/budget, or failed regeneration/validation, abort any
   active candidate rebase and report an explicit `blocked` or `failed` result with `HOLD`, the reason, logs,
   and checks that failed or were not run. Do not offer a partial or unvalidated candidate as publishable.
   Leave remote branches unchanged and escalate for manual handling.
6. The runner writes evidence (`run.json`, `comment.md`, logs and, only for a successful changed candidate,
   an optional `candidate.bundle`); it must not push, post comments, label PRs, or merge. Only the authorized
   host may publish after verifying the reported outcome, file scope, validation, release artifacts, exact
   original head and current base freshness. A changed head or base invalidates the candidate and requires
   a fresh task, not reuse of stale evidence. Pushes must use an explicit expected-head lease; guarded squash
   auto-merge still requires the verdict/confidence contract, current-head CI and all required reviews/checks.

This policy does not enable Greenkeeper, implement runner enforcement, or authorize publication. The existing
write-enabled maintenance sync workflow still fails on conflicts without resolving them. Keep repository-specific
dependency and release rules here rather than copying Framework logic into the generic Greenkeeper runner.

## Merge strategy

- Use **squash merge** for dependency PRs.
- Keep the commit message concise: `chore(deps): bump <package> from <old> to <new>`.

## Review decision contract

Follow the installed `fusion-dependency-review` skill for recommendation, confidence, and
readiness semantics. Repository-specific readiness requires:

- `pnpm test && pnpm build && pnpm -w check` passes
- required approving reviews are present
- required changesets exist
- the branch is mergeable

Pending checks or approval affect readiness only. Relevant validation failures set readiness to
`needs changes`; optional automation failures are not merge blockers.

## Safety

- Never auto-merge just because the update is small.
- Never assume CI is green without checking actual status.
- Never suppress reviewer or maintainer concerns for convenience.
- Never create a merge commit by merging the base branch into a Dependabot PR branch.