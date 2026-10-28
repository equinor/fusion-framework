# Dependency Reviews

How dependency update PRs are reviewed and merged in the Fusion Framework monorepo.

## Overview

Dependency updates arrive primarily through Dependabot PRs. The repository supports two workflows:

| Workflow | Skill | Use case |
|----------|-------|----------|
| Single-PR deep review | `fusion-dependency-review` | Detailed multi-lens analysis of one dependency update |
| Batch processing | `custom-dependency-pr-solver` | Process and auto-merge multiple safe Dependabot PRs |

Both workflows follow the [Dependabot instructions](../.github/instructions/dependabot-pr.instructions.md).
Opt-in Greenkeeper tasks use the same policy with the bounded local conflict exception described below;
they do not grant the ordinary batch solver permission to resolve conflicts.

## Review process

1. **Research** — Identify the dependency, version range, upstream changelog, breaking changes, and security advisories.
2. **Existing discussion** — Read all PR comments and review threads before analysis. Prior maintainer decisions take priority.
3. **Lens analysis** — Evaluate security posture, code quality / upstream stability, and repository impact.
4. **Verdict** — Produce a recommendation with confidence level and follow-up items.
5. **Maintainer confirmation** — Never merge without explicit approval.

## AI review scheduling

Dependabot AI research uses one repository-wide concurrency slot, shared by
automatic reviews and manually dispatched research, maintenance, and resolution runs.
Only one `research` job can run at a time, including its model calls. Publishing
and branch maintenance remain outside that slot and retain the existing per-PR gates.

The job uses `queue: max` with `cancel-in-progress: false`, so bursts across PRs
wait rather than replacing pending research jobs. GitHub allows up to 100 pending
jobs in the group; additional jobs are canceled when that queue is full.
The existing workflow-level concurrency still coalesces pending runs for the same
PR and operation category.

This limits simultaneous reviews, not tokens per minute. A single review or other
workflows sharing the model quota can still receive a 429 response; serialization
does not replace bounded retry handling or provider quota management.

See [GitHub's concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
for queue behavior and capacity.

## Changeset requirements

A changeset is mandatory when the dependency update touches a published package. See the [changeset guide](changeset.md) and the changeset decision section in `.github/instructions/dependabot-pr.instructions.md` for details.

**Quick rules:**

- Published packages (`packages/*/` with `publishConfig`) → changeset required.
- Cookbook packages (`cookbooks/*/`) → changeset required (even for dev dependencies).
- Lockfile-only changes with no manifest edits → changeset not required.
- Dev-dependency-only changes in non-cookbook packages → changeset not required.

**Format for dependency bumps:**

```markdown
---
"@equinor/<package-name>": patch
---

Internal: bump `<dependency>` from `<old>` to `<new>`.
```

## Validation

### React runtime updates

Direct dependencies on `react`, `react-dom`, `@types/react`, and `@types/react-dom`
use `catalog:react`. Their shared versions live in the named `react` catalog in
[`pnpm-workspace.yaml`](../pnpm-workspace.yaml). React and React DOM require
**exactly matching installed runtime versions**, so both runtime entries are
pinned to the same exact version rather than independently resolved ranges.
The type packages have their own version cadence and need not equal the runtime version.
Consumer-facing peer dependency ranges remain unchanged.

Dependabot groups the four catalog dependencies in one update. For manual
updates, change the catalog entries together and regenerate the lockfile with
`pnpm install`; do not introduce per-package runtime versions. pnpm resolves
catalog references to concrete version specifiers when packing published libraries.

Do not suppress browser tests or classify a deterministic version mismatch as a
flaky first render. Existing split Dependabot branches need a maintainer-approved
refresh or replacement; the catalog migration does not repair them retroactively.

### Full validation

Run the full suite before recommending merge:

```bash
pnpm test && pnpm build && pnpm -w check
```

`pnpm -w check` runs Biome lint and format checks at the workspace root.

## Branch management

- **Rebase only** — never merge the base branch into a Dependabot PR branch.
- Reinstall after rebase: `pnpm install --frozen-lockfile`. If the lockfile drifts, resolve intended dependency
  inputs, regenerate with `pnpm install`, repeat the frozen install, and run full validation before publication.
- Publish only with authorization and `git push --force-with-lease`; Greenkeeper runners never push.
- Ordinary Dependabot handling, including the batch solver, must abort conflicting rebases and report manual
  intervention. PR labels and comments still require explicit authorization.

### Opt-in Greenkeeper conflict resolution

Only when `GREENKEEPER_MAINTENANCE_ENABLED == 'true'` and the runner enforces its declared file scope and finite
whole-task attempt budget may Greenkeeper dependency health or PR tasks attempt local conflict resolution.
Follow the canonical [Greenkeeper conflict exception](../.github/instructions/dependabot-pr.instructions.md#greenkeeper-conflict-exception).
This includes local maintenance-stream candidates, not automatic resolution in the existing write-enabled sync job.

Resolve intended source, manifests, and catalogs first. Regenerate lockfiles with repository-pinned pnpm;
never hand-merge generated resolutions or invent versions, integrity hashes, or dependency intent. Missing
enablement or enforced bounds, ambiguous inputs, unsupported conflicts, exceeded scope/budget, and failed
regeneration or validation all require manual fallback and an explicit `blocked`/`failed` result with `HOLD`.
Record reasons and checks not run; do not publish partial results.

A resolved candidate still needs a frozen install, full `pnpm test && pnpm build && pnpm -w check` validation,
and required changesets/release artifacts, all within scope. The runner produces evidence and an optional
successful candidate bundle only. Publication belongs to the authorized host, which must verify the exact
original head, current base freshness, candidate scope, artifacts and validation before an expected-head leased
push. Stale heads or bases require a fresh task. Guarded squash auto-merge retains required current-head CI,
reviews/checks, and verdict/confidence gates. This policy neither enables Greenkeeper nor proves runtime readiness.

## Merge strategy

Use **squash merge** with a conventional commit message:

```
chore(deps): bump <package> from <old> to <new>
```

## Confidence levels

| Level | Criteria | Action |
|-------|----------|--------|
| **High** | Patch/minor bump, no breaking changes, no advisories, validation passes, no unresolved comments | Safe to recommend merge |
| **Medium** | Minor bump with new features, recent release (< 48h), broad consumer surface | Review recommended before merge |
| **Low** | Major bump, breaking changes, validation failures, security advisories, unresolved rebase conflicts | Hold and flag for maintainer |

## Safety rules

- Never auto-merge just because the update is small.
- Never assume CI is green — always check actual status.
- Never suppress reviewer or maintainer concerns.
- Never create merge commits on Dependabot branches.
