---
"@equinor/fusion-framework-lint-rules": minor
"@equinor/fusion-framework-lint-config": minor
---

Add `require-intent-comment/object-merge` rule, enabled by default in the `recommended` config at `warn` severity.

The rule flags multi-source object merges that are missing an intent comment:

- `Object.assign(target, sourceA, sourceB, ...)` calls with two or more source arguments.
- Object or array literals spreading two or more sources, e.g. `{ ...a, ...b }` or `[...a, ...b]`.

Two-argument `Object.assign()` calls (simple clones/patches) and single-spread-plus-overrides literals (the common immutable-update pattern, e.g. `{ ...state, enabled: true }`) are intentionally not flagged, so the rule only fires on genuine multi-source merges where key precedence matters.
