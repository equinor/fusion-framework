# Merge Confidence Criteria

## High confidence — auto-merge candidate

All of the following must be true:

- [ ] Patch or minor version bump (no major)
- [ ] No breaking changes identified in upstream changelog
- [ ] No security advisories on the target version
- [ ] All validation passes: `pnpm build && pnpm test && pnpm -w check`
- [ ] No unresolved reviewer comments on the PR
- [ ] Change scope is lockfile-only or minimal manifest change
- [ ] Upstream release is at least 48 hours old
- [ ] Dependency is not a critical runtime dependency with broad consumer surface

## Medium confidence — report only

One or more of the following:

- Minor version bump with new features (but no breaking changes)
- Validation passes with non-blocking warnings
- Upstream release is very recent (< 48 hours)
- Dependency has broad consumer surface but change is backward-compatible
- Changeset was required and created, but the impact scope is unclear

## Low confidence — skip and flag

One or more of the following:

- Major version bump
- Breaking changes identified upstream
- Validation failures (build, test, or lint)
- Security advisory exists on either the current or target version
- Unresolved reviewer comments or maintainer concerns
- Rebase conflicts that could not be resolved automatically
- Dependency is deprecated or has known stability issues
- Multiple interdependent packages affected with unclear interaction

## Overrides

The user may override the confidence threshold:

- `--merge-medium`: also auto-merge medium-confidence PRs
- Review-only mode: skip all merges regardless of confidence
- Explicit PR exclusion: skip specific PRs from auto-merge
