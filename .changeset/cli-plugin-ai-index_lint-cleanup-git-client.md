---
"@equinor/fusion-framework-cli-plugin-ai-index": patch
---

Internal: add clarifying intent comments in `utils/git/metadata.ts` and `utils/git/status.ts`, and split `utils/git/git-client.ts` so `resolveProjectRoot` moves into its own `resolve-project-root.ts` module alongside the single-export `getGit` in `git-client.ts`, re-exported from the existing barrel; no public API or behavior changes.
