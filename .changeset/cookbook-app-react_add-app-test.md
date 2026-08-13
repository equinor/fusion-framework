---
"@equinor/fusion-framework-cookbook-app-react": patch
---

Internal: add Vitest coverage for the `App` component and wire the cookbook into the root Vitest project list. Also silences `src/config.ts`'s demo lifecycle `console.log` calls (kept as commented-out examples) so they don't clutter Vitest output; no other runtime changes.
