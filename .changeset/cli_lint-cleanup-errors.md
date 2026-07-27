---
"@equinor/fusion-framework-cli": patch
---

Internal: fix fusion-lint ERROR-severity findings in the CLI package — added missing intent
comments around dangerous `as unknown as T` type assertions, replaced a silently-swallowed
empty catch block with an explanatory comment, and removed separate `export { ... }`
statements in favor of inline/re-export exports (`assert.ts`, `format.ts`). Also removed a
roundabout `chalk` re-export chain in `format.ts`/`utils/index.ts` in favor of importing
`chalk` directly where it's used. No public API or behavior changes.
