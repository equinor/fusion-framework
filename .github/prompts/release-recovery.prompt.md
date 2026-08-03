---
description: Diagnose and recover from a partial or failed npm release
name: Release Recovery Prompt
---

# Recover a partial release

Use when the `ci` workflow tagged packages but some never reached npm, or when
`changeset:publish` failed partway through.

## 1. Establish what was tagged versus what was published

```bash
# Tags the release pushed
git fetch --tags && git tag --points-at origin/main

# Ask the registry what actually exists
npm view <package-name> version
```

Build the list of packages that have a git tag but return `404` from the registry.
That set — not the workflow log — is the real damage.

## 2. Find the first failure in the workflow log

```bash
gh run list --workflow ci.yml --limit 5
gh run view <run-id> --log-failed
```

Publishing is sequential: the **first** failing package is the cause; everything after
it was skipped, not independently broken.

## 3. Classify the root cause

| Symptom in the log | Likely cause |
| --- | --- |
| `TS2307: Cannot find module '@equinor/…'` during `prepack` | Missing `references` in that package's `tsconfig.json` |
| `ENEEDAUTH` / `401` | `NPM_AUTH_TOKEN` expired |
| `You cannot publish over the previously published versions` | Tag already consumed; needs a version bump, not a retry |

`prepack` runs `tsc -b` **in isolation per package**, so a full local build will not
reproduce a missing-project-reference failure. Reproduce it with:

```bash
pnpm clean:build
pnpm --filter <package> exec tsc -b --force
```

## 4. Fix, then verify in isolation

Fix the root cause on a branch off `main`. Re-run the isolated build for **each** affected
package individually — not one repo-wide build, which masks the failure mode.

## 5. Recover the unpublished packages

After the fix merges, the tagged-but-unpublished packages still need to reach npm. Confirm
the intended recovery path with the user before acting — options differ in blast radius:

- a follow-up patch release for the affected packages, or
- a manual `pnpm publish -r` for the specific packages from a clean checkout of the tag.

Never force-push tags or delete published versions without explicit approval.
