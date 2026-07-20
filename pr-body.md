## Skills Upgrade

Automated run of `npx skills update` to update agent skills to their latest versions.
**Date:** 2026-07-20 09:04 UTC
**Node version:** 24

## Summary
- Changed / added skills: 3

## Updated Skills
- **fusion-github-review-resolution**
  <details><summary>CHANGELOG additions for fusion-github-review-resolution</summary>

## 0.1.8 - 2026-07-03
### patch
- [#197](https://github.com/equinor/fusion-skills/pull/197) [`380c0a1`](https://github.com/equinor/fusion-skills/commit/380c0a18d417f1c8003b91eae127ec9d8b450622) Thanks [@alftore](https://github.com/alftore)! - Skip the worktree question when already on the PR's head branch
  Step 1 now checks whether the current checkout's branch matches the PR's head
  branch before asking about a dedicated git worktree. If they match, the skill
  proceeds directly instead of asking a redundant question; the worktree
  question is only asked when the branch differs or the workspace is on a
  shared/long-lived branch.

</details>

- **fusion-mcp**
  <details><summary>CHANGELOG additions for fusion-mcp</summary>

## 1.0.2 - 2026-07-03
### patch
- [#197](https://github.com/equinor/fusion-skills/pull/197) [`380c0a1`](https://github.com/equinor/fusion-skills/commit/380c0a18d417f1c8003b91eae127ec9d8b450622) Thanks [@alftore](https://github.com/alftore)! - Fix outdated hosted-server config
  The one-click install links and manual JSON config were missing the required
  `oauth.clientId` field, and only covered Prod (no NonProd link). Both are now
  aligned with the upstream README.

</details>

- **fusion-skill-authoring**
  <details><summary>CHANGELOG additions for fusion-skill-authoring</summary>

## 0.3.5 - 2026-07-03
### patch
- [#197](https://github.com/equinor/fusion-skills/pull/197) [`380c0a1`](https://github.com/equinor/fusion-skills/commit/380c0a18d417f1c8003b91eae127ec9d8b450622) Thanks [@alftore](https://github.com/alftore)! - Detect installed-copy provenance before editing an existing skill
  Adds a new Step 1 that checks `skills-lock.json` before editing an existing
  `SKILL.md` or its supporting files. If the target matches a locked entry whose
  `source` differs from the current repository, it is an installed copy — the
  skill now surfaces the source repo and redirects there (or offers to draft an
  issue) instead of silently editing a copy that would be overwritten on the
  next update.

</details>

