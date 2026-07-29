---
"@equinor/fusion-framework-react-app": patch
---

Internal: remove a stray `eslint-disable-next-line` comment (repo uses Biome, not ESLint) that was breaking TSDoc adjacency for `useBookmark`, replacing the unused generic with Biome's `_`-prefix convention, to satisfy the `require-hook-tsdoc` lint rule. No functional change.
