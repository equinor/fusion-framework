---
"@equinor/fusion-framework-lint-rules": patch
---

Fixed `single-export-per-file` false positives on the `@fusionElement` custom-element registration pattern:

- Barrel files (`index.ts`, `index.tsx`, `index.mts`, `index.cts`) now stay exempt from the rule even when a repo's config overrides `options.match` — previously only the default (unconfigured) matcher included the barrel exemption.
- A companion top-level `const`/`let` that only parameterizes an `export default class ... {}` (e.g. a `tag` string used by `@fusionElement(tag)`) no longer counts as a competing export.
